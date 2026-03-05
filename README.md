# Playwright API Tests for Proxy Service

This folder contains comprehensive automated Playwright tests for the FastAPI proxy service. The tests validate all technical requirements around JSON request/response validation and the user key stripping behavior, covering the full CLIENT <==> PROXY <==> DOWNSTREAM flow.

## Folder Structure

```
qa-exercise/
├── README.md                      # This file
├── package.json                   # npm configuration and dependencies
├── playwright.config.js           # Playwright configuration with tracing and HTML reports
├── tests/
│   ├── downstream.spec.js        # Downstream server tests (3 tests)
│   └── proxy.spec.js             # Proxy tests (8 tests)
├── fixtures/
│   └── request.js                # Custom Playwright test fixtures (proxyClient, downstreamClient)
└── utils/
    ├── config.json               # API configuration (endpoints, baseURL)
    ├── testData.json             # Test data (users, invalid requests/formats)
    └── apiHelper.js              # Reusable API interaction and validation functions
```

## Core Files

### `package.json`
Defines npm scripts and Playwright test dependencies:
- `npm test` - Runs the full test suite
- `npm run test:report` - Opens the HTML test report with traces

### `playwright.config.js`
Playwright configuration with:
- **Test Directory:** `./tests` - where test files live
- **Workers:** 1 worker (prevents port conflicts)
- **Tracing:** Enabled on first retry to capture detailed execution traces
- **Reporter:** HTML report in `playwright-report` directory
- **Retries:** 1 retry on failure

### `fixtures/request.js`
Custom Playwright test fixtures extending the default test:

1. **`proxyClient` (test-scoped)**
   - Provides a Playwright `APIRequestContext` bound to the proxy server
   - Base URL configured from `config.json` (default: `http://127.0.0.1:8000`)
   - Used to make HTTP requests to the proxy service
   - Automatically disposed after each test

2. **`downstreamClient` (test-scoped)**
   - Provides a Playwright `APIRequestContext` bound to the downstream server
   - Base URL configured from `config.json` (default: `http://127.0.0.1:8085`)
   - Used to make direct HTTP requests to the downstream service
   - Automatically disposed after each test

### `utils/config.json`
Centralized API configuration file containing:
- **`endpoints`** - Mapping of logical endpoint names to API paths (e.g., login, unknown)
- **`baseURL`** - Server base URLs for proxy and downstream services

Benefits:
- Single source of truth for API configuration
- Easy to change endpoints or server URLs
- Used by both test fixtures and test specs

### `utils/testData.json`
Centralized test data file containing:
- **`validUsers`** - Valid user credentials (user ID + password) for testing
- **`invalidRequests`** - Invalid request scenarios (missing user, missing password)
- **`invalidFormats`** - Invalid data formats (missing password, missing user)

Benefits:
- Single source of truth for test data
- Easy to add new test scenarios
- No hardcoded values in test specs
- Supports data-driven testing

### `utils/apiHelper.js`
Reusable API interaction and validation functions:

**Request Helpers:**
- `login(client, json)` - Send login request (works with proxy or downstream client)
- `sendInvalidJsonRequest(apiClient, endpoint, body)` - Send request with invalid JSON format

**Response Helpers:**
- `getResponseBody(response)` - Parse JSON response body
- `validateResponseFields(body, expectedFields)` - Check if expected fields exist
- `validateProxyResponse(body)` - Validate proxy-specific behavior (user removed, other fields present)

Benefits:
- DRY principle - no duplicated code in tests
- Clear separation between proxy and downstream requests
- Consistent API interactions across all tests
- Easy to add new helper functions
- Simplified test assertions

### Test Specifications (tests/)

Tests are organized into 2 spec files by scope for better maintainability:

#### `downstream.spec.js` - Downstream Server Tests (3 tests)
Validates all interactions with the downstream server including request forwarding and response analysis.

**PROXY <==> DOWNSTREAM: Request Format Tests**
1. **Sends user key to downstream server** - Validates proxy forwards requests correctly through the proxy
2. **Error 400 if downstream validation fails** - Proxy returns 400 when downstream rejects the request

**DOWNSTREAM <==> PROXY: Response Analysis Tests**
3. **Response contains user key - should process** - Validates downstream returns proper response with user key

**Covers:** Request forwarding, downstream communication, and response processing

#### `proxy.spec.js` - Proxy Tests (8 tests)
Validates all proxy functionality including request validation, response transformation, and edge cases.

**CLIENT <==> PROXY: Request Validation Tests**
1. **User key present in request** - Valid request should be accepted
2. **User key missing in request** - Should return 400
3. **Password key missing in request** - Should return 400
4. **Invalid JSON format** - Should return 400

**PROXY <==> CLIENT: Response Validation Tests**
5. **User key removed from response** - Validates user field is stripped from response
6. **Other fields preserved in response** - Validates response integrity

**Edge Cases Tests**
7. **Unknown API path returns 404** - Tests error handling for invalid endpoints
8. **Multiple valid users can authenticate** - Data-driven test with all users from testData.json

**Covers:** Requirements 1, 2, 3, and 5 (JSON validation, request validation, response transformation)

## Requirements Covered

All 5 original requirements are comprehensively tested across multiple scenarios:

| Requirement | Primary Tests | Status |
|------------|---------------|--------|
| 1. Proxy expects JSON request body | proxy.spec.js: Invalid JSON format test | ✅ |
| 2. Request must have "user" key | proxy.spec.js: Missing user/password tests | ✅ |
| 3. Response must be valid JSON | All tests validate JSON responses | ✅ |
| 4. Response must have "user" key | downstream.spec.js: Downstream response test | ✅ |
| 5. "user" key is removed from response | proxy.spec.js: User removal + field preservation tests | ✅ |

### Flow Coverage

| Flow Stage | Tests | Count |
|-----------|-------|-------|
| CLIENT ➡️ PROXY | Request validation tests | 4 |
| PROXY ➡️ DOWNSTREAM | Request forwarding tests | 2 |
| DOWNSTREAM ➡️ PROXY | Response analysis tests | 1 |
| PROXY ➡️ CLIENT | Response transformation tests | 2 |
| Edge Cases | Unknown paths, data-driven tests | 2 |
| **Total** | | **11** |

## Test Architecture

### Organized Test Structure
Tests are split into 2 spec files by scope:
- **downstream.spec.js:** Focuses on downstream server interactions and proxy-to-downstream forwarding
- **proxy.spec.js:** Focuses on proxy functionality, request validation, response transformation, and edge cases
- **Clear separation of concerns:** Downstream tests vs proxy tests are isolated
- **Improved maintainability:** Each file has a focused purpose
- **Easier debugging:** Failures are quickly categorized by scope
- **Scalability:** New tests can be added to the appropriate file

### Data-Driven Approach
Tests use centralized data from `utils/testData.json` and `utils/config.json`:
- **testData.json:** User credentials and invalid request scenarios
- **config.json:** API endpoints and server URLs
- Avoid hardcoded values in test specs
- Enable easy addition of new test scenarios
- Support parameterized testing (e.g., multiple users authentication test)
- Maintain consistency across tests

### Reusable Utilities
The `utils/apiHelper.js` module provides:
- **Consistent API interactions:** All tests use standardized helper functions
- **Simplified assertions:** Validation helpers reduce boilerplate code
- **Maintainability:** Changes to API interaction logic are centralized
- **Readability:** Test specs focus on "what" not "how"

Example comparison:
```javascript
// Without helpers (verbose)
const response = await proxyClient.post('/api/login', {
    data: { user: 40, password: '12345' }
});
const body = await response.json();
expect(body.user).toBeUndefined();

// With helpers (concise)
const response = await login(proxyClient, { user: 40, password: '12345' });
const body = await getResponseBody(response);
expect(validateProxyResponse(body).userRemoved).toBe(true);
```

### Fixture Pattern
Tests leverage Playwright's fixture system for:
- **Resource management:** Automatic setup/teardown of API clients
- **Isolation:** Each test gets fresh proxyClient and downstreamClient contexts
- **Flexibility:** Tests can interact with either proxy or downstream server
- **Reliability:** No manual cleanup required, reduces flaky tests

## How to Use

### Prerequisites
- Node.js (LTS version) installed
- Proxy service running on `http://127.0.0.1:8000`
- Downstream service running on `http://127.0.0.1:8085`

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
npm test
```

Output will show:
- ✅ Pass/fail indicators for each test
- ⏱️ Execution time for each test
- 📊 Summary (e.g., "4 passed (1.2s)")

### View Test Report
After running tests, view the interactive HTML report:
```bash
npm run test:report
```

The report includes:
- Test duration and status for each test
- Full browser console logs
- Network activity logs
- **Traces** for failed tests (capture detailed browser events)
- Screenshots (if configured)
- Retry information for failed tests

To view a specific trace from a failed test:
```bash
npx playwright show-trace test-results/[trace-path]/trace.zip
```

## Test Execution Flow

1. **Test Start**
   - Playwright loads the test with fixtures from `fixtures/request.js`
   - `proxyClient` and/or `downstreamClient` fixtures are created based on test needs
   - Base URLs loaded from `config.json`

2. **Test Execution**
   - Test sends HTTP request via `proxyClient` to proxy (e.g., `127.0.0.1:8000`) OR
   - Test sends HTTP request via `downstreamClient` to downstream (e.g., `127.0.0.1:8085`)
   - For proxy tests: Proxy validates request, forwards to downstream, processes response
   - For downstream tests: Direct interaction with downstream server

3. **Test Verification**
   - Test assertions validate HTTP status and response body
   - Pass/fail recorded

4. **Test Cleanup**
   - `proxyClient` and `downstreamClient` disposed automatically

## Important Notes

### Trace Configuration
Traces are only generated for failed tests or retried tests (configured with `trace: 'on-first-retry'`). This saves storage while ensuring debugging info is available when needed.

### Random Values
The downstream server generates:
- Random `user` ID (1-10000) if not provided in request
- Random `token` on each response

Tests use flexible assertions (`toBeTruthy()`, `typeof token === 'string'`) to handle randomness.

### Port Configuration
- **Proxy:** `127.0.0.1:8000` (configured in `utils/config.json`)
- **Downstream:** `127.0.0.1:8085` (configured in `utils/config.json`)

Both URLs are centralized in `config.json` for easy configuration.

## Troubleshooting

### Tests fail with "Connection refused"
- Ensure proxy is running: `cd .. && uv run main.py`
- Check proxy is listening on `127.0.0.1:8000`
- Ensure downstream server is running on `127.0.0.1:8085`

### Tests fail with "Port already in use"
- Kill proxy process: `lsof -ti tcp:8000 | xargs kill`
- Kill downstream process: `lsof -ti tcp:8085 | xargs kill`
- Restart both services

### Report not generating
- Check `playwright-report/` directory exists
- Run `npm test` first to generate report
- Then run `npm run test:report`

## Running Tests in CI/CD

To run tests in a CI environment:

```bash
# Install dependencies
npm install

# Run tests (non-interactive)
npm test

```

Test artifacts (traces, reports, ...) are stored in `test-results/` and `playwright-report/` directories.
