# Playwright API Tests for Proxy Service

This folder contains comprehensive automated Playwright tests for the FastAPI proxy service. The tests validate all technical requirements around JSON request/response validation and the user key stripping behavior, covering the full CLIENT <==> PROXY <==> DOWNSTREAM flow.

## Folder Structure

```
qa-exercise/
├── README.md                      # This file
├── package.json                   # npm configuration and dependencies
├── playwright.config.js           # Playwright configuration with tracing and HTML reports
├── tests/
│   └── login-api.spec.js         # Complete test suite (11 tests)
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
- **`invalidUsers`** - Invalid request scenarios (missing user, missing password)

Benefits:
- Single source of truth for test data
- Easy to add new test scenarios
- No hardcoded values in test specs
- Supports data-driven testing

### `utils/apiHelper.js`
Reusable API interaction and validation functions:

**Request Helpers:**
- `login(client, json)` - Send login request (works with proxy or downstream client)

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

Tests are organized in a single consolidated spec file for complete coverage:

#### `login-api.spec.js` - Complete API Integration Tests (11 tests)
Comprehensive test suite covering all proxy and downstream server interactions.

**CLIENT <==> PROXY: Request Validation (4 tests)**
1. **Valid request with user and password keys is accepted** - Tests successful authentication
2. **Missing user key in request returns 400** - Validates user key requirement
3. **Missing password key in request returns 400** - Validates password key requirement
4. **Invalid JSON format returns 400** - Validates JSON format requirement

**PROXY <==> CLIENT: Response Transformation (2 tests)**
5. **Proxy removes user key from response to client** - Validates user field is stripped
6. **Proxy preserves other response fields** - Validates response integrity (token, password, expires_in)

**PROXY <==> DOWNSTREAM: Request & Response Flow (3 tests)**
7. **Proxy forwards user key to downstream server** - Validates request forwarding
8. **Downstream response includes user key** - Validates downstream returns user key
9. **Downstream validation failure returns 400** - Validates error handling

**Edge Cases (2 tests)**
10. **Unknown API endpoint returns 404** - Tests error handling for invalid endpoints
11. **Multiple valid users can authenticate successfully** - Data-driven test with all users

**Covers:** All 5 requirements with comprehensive flow coverage

## Requirements Covered

All 5 original requirements are comprehensively tested across multiple scenarios:

| Requirement | Primary Tests | Status |
|------------|---------------|--------|
| 1. Proxy expects JSON request body | login-api.spec.js: Invalid JSON format test | ✅ |
| 2. Request must have "user" key | login-api.spec.js: Missing user/password tests | ✅ |
| 3. Response must be valid JSON | All tests validate JSON responses | ✅ |
| 4. Response must have "user" key | login-api.spec.js: Downstream response test | ✅ |
| 5. "user" key is removed from response | login-api.spec.js: User removal + field preservation tests | ✅ |

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

### Consolidated Test Structure
All tests are organized in a single comprehensive spec file:
- **login-api.spec.js:** Complete test suite covering all proxy and downstream server interactions
- **Logical organization:** Tests grouped by flow stage (request validation, response transformation, server communication, edge cases)
- **Clear separation:** Comments and sections clearly delineate different test categories
- **Improved navigation:** All tests in one place with clear hierarchical structure
- **Better maintainability:** Single source of truth for all API integration tests

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
