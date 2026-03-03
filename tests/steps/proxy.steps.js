const { Given, When, Then } = require('@cucumber/cucumber');

Given('the proxy service is running at {string}', function (baseUrl) {
  this.baseUrl = baseUrl;
});

When('I send a POST request to {string} with JSON body:', async function (path, docString) {
  const jsonBody = JSON.parse(docString);
  this.lastResponse = await this.apiContext.post(this.baseUrl + path, {
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(jsonBody),
  });
});

When('I send a POST request to {string} with non-JSON body {string} and content type {string}', async function (path, body, contentType) {
  this.lastResponse = await this.apiContext.post(this.baseUrl + path, {
    headers: {
      'Content-Type': contentType,
    },
    data: body,
  });
});

When('I send a POST request to {string} without {string}', async function (path, missingField) {
  const baseBody = {
    user: 40,
    password: '12345',
  };

  delete baseBody[missingField];

  this.lastResponse = await this.apiContext.post(this.baseUrl + path, {
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(baseBody),
  });
});

Then('the response status should be {int}', async function (expectedStatus) {
  const status = this.lastResponse.status();
  if (status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus} but got ${status}`);
  }
});

Then('the response JSON should contain keys:', async function (dataTable) {
  const body = await this.lastResponse.json();
  const keys = dataTable.raw().flat();
  for (const key of keys) {
    if (!(key in body)) {
      throw new Error(`Expected response JSON to contain key '${key}', but it was missing. Body: ${JSON.stringify(body)}`);
    }
  }
});

Then('the response JSON error message should contain {string}', async function (expectedSubstring) {
  const body = await this.lastResponse.json();
  const detail = body.detail || JSON.stringify(body);
  if (!String(detail).includes(expectedSubstring)) {
    throw new Error(`Expected error detail to contain '${expectedSubstring}', but got '${detail}'.`);
  }
});
