const { test, expect } = require('../fixtures/test-base');
const {
    sendLoginRequest,
    getResponseBody,
} = require('../utils/apiHelper');
const testData = require('../utils/testData.json');

/**
 * DOWNSTREAM <==> PROXY: Response Analysis Tests
 * 
 * These tests validate how the proxy processes responses from the downstream server.
 * Covers requirement 4: Response must contain user key from downstream.
 */

test('DOWNSTREAM to PROXY: response contains user key - should process', async ({ apiClient }) => {
    const validUser = testData.validUsers[1];
    const response = await sendLoginRequest(
        apiClient,
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
