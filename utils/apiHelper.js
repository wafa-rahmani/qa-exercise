
async function sendPostRequest(apiClient, endpoint, data) {
    return await apiClient.post(endpoint, {
        data: data,
    });
}

async function sendInvalidJsonRequest(apiClient, endpoint, body) {
    return await apiClient.post(endpoint, {
        headers: {
            'Content-Type': 'text/plain',
        },
        body: body,
    });
}

async function sendLoginRequest(apiClient, endpoint, user, password) {
    return await sendPostRequest(apiClient, endpoint, { user, password });
}

async function sendProxyLoginRequest(proxyClient, endpoint, user, password) {
    return await sendPostRequest(proxyClient, endpoint, { user, password });
}

async function sendProxyToDownstreamLoginRequest(proxyClient, endpoint, user, password) {
    return await sendPostRequest(proxyClient, endpoint, { user, password });
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

function validateFieldsRemoved(responseBody, forbiddenFields) {
    const found = [];
    for (const field of forbiddenFields) {
        if (field in responseBody) {
            found.push(field);
        }
    }
    return {
        valid: found.length === 0,
        found: found,
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
    sendPostRequest,
    sendInvalidJsonRequest,
    sendLoginRequest,
    sendProxyLoginRequest,
    sendProxyToDownstreamLoginRequest,
    validateResponseFields,
    validateFieldsRemoved,
    getResponseBody,
    validateProxyResponse,
};
