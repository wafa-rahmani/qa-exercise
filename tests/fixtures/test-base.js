const { test: base, expect, request } = require('@playwright/test');
// Use the downstream server implementation from the project root.
const { createProxyDownstreamServer } = require('../../downstreamServer');

const test = base.extend({

  downstreamServer: [
    async ({}, use) => {
      const server = createProxyDownstreamServer();

      await new Promise(resolve => {
        server.listen(8085, '127.0.0.1', () => resolve());
      });

      await use(server);

      await new Promise((resolve, reject) => {
        server.close(err => (err ? reject(err) : resolve()));
      });
    },
    { scope: 'worker', auto: true },
  ],

  apiClient: async ({}, use) => {
    const client = await request.newContext({ baseURL: 'http://127.0.0.1:8000' });
    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },
});

module.exports = { test, expect };
