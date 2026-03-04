const { test: base, expect, request } = require('@playwright/test');
const config = require('../utils/config.json');

const test = base.extend({
  proxyClient: async ({}, use) => {
    const client = await request.newContext({ baseURL: config.baseURL.proxy });
    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },

  downstreamClient: async ({}, use) => {
    const client = await request.newContext({ baseURL: config.baseURL.downstream });
    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },
});

module.exports = { test, expect };
