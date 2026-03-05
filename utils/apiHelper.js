const config = require('./config.json');

async function login(client, json) {
    return await client.post(config.endpoints.login, {
        data: json,
    });
}

async function validateProxyResponse(response, expectedFields = ['token', 'password', 'expires_in']) {
    const responseBody = await response.json();
    const missing = [];
    for (const field of expectedFields) {
        if (!(field in responseBody)) {
            missing.push(field);
        }
    }
    return {
        userRemoved: !('user' in responseBody),
        fieldsPresent: {
            valid: missing.length === 0,
            missing: missing,
        },
        body: responseBody,
    };
}

async function checkUserKey(response, expectedUser) {
    const responseBody = await response.json();
    return responseBody.user === expectedUser;
}

async function checkResponseOtherFields(response) {
    const responseBody = await response.json();
    return (
        responseBody.token &&
        typeof responseBody.token === 'string' &&
        responseBody.expires_in === 3600
    );
}

module.exports = {
    login,
    validateProxyResponse,
    checkUserKey,
    checkResponseOtherFields,
};
