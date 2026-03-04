const { test, expect } = require('../fixtures/test-base');
const {
    sendPostRequest,
    sendProxyToDownstreamLoginRequest,
    getResponseBody,
} = require('../utils/apiHelper');
const testData = require('../utils/testData.json');

/**
 * PROXY <==> DOWNSTREAM: Request Format Tests
 * 
 * These tests validate how the proxy forwards requests to the downstream server.
 * Ensures the proxy correctly sends the user key and handles downstream validation.
 */

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
