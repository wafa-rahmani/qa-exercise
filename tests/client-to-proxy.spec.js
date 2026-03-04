const { test, expect } = require('../fixtures/test-base');
const {
    sendPostRequest,
    sendInvalidJsonRequest,
    sendProxyLoginRequest,
} = require('../utils/apiHelper');
const testData = require('../utils/testData.json');

/**
 * CLIENT <==> PROXY: Request Validation Tests
 * 
 * These tests validate how the proxy handles incoming requests from the client.
 * Covers requirements 1 & 2: JSON validation and user key presence.
 */

test('CLIENT to PROXY: user key present in request - should accept', async ({ proxyClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await sendProxyLoginRequest(
        proxyClient,
        testData.endpoints.login,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);
});

test('CLIENT to PROXY: user key missing in request - should return 400', async ({ proxyClient }) => {
    const invalidRequest = testData.invalidRequests.missingUserKey;
    const response = await sendPostRequest(proxyClient, testData.endpoints.login, invalidRequest.data);

    expect(response.status()).toBe(invalidRequest.expectedStatus);
});

test('CLIENT to PROXY: password key missing in request - should return 400', async ({ proxyClient }) => {
    const invalidRequest = testData.invalidRequests.missingPasswordKey;
    const response = await sendPostRequest(proxyClient, testData.endpoints.login, invalidRequest.data);

    expect(response.status()).toBe(invalidRequest.expectedStatus);
});

test('CLIENT to PROXY: invalid JSON format - should return 400', async ({ proxyClient }) => {
    const response = await sendInvalidJsonRequest(
        proxyClient,
        testData.endpoints.login,
        'not-a-json-body'
    );

    expect(response.status()).toBe(400);
});
