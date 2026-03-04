const { test: base, expect, request } = require('@playwright/test');

const test = base.extend({
  proxyClient: async ({}, use) => {
    const client = await request.newContext({ baseURL: 'http://127.0.0.1:8000' });
    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },

  downstreamClient: async ({}, use) => {
    const client = await request.newContext({ baseURL: 'http://127.0.0.1:8085' });
    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },
});

module.exports = { test, expect };
