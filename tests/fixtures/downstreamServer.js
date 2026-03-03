const http = require('http');

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

            if (req.url === '/api/login') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(
                    JSON.stringify({
                        user: body.user ?? 40,
                        token: 'abc123xyz',
                        expires_in: 3600,
                    })
                );
                return;
            }

            if (req.url === '/api/login-missing-user-in-response') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token: 'no-user-key', expires_in: 3600 }));
                return;
            }

            if (req.url === '/api/login-non-json-response') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('not-a-json-response');
                return;
            }
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        });
    });
}

module.exports = { createProxyDownstreamServer };
