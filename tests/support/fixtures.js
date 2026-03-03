const { Before, After } = require('@cucumber/cucumber');
const { request: playwrightRequest } = require('@playwright/test');

Before(async function () {
  this.apiContext = await playwrightRequest.newContext();
});

After(async function () {
  if (this.apiContext) {
    await this.apiContext.dispose();
  }
});
