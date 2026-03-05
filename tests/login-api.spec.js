const { test, expect } = require('../fixtures/request.fixture');
const { describe } = require('@playwright/test');
const {
    login,
    getResponseBody,
    validateProxyResponse,
} = require('../utils/apiHelper');
const config = require('../utils/config.json');
const testData = require('../utils/testData.json');

/**
 * API INTEGRATION TESTS
 * 
 * Complete test suite for the proxy server and downstream server interactions.
 * Tests cover: request validation, response transformation, server communications, and edge cases.
 */

describe('CLIENT ==> PROXY: Request Validation', () => {
   
    test('Valid request with user and password keys is accepted', async ({ proxyClient }) => {
        const response = await login(proxyClient, testData.validUsers.user1);

        expect(response.status()).toBe(200);
    });

    test('Missing user key in request returns 400', async ({ proxyClient }) => {
        const invalidRequest = testData.invalidRequests.missingUserKey;
        const response = await login(proxyClient, invalidRequest.data);

        expect(response.status()).toBe(400);
    });

    test('Missing password key in request returns 400', async ({ proxyClient }) => {
        const invalidRequest = testData.invalidRequests.missingPasswordKey;
        const response = await login(proxyClient, invalidRequest.data);

        expect(response.status()).toBe(400);
    });

    test('Invalid JSON format returns 400', async ({ proxyClient }) => {

        const response = await login(
            proxyClient,
            'not-a-json-body'
        );

        expect(response.status()).toBe(400);
    });
});

describe('PROXY ==> CLIENT: Response Transformation', () => {
    
    test('Proxy removes user key from response to client', async ({ proxyClient }) => {
        const response = await login(proxyClient, testData.validUsers.user1);

        expect(response.status()).toBe(200);

        const body = await getResponseBody(response);
        const validation = validateProxyResponse(body);

        expect(validation.userRemoved).toBe(true);
        expect(body.user).toBeUndefined();
    });

    test('Proxy preserves other response fields', async ({ proxyClient }) => {
        const response = await login(proxyClient, testData.validUsers.user1);

        expect(response.status()).toBe(200);

        const body = await getResponseBody(response);

        expect(body.token).toBeTruthy();
        expect(typeof body.token).toBe('string');
        expect(body.expires_in).toBe(3600);
    });
});

describe('DOWNSTREAM: Request & Response Flow', () => {
    
    test('Proxy forwards user key to downstream server', async ({ downstreamClient }) => {
        const response = await login(downstreamClient, testData.validUsers.user1);
        expect(response.status()).toBe(200);
    });

    test('Downstream response includes user key', async ({ downstreamClient }) => {
        const validUser = testData.validUsers.user1;
        const response = await login(downstreamClient, testData.validUsers.user1);

        expect(response.status()).toBe(200);

        const body = await getResponseBody(response);

        expect(body.user).toBe(validUser.user);
    });

    test('Downstream validation failure returns 400 : missing user key', async ({ downstreamClient }) => {
        const response = await login(
            downstreamClient,
            testData.invalidFormats.missingUser
        );

        expect(response.status()).toBe(400);
    });

    test('Downstream validation failure returns 400 : missing password key', async ({ downstreamClient }) => {
        const response = await login(
            downstreamClient,
            testData.invalidFormats.missingPassword
        );

        expect(response.status()).toBe(400);
    });
});

describe('Edge Cases', () => {
    
    test('Unknown API endpoint returns 400', async ({ proxyClient }) => {

        const validUser = testData.validUsers.user1;
        const response = await proxyClient.post(config.endpoints.unknown, {
            data: {
                user: validUser.user,
                password: validUser.password
            }
        });

        expect(response.status()).toBe(400);
    });

    test('Multiple valid users can authenticate successfully', async ({ proxyClient }) => {
        for (const validUser of Object.values(testData.validUsers)) {
            const response = await login(proxyClient, validUser);

            expect(response.status()).toBe(200);

            const body = await getResponseBody(response);

            expect(body.user).toBeUndefined();
            expect(body.token).toBeTruthy();
        }
    });
});
