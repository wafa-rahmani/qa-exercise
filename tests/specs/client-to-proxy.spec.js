const { test, expect } = require('../fixtures/test-base');
const {
    sendPostRequest,
    sendInvalidJsonRequest,
    sendLoginRequest,
} = require('../utils/apiHelper');
const testData = require('../utils/testData.json');

/**
 * CLIENT <==> PROXY: Request Validation Tests
 * 
 * These tests validate how the proxy handles incoming requests from the client.
 * Covers requirements 1 & 2: JSON validation and user key presence.
 */

test('CLIENT to PROXY: user key present in request - should accept', async ({ apiClient }) => {
    const validUser = testData.validUsers[0];
    const response = await sendLoginRequest(
        apiClient,
        testData.endpoints.login,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);
});

test('CLIENT to PROXY: user key missing in request - should return 400', async ({ apiClient }) => {
    const invalidRequest = testData.invalidRequests[0];
    const response = await sendPostRequest(apiClient, testData.endpoints.login, invalidRequest.data);

    expect(response.status()).toBe(invalidRequest.expectedStatus);
});

test('CLIENT to PROXY: password key missing in request - should return 400', async ({ apiClient }) => {
    const invalidRequest = testData.invalidRequests[1];
    const response = await sendPostRequest(apiClient, testData.endpoints.login, invalidRequest.data);

    expect(response.status()).toBe(invalidRequest.expectedStatus);
});

test('CLIENT to PROXY: invalid JSON format - should return 400', async ({ apiClient }) => {
    const response = await sendInvalidJsonRequest(
        apiClient,
        testData.endpoints.login,
        'not-a-json-body'
    );

    expect(response.status()).toBe(400);
});
