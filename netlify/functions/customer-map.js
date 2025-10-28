// Admin API to manage mapping between uniqueId -> customerName
// Protect with ADMIN_TOKEN env var. Data stored in Netlify Blobs (key-value JSON)

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
    const { Blob } = await import('node:buffer'); // placeholder to keep bundler happy
    // Use KV via environment. We'll store JSON in a file in a simple way using Netlify Blobs API via fetch

    async function readMap() {
        try {
            const res = await fetch(process.env.BLOBS_READ_URL);
            if (!res.ok) return {};
            return await res.json();
        } catch {
            return {};
        }
    }

    async function writeMap(obj) {
        await fetch(process.env.BLOBS_WRITE_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj),
        });
    }

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

    // Admin operations require Authorization: Bearer <ADMIN_TOKEN>
    const auth = event.headers.authorization || '';
    if (!auth.startsWith('Bearer ') || auth.slice(7) !== ADMIN_TOKEN) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const map = await readMap();

    if (event.httpMethod === 'POST') {
        // Add or update
        const { uniqueId, customerName } = body;
        if (!uniqueId || !customerName) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'uniqueId and customerName required' }) };
        }
        map[uniqueId.trim()] = customerName.trim();
        await writeMap(map);
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'DELETE') {
        const { uniqueId } = body;
        if (!uniqueId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'uniqueId required' }) };
        }
        delete map[uniqueId.trim()];
        await writeMap(map);
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (event.httpMethod === 'GET') {
        // List all (admin)
        return { statusCode: 200, headers, body: JSON.stringify(map) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};


