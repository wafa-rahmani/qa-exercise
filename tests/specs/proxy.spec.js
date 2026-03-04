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
    expect(body.token).toBeTruthy();
    expect(typeof body.token).toBe('string');
    expect(body.password).toBe('12345');
    expect(body.expires_in).toBe(3600);
});

test('returns 404 when calling unknown API path', async ({ apiClient }) => {
    const response = await apiClient.post('/api/unknown', {
        data: {
            user: 40,
            password: '12345',
        },
    });

    expect(response.status()).toBe(404);
});
