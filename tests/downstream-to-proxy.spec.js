const { test, expect } = require('../fixtures/test-base');
const {
    sendProxyLoginRequest,
    getResponseBody,
} = require('../utils/apiHelper');
const testData = require('../utils/testData.json');

/**
 * DOWNSTREAM <==> PROXY: Response Analysis Tests
 * 
 * These tests validate how the proxy processes responses from the downstream server.
 * Covers requirement 4: Response must contain user key from downstream.
 */

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
