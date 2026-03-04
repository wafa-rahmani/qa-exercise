const config = require('./config.json');

async function sendInvalidJsonRequest(apiClient, endpoint, body) {
    return await apiClient.post(endpoint, {
        headers: {
            'Content-Type': 'text/plain',
        },
        body: body,
    });
}

async function Login(client, user, password) {
    return await client.post(config.endpoints.login, {
        data: { user, password },
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

function validateProxyResponse(responseBody, expectedFields = ['token', 'password', 'expires_in']) {
    return {
        userRemoved: !('user' in responseBody),
        fieldsPresent: validateResponseFields(responseBody, expectedFields),
    };
}

module.exports = {
    sendInvalidJsonRequest,
    Login,
    validateResponseFields,
    getResponseBody,
    validateProxyResponse,
};
