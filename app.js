// Configuration
const CONFIG = {
    // This will be replaced with the actual API endpoint in the Netlify function
    API_ENDPOINT: '/.netlify/functions/monday-api'
};

// State management
let currentCustomerId = null;

// DOM Elements
const customerInputSection = document.getElementById('customerInputSection');
const shipmentsSection = document.getElementById('shipmentsSection');
const customerForm = document.getElementById('customerForm');
const customerIdInput = document.getElementById('customerIdInput');
const logoutBtn = document.getElementById('logoutBtn');
const shipmentsGrid = document.getElementById('shipmentsGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const customerName = document.getElementById('customerName');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check for unique customer code in URL parameter (preferred)
    const urlParams = new URLSearchParams(window.location.search);
    const uniqueId = urlParams.get('code');
    if (uniqueId) {
        resolveUniqueIdAndLoad(uniqueId);
    } else {
        // Fallback: legacy ?customer=
        const customerIdFromUrl = urlParams.get('customer');
        if (customerIdFromUrl) {
            loadShipments(customerIdFromUrl);
        }
    }

    // Handle form submission
    customerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = customerIdInput.value.trim();
        if (!value) return;
        if (value.includes('-') || value.length >= 4) {
            // Treat as unique code by default
            resolveUniqueIdAndLoad(value);
        } else {
            loadShipments(value);
        }
    });

    // Handle logout
    logoutBtn.addEventListener('click', () => {
        resetApp();
    });
});

// Load shipments from Monday.com
async function loadShipments(customerId) {
    currentCustomerId = customerId;
    
    // Update UI
    customerInputSection.style.display = 'none';
    shipmentsSection.style.display = 'block';
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    emptyState.style.display = 'none';
    shipmentsGrid.innerHTML = '';
    
    customerName.textContent = `משלוחים עבור: ${customerId}`;

    try {
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customerId })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch shipments');
        }

        const data = await response.json();
        
        loadingState.style.display = 'none';

        if (data.error) {
            throw new Error(data.error);
        }

        const shipments = data.shipments || [];

        if (shipments.length === 0) {
            emptyState.style.display = 'block';
        } else {
            displayShipments(shipments);
        }

    } catch (error) {
        console.error('Error loading shipments:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
}

// Resolve uniqueId -> customerName via serverless mapping API
async function resolveUniqueIdAndLoad(uniqueId) {
    try {
        const res = await fetch('/.netlify/functions/customer-map?uniqueId=' + encodeURIComponent(uniqueId));
        if (!res.ok) throw new Error('Invalid code');
        const { customerName } = await res.json();
        loadShipments(customerName);
    } catch (e) {
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
}

// Display shipments in the grid
function displayShipments(shipments) {
    shipmentsGrid.innerHTML = '';

    // Group by status
    const groups = shipments.reduce((acc, s) => {
        const status = (s.columns?.status || s.status || 'ללא סטטוס');
        if (!acc[status]) acc[status] = [];
        acc[status].push(s);
        return acc;
    }, {});

    Object.entries(groups).forEach(([status, list]) => {
        const section = document.createElement('div');
        section.className = 'accordion-section';

        const header = document.createElement('button');
        header.className = 'btn btn-secondary';
        header.style.margin = '10px 0';
        header.textContent = `${status} (${list.length})`;

        const content = document.createElement('div');
        content.style.display = 'none';
        content.style.marginBottom = '15px';

        header.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });

        list.forEach(shipment => {
            const card = createShipmentCard(shipment);
            content.appendChild(card);
        });

        section.appendChild(header);
        section.appendChild(content);
        shipmentsGrid.appendChild(section);
    });
}

// Column display labels (Hebrew/English)
const COLUMN_LABELS = {
    containerNumber: 'מס\' מכולה',
    blNumber: 'מס\' BL',
    eta: 'תאריך אספקה משוער',
    requestedDeliveryDate: 'תאריך אספקה מבוקש',
    vesselName: 'שם אונייה',
    status: 'סטטוס',
    description: 'תיאור',
    material: 'חומר',
    documentUrl: 'מסמכים'
};

// Create a shipment card element
function createShipmentCard(shipment) {
    const card = document.createElement('div');
    card.className = 'shipment-card';

    const header = document.createElement('div');
    header.className = 'shipment-header';

    const title = document.createElement('div');
    title.className = 'shipment-title';
    title.textContent = shipment.name || 'N/A';

    // Get status from columns object or direct property
    const statusValue = shipment.columns?.status || shipment.status;
    if (statusValue && statusValue !== 'N/A' && statusValue) {
        const status = document.createElement('div');
        status.className = `shipment-status ${getStatusClass(statusValue)}`;
        status.textContent = statusValue;
        header.appendChild(status);
    }

    header.appendChild(title);

    const details = document.createElement('div');
    details.className = 'shipment-details';

    // Show only requested fields
    const fieldsOrder = [
        ['shipmentNumber', "מספר משלוח"],
        ['materialCategory', "קטגוריית חומר"],
        ['eta', "תאריך אספקה בוקינג ETA"],
        ['containerNumber', "מס' מכולה / בוקינג"],
    ];

    fieldsOrder.forEach(([key, label]) => {
        const value = shipment.columns?.[key];
        if (value && value !== 'N/A') {
            details.appendChild(createDetailItem(label, value));
        }
    });

    card.appendChild(header);
    card.appendChild(details);

    return card;
}

// Create a detail item
function createDetailItem(label, value) {
    const item = document.createElement('div');
    item.className = 'detail-item';

    const labelEl = document.createElement('div');
    labelEl.className = 'detail-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('div');
    valueEl.className = 'detail-value';
    valueEl.textContent = value;

    item.appendChild(labelEl);
    item.appendChild(valueEl);

    return item;
}

// Create a link detail
function createLinkDetail(label, url) {
    const item = document.createElement('div');
    item.className = 'detail-item';

    const labelEl = document.createElement('div');
    labelEl.className = 'detail-label';
    labelEl.textContent = label;

    const link = document.createElement('a');
    link.className = 'detail-link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = url;

    item.appendChild(labelEl);
    item.appendChild(link);

    return item;
}

// Get CSS class for status
function getStatusClass(status) {
    if (!status) return 'status-active';
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('pending') || lowerStatus.includes('waiting')) {
        return 'status-pending';
    }
    if (lowerStatus.includes('complete') || lowerStatus.includes('delivered')) {
        return 'status-completed';
    }
    return 'status-active';
}

// Reset app to initial state
function resetApp() {
    currentCustomerId = null;
    shipmentsGrid.innerHTML = '';
    customerIdInput.value = '';
    customerInputSection.style.display = 'block';
    shipmentsSection.style.display = 'none';
    
    // Clear URL parameter
    window.history.replaceState({}, document.title, window.location.pathname);
}
