const config = require('./config.json');

async function login(client, json) {
    return await client.post(config.endpoints.login, {
        data: json,
    });
}

function validateResponseFields(responseBody, expectedFields) {
    const missing = [];
    for (const field of expectedFields) {
        if (!(field in responseBody)) {
            missing.push(field);
        }
    }
    return {
        valid: missing.length === 0,
        missing: missing,
    };
}

async function getResponseBody(response) {
    try {
        return await response.json();
    } catch (error) {
        throw new Error(`Failed to parse response as JSON: ${error.message}`);
    }
}

async function validateProxyResponse(response, expectedFields = ['token', 'password', 'expires_in']) {
    const responseBody = await getResponseBody(response);
    return {
        userRemoved: !('user' in responseBody),
        fieldsPresent: validateResponseFields(responseBody, expectedFields),
        body: responseBody,
    };
}

async function checkResponseOtherFields(response) {
    const responseBody = await getResponseBody(response);
    return (
        responseBody.token &&
        typeof responseBody.token === 'string' &&
        responseBody.expires_in === 3600
    );
}

module.exports = {
    login,
    validateResponseFields,
    getResponseBody,
    validateProxyResponse,
    checkResponseOtherFields,
};
