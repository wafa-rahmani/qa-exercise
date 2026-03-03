const { setDefaultTimeout, After } = require('@cucumber/cucumber');

setDefaultTimeout(30 * 1000);

After(function (scenario) {
  if (scenario.result?.status === 'failed' && scenario.result.exception) {
    console.error('\nScenario failed with error:', scenario.result.exception);
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise rejection in tests:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception in tests:', err);
});
