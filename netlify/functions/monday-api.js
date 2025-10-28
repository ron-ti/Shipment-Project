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
        console.log('Event body:', event.body);
        
        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (e) {
            console.error('Failed to parse body:', e);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request format' }),
            };
        }
        
        const { customerId } = requestData;

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

        console.log('API Token exists:', !!MONDAY_API_TOKEN);
        console.log('Board ID:', MONDAY_BOARD_ID);

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
        const boardId = MONDAY_BOARD_ID.trim();
        const query = `
            query {
                boards(ids: [${boardId}]) {
                    name
                    items_page(limit: 500) {
                        items {
                            id
                            name
                            column_values {
                                id
                                column {
                                    title
                                }
                                text
                                value
                            }
                        }
                    }
                }
            }
        `;
        
        console.log('Query:', query);

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

        console.log('Monday API response:', JSON.stringify(data, null, 2));

        if (data.errors) {
            console.error('Monday API errors:', data.errors);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Failed to fetch data from Monday.com',
                    details: data.errors[0]?.message,
                    allErrors: data.errors
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
            'shipment number': 'shipmentNumber',
            'material category': 'materialCategory',
            
            // Hebrew column names - add your custom ones here
            'מס\' מכולה': 'containerNumber',
            'מס\' מכולה / בוקינג': 'containerNumber',
            'תאריך אספקה בוקינג eta': 'eta',
            'תאריך אספקה מבוקש': 'requestedDeliveryDate',
            'תיאור': 'description',
            'חומר': 'material',
            'קטגוריית חומר': 'materialCategory',
            'מספר משלוח': 'shipmentNumber',
            
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
            'לקוח',
            'לקוחות'
        ];

        // Process the data and filter by customer ID
        const board = data.data.boards[0];
        if (!board) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Board not found. Please check Board ID.' 
                }),
            };
        }
        
        const items = board.items_page?.items || [];
        
        if (items.length === 0) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ shipments: [] }),
            };
        }
        // Helper: normalize strings (remove spaces/punctuation, lowercase)
        const normalize = (s) => (s || '')
            .toString()
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0590-\u05FF]/g, (c) => c) // keep Hebrew
            .replace(/[^\p{L}\p{N}]+/gu, ' ')      // non letters/digits -> space
            .replace(/\s+/g, ' ')
            .trim();

        const normalizedRequested = normalize(customerId);

        let shipments = items
            .filter(item => {
                // Find the Customer ID column (supports titles like 'לקוח', 'Customer', 'Client')
                const customerIdColumn = item.column_values.find(col => {
                    const title = col.column?.title?.toLowerCase() || '';
                    return CUSTOMER_ID_COLUMNS.some(customerIdTitle => 
                        title.includes(customerIdTitle) || title === customerIdTitle
                    );
                });

                if (!customerIdColumn) return false;

                // Column text may contain multiple values (e.g., dropdown): "A, B"
                const raw = customerIdColumn.text || '';
                const parts = raw.split(/[,;\n]/).map(p => normalize(p)).filter(Boolean);
                if (parts.length === 0) return false;

                // Strict match: any part must equal requested id exactly (after normalization)
                return parts.some(p => p === normalizedRequested);
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
                    const title = col.column?.title?.toLowerCase() || '';
                    const fullTitle = col.column?.title || '';
                    
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
                    if (fullTitle === 'מס\' מכולה / בוקינג') {
                        shipment.columns.containerNumber = col.text || 'N/A';
                    }
                    if (fullTitle === 'תאריך אספקה בוקינג ETA') {
                        shipment.columns.eta = col.text || 'N/A';
                    }
                    if (fullTitle === 'Status') {
                        shipment.columns.status = col.text || 'N/A';
                    }
                });

                return shipment;
            });

        // Fallback: if nothing found, try matching any column text that equals the customer
        if (shipments.length === 0) {
            const fallbackItems = items.filter(item => {
                return item.column_values.some(col => normalize(col.text) === normalizedRequested);
            });
            shipments = fallbackItems.map(item => {
                const shipment = { id: item.id, name: item.name, columns: {} };
                item.column_values.forEach(col => {
                    const title = col.column?.title?.toLowerCase() || '';
                    if (title.includes('status')) shipment.columns.status = col.text || 'N/A';
                    if (title.includes('eta')) shipment.columns.eta = col.text || 'N/A';
                    if (title.includes('container') || col.column?.title === "מס' מכולה / בוקינג") shipment.columns.containerNumber = col.text || 'N/A';
                    if (title.includes('material') || col.column?.title === 'קטגוריית חומר') shipment.columns.materialCategory = col.text || 'N/A';
                    if (title.includes('shipment') || col.column?.title === 'מספר משלוח') shipment.columns.shipmentNumber = col.text || 'N/A';
                });
                return shipment;
            });
        }

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

