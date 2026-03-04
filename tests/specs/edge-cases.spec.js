const { test, expect } = require('../fixtures/test-base');
const {
    sendLoginRequest,
    getResponseBody,
} = require('../utils/apiHelper');
const testData = require('../utils/testData.json');

/**
 * Additional Edge Cases Tests
 * 
 * These tests cover additional scenarios and edge cases for robust proxy validation.
 */

test('EDGE CASE: unknown API path returns 404', async ({ apiClient }) => {
    const validUser = testData.validUsers[0];
    const response = await sendLoginRequest(
        apiClient,
        testData.endpoints.unknown,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(404);
});

test('EDGE CASE: multiple valid users can authenticate', async ({ apiClient }) => {
    for (const validUser of testData.validUsers) {
        const response = await sendLoginRequest(
            apiClient,
            testData.endpoints.login,
            validUser.user,
            validUser.password
        );

        expect(response.status()).toBe(200);

        const body = await getResponseBody(response);
        
        expect(body.user).toBeUndefined();
        expect(body.token).toBeTruthy();
    }
});
