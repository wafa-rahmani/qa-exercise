const { test, expect } = require('../fixtures/test-base');
const {
    sendLoginRequest,
    getResponseBody,
    validateProxyResponse,
} = require('../utils/apiHelper');
const testData = require('../utils/testData.json');

/**
 * PROXY <==> CLIENT: Response Validation Tests
 * 
 * These tests validate how the proxy transforms responses before sending to the client.
 * Covers requirement 5: User key must be removed from response.
 */

test('PROXY to CLIENT: user key removed from response', async ({ apiClient }) => {
    const validUser = testData.validUsers[2];
    const response = await sendLoginRequest(
        apiClient,
        testData.endpoints.login,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);

    const body = await getResponseBody(response);
    const validation = validateProxyResponse(body);

    expect(validation.userRemoved).toBe(true);
    expect(body.user).toBeUndefined();
});

test('PROXY to CLIENT: other fields preserved in response', async ({ apiClient }) => {
    const validUser = testData.validUsers[2];
    const response = await sendLoginRequest(
        apiClient,
        testData.endpoints.login,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);

    const body = await getResponseBody(response);

    expect(body.token).toBeTruthy();
    expect(typeof body.token).toBe('string');
    expect(body.password).toBe(validUser.password);
    expect(body.expires_in).toBe(3600);
});
