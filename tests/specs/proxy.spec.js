const { test, expect } = require('../fixtures/test-base');

test('returns 400 when JSON request body is missing user key', async ({ apiClient }) => {
    const response = await apiClient.post('/api/login', {
        data: {
            password: '12345',
        },
    });

    expect(response.status()).toBe(400);
});

test('returns 400 when request body is not valid JSON', async ({ apiClient }) => {
    const response = await apiClient.post('/api/login', {
        headers: {
            'Content-Type': 'text/plain',
        },
        body: 'not-a-json-body',
    });

    expect(response.status()).toBe(400);
});

test('happy path: proxy strips user from downstream JSON response', async ({ apiClient }) => {
    const response = await apiClient.post('/api/login', {
        data: {
            user: 40,
            password: '12345',
        },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.user).toBeUndefined();

    expect(body.token).toBe('abc123xyz');
    expect(body.expires_in).toBe(3600);
});

test('returns 400 when downstream JSON response is missing user key', async ({ apiClient }) => {
    const response = await apiClient.post('/api/login-missing-user-in-response', {
        data: {
            user: 40,
            password: '12345',
        },
    });

    expect(response.status()).toBe(400);
});

test('returns 400 when downstream response is not JSON', async ({ apiClient }) => {
    const response = await apiClient.post('/api/login-non-json-response', {
        data: {
            user: 40,
            password: '12345',
        },
    });

    expect(response.status()).toBe(400);
});
