// Netlify serverless function to proxy Monday.com API requests
// This keeps the API token secure on the server side

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    try {
        const { customerId } = JSON.parse(event.body);

        if (!customerId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Customer ID is required' }),
            };
        }

        // Get configuration from environment variables
        const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
        const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID;

        if (!MONDAY_API_TOKEN || !MONDAY_BOARD_ID) {
            console.error('Missing environment variables');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Server configuration error. Please check environment variables.' 
                }),
            };
        }

        // GraphQL query to fetch items from Monday.com
        const query = `
            query {
                boards(ids: [${parseInt(MONDAY_BOARD_ID)}]) {
                    items_page(limit: 500) {
                        cursor
                        items {
                            id
                            name
                            column_values {
                                id
                                title
                                text
                                value
                            }
                        }
                    }
                }
            }
        `;

        // Make request to Monday.com API
        const response = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_API_TOKEN,
            },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();

        if (data.errors) {
            console.error('Monday API errors:', data.errors);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Failed to fetch data from Monday.com',
                    details: data.errors[0]?.message 
                }),
            };
        }

        // CUSTOMIZE: Which columns to show to clients (Hebrew/English column names)
        const COLUMNS_TO_SHOW = {
            // English column names
            'container number': 'containerNumber',
            'container': 'containerNumber',
            'bl number': 'blNumber',
            'bill of lading': 'blNumber',
            'eta': 'eta',
            'vessel': 'vesselName',
            'vessel name': 'vesselName',
            'status': 'status',
            
            // Hebrew column names - add your custom ones here
            'מס\' מכולה': 'containerNumber',
            'מס\' מכולה / בוקינג': 'containerNumber',
            'תאריך אספקה בוקינג eta': 'eta',
            'תאריך אספקה מבוקש': 'requestedDeliveryDate',
            'תיאור': 'description',
            'חומר': 'material',
            
            // Documents and files
            'documents': 'documentUrl',
            'files': 'documentUrl',
            'monday doc v2': 'documentUrl',
        };
        
        // CUSTOMIZE: Customer ID column name (for filtering)
        const CUSTOMER_ID_COLUMNS = [
            'customer',
            'customer id',
            'client',
            'לקוח'
        ];

        // Process the data and filter by customer ID
        const items = data.data.boards[0]?.items_page?.items || [];
        const shipments = items
            .filter(item => {
                // Find the Customer ID column
                const customerIdColumn = item.column_values.find(col => {
                    const title = col.title?.toLowerCase() || '';
                    return CUSTOMER_ID_COLUMNS.some(customerIdTitle => 
                        title.includes(customerIdTitle) || title === customerIdTitle
                    );
                });
                
                if (!customerIdColumn) return false;
                
                // Check if the customer ID matches
                const itemCustomerId = customerIdColumn.text || '';
                return itemCustomerId.trim().toLowerCase() === customerId.trim().toLowerCase();
            })
            .map(item => {
                // Map column values to shipment object
                const shipment = {
                    id: item.id,
                    name: item.name,
                    columns: {} // Store all visible columns
                };

                // Extract specific column values based on configuration
                item.column_values.forEach(col => {
                    const title = col.title?.toLowerCase() || '';
                    
                    // Check if this column should be displayed
                    for (const [columnKey, fieldName] of Object.entries(COLUMNS_TO_SHOW)) {
                        if (title.includes(columnKey) || title === columnKey) {
                            // Handle document/file columns differently
                            if (fieldName === 'documentUrl') {
                                try {
                                    const valueObj = JSON.parse(col.value || '{}');
                                    shipment.columns[fieldName] = valueObj.text || valueObj.url || col.text;
                                } catch {
                                    shipment.columns[fieldName] = col.text;
                                }
                            } else {
                                shipment.columns[fieldName] = col.text || 'N/A';
                            }
                            break; // Found a match, no need to check more
                        }
                    }
                    
                    // Also check exact Hebrew title matches
                    if (col.title === 'מס\' מכולה / בוקינג') {
                        shipment.columns.containerNumber = col.text || 'N/A';
                    }
                    if (col.title === 'תאריך אספקה בוקינג ETA') {
                        shipment.columns.eta = col.text || 'N/A';
                    }
                    if (col.title === 'Status') {
                        shipment.columns.status = col.text || 'N/A';
                    }
                });

                return shipment;
            });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ shipments }),
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            }),
        };
    }
};

