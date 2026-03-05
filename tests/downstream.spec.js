const { test, expect } = require('../fixtures/request.fixture');
const {
    login,
    getResponseBody,
} = require('../utils/apiHelper');
const config = require('../utils/config.json');
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

test('PROXY sends user key to downstream server', async ({ downstreamClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await login(
        downstreamClient,
        { user: validUser.user, password: validUser.password }
    );

    expect(response.status()).toBe(200);

});

// ============================================================================
// DOWNSTREAM <==> PROXY: Response Analysis Tests
// ============================================================================

test('DOWNSTREAM response contains user key', async ({ downstreamClient }) => {
    const validUser = testData.validUsers.user1;
    const response = await login(
        downstreamClient,
        { user: validUser.user, password: validUser.password }
    );

    expect(response.status()).toBe(200);
    
    const body = await getResponseBody(response);
    
    expect(body.user).toBe(validUser.user);
});
test('Error 400 if downstream validation fails', async ({ downstreamClient }) => {
    const response = await login(
        downstreamClient,
        testData.invalidFormats.missingUserKey
    );
    
    expect(response.status()).toBe(400);
});