const { test, expect } = require('../fixtures/test-base');
const {
    sendLoginRequest,
    sendProxyLoginRequest,
    getResponseBody,
} = require('../utils/apiHelper');
const testData = require('../utils/testData.json');

/**
 * Additional Edge Cases Tests
 * 
 * These tests cover additional scenarios and edge cases for robust proxy validation.
 */

test('EDGE CASE: unknown API path returns 404', async ({ proxyClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await sendProxyLoginRequest(
        proxyClient,
        testData.endpoints.unknown,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(404);
});

test('EDGE CASE: multiple valid users can authenticate', async ({ proxyClient }) => {
    for (const validUser of Object.values(testData.validUsers)) {
        const response = await sendProxyLoginRequest(
            proxyClient,
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
