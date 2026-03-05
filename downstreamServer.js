const http = require('http');

// Helper function to generate random token
function generateRandomToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to generate random user ID
function generateRandomUser() {
    return Math.floor(Math.random() * 10000) + 1;
}

function createProxyDownstreamServer() {
    return http.createServer((req, res) => {
        if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
        }

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            let body = {};
            try {
                body = rawBody ? JSON.parse(rawBody) : {};
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON received by downstream' }));
                return;
            }

            // Validate request body has required keys
            if (!('user' in body)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Missing 'user' key in request body" }));
                return;
            }

            if (!('password' in body)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Missing 'password' key in request body" }));
                return;
            }

            if (req.url === '/api/login') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(
                    JSON.stringify({
                        user: body.user ?? generateRandomUser(),
                        password: body.password,
                        token: generateRandomToken(),
                        expires_in: 3600,
                    })
                );
                return;
            }

            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        });
    });
}

module.exports = { createProxyDownstreamServer };
