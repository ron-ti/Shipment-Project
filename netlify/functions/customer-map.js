// Mapping API between uniqueId -> customerName
// Source of truth: customers.json (in repo root).
// To change mappings: edit customers.json and redeploy.

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
    const customers = require('../../customers.json');
    const readMap = async () => customers || {};

    // Public resolve endpoint (no admin): GET /customer-map?uniqueId=CODE
    if (event.httpMethod === 'GET' && event.queryStringParameters?.uniqueId) {
        const uniqueId = (event.queryStringParameters.uniqueId || '').trim();
        const map = await readMap();
        const customerName = map[uniqueId];
        if (!customerName) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Unknown uniqueId' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ customerName }) };
    }

    // Admin list of all mappings (read-only); edit customers.json to change
    if (event.httpMethod === 'GET') {
        if (event.queryStringParameters && event.queryStringParameters.uniqueId) {
            // handled above
        } else {
            const auth = event.headers.authorization || '';
            if (!auth.startsWith('Bearer ') || auth.slice(7) !== ADMIN_TOKEN) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
            }
            const map = await readMap();
            return { statusCode: 200, headers, body: JSON.stringify(map) };
        }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed. Edit customers.json and redeploy.' }) };
};


