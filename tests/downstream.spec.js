const { test, expect } = require('../fixtures/test-base');
const {
    sendPostRequest,
    sendProxyLoginRequest,
    sendProxyToDownstreamLoginRequest,
    getResponseBody,
} = require('../utils/apiHelper');
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
    const response = await sendProxyToDownstreamLoginRequest(
        proxyClient,
        testData.endpoints.login,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);

    const body = await getResponseBody(response);
    
    expect(body.token).toBeTruthy();
});

test('PROXY to DOWNSTREAM: error 400 if downstream validation fails', async ({ proxyClient }) => {
    const response = await sendPostRequest(proxyClient, testData.endpoints.login, testData.invalidFormats.missingPassword);
    
    expect(response.status()).toBe(400);
});

// ============================================================================
// DOWNSTREAM <==> PROXY: Response Analysis Tests
// ============================================================================

test('DOWNSTREAM to PROXY: response contains user key - should process', async ({ proxyClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await sendProxyLoginRequest(
        proxyClient,
        testData.endpoints.login,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);

    const body = await getResponseBody(response);
    
    expect(body.token).toBeTruthy();
    expect(body.password).toBe(validUser.password);
    expect(body.expires_in).toBe(3600);
});
