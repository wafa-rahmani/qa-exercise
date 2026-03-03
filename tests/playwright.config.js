const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    outputDir: 'playwright-artifacts',
    use: {
        baseURL: process.env.PROXY_BASE_URL || 'http://localhost:8000',
        trace: 'on-first-retry',
    },
});
