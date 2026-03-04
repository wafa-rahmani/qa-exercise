const { test, expect } = require('../fixtures/request');
const {
    sendInvalidJsonRequest,
    LoginToProxy,
    getResponseBody,
    validateProxyResponse,
} = require('../utils/apiHelper');
const config = require('../utils/config.json');
const testData = require('../utils/testData.json');

/**
 * PROXY TESTS
 * 
 * These tests validate all proxy functionality including:
 * - Request validation from clients
 * - Response transformation and field filtering
 * - General proxy behavior and edge cases
 */

// ============================================================================
// CLIENT <==> PROXY: Request Validation Tests
// ============================================================================

test('CLIENT to PROXY: user key present in request - should accept', async ({ proxyClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await LoginToProxy(
        proxyClient,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);
});

test('CLIENT to PROXY: user key missing in request - should return 400', async ({ proxyClient }) => {
    const invalidRequest = testData.invalidRequests.missingUserKey;
    const response = await proxyClient.post(config.endpoints.login, {
        data: invalidRequest.data,
    });

    expect(response.status()).toBe(invalidRequest.expectedStatus);
});

test('CLIENT to PROXY: password key missing in request - should return 400', async ({ proxyClient }) => {
    const invalidRequest = testData.invalidRequests.missingPasswordKey;
    const response = await proxyClient.post(config.endpoints.login, {
        data: invalidRequest.data,
    });

    expect(response.status()).toBe(invalidRequest.expectedStatus);
});

test('CLIENT to PROXY: invalid JSON format - should return 400', async ({ proxyClient }) => {
    const response = await sendInvalidJsonRequest(
        proxyClient,
        config.endpoints.login,
        'not-a-json-body'
    );

    expect(response.status()).toBe(400);
});

// ============================================================================
// PROXY <==> CLIENT: Response Validation Tests
// ============================================================================

test('PROXY to CLIENT: user key removed from response', async ({ proxyClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await LoginToProxy(
        proxyClient,
        validUser.user,
        validUser.password
    );

    expect(response.status()).toBe(200);

    const body = await getResponseBody(response);
    const validation = validateProxyResponse(body);

    expect(validation.userRemoved).toBe(true);
    expect(body.user).toBeUndefined();
});

test('PROXY to CLIENT: other fields preserved in response', async ({ proxyClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await LoginToProxy(
        proxyClient,
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

// ============================================================================
// Edge Cases Tests
// ============================================================================

test('EDGE CASE: unknown API path returns 404', async ({ proxyClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await proxyClient.post(config.endpoints.unknown, {
        data: {
            user: validUser.user,
            password: validUser.password
        }
    });

    expect(response.status()).toBe(404);
});

test('EDGE CASE: multiple valid users can authenticate', async ({ proxyClient }) => {
    for (const validUser of Object.values(testData.validUsers)) {
        const response = await LoginToProxy(
            proxyClient,
            validUser.user,
            validUser.password
        );

        expect(response.status()).toBe(200);

        const body = await getResponseBody(response);
        
        expect(body.user).toBeUndefined();
        expect(body.token).toBeTruthy();
    }
});
