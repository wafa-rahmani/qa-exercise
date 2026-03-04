const { test, expect } = require('../fixtures/request');
const {
    LoginToProxy,
    LoginToDownstream,
    getResponseBody,
} = require('../utils/apiHelper');
const config = require('../utils/config.json');
const testData = require('../utils/testData.json');

/**
 * DOWNSTREAM SERVER TESTS
 * 
 * These tests validate all interactions with the downstream server including:
 * - How the proxy forwards requests to the downstream server
 * - How the proxy processes responses from the downstream server
 * - Downstream validation and error handling
 */

// ============================================================================
// PROXY <==> DOWNSTREAM: Request Format Tests
// ============================================================================

test('PROXY to DOWNSTREAM: sends user key to downstream server', async ({ proxyClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await LoginToProxy(
        proxyClient,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);

    const body = await getResponseBody(response);
    
    expect(body.token).toBeTruthy();
});

test('PROXY to DOWNSTREAM: error 400 if downstream validation fails', async ({ proxyClient }) => {
    const response = await proxyClient.post(config.endpoints.login, {
        data: testData.invalidFormats.missingPassword,
    });
    
    expect(response.status()).toBe(400);
});

// ============================================================================
// DOWNSTREAM <==> PROXY: Response Analysis Tests
// ============================================================================

test('DOWNSTREAM to PROXY: response contains user key - should process', async ({ downstreamClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await LoginToDownstream(
        downstreamClient,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);

    const body = await getResponseBody(response);
    
    expect(body.token).toBeTruthy();
    expect(body.password).toBe(validUser.password);
    expect(body.expires_in).toBe(3600);
});
