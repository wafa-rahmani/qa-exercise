# Playwright API Tests for Proxy Service

This folder contains comprehensive automated Playwright tests for the FastAPI proxy service. The tests validate all technical requirements around JSON request/response validation and the user key stripping behavior, covering the full CLIENT <==> PROXY <==> DOWNSTREAM flow.

## Folder Structure

```
tests/
├── README.md                      # This file
├── package.json                   # npm configuration and dependencies
├── playwright.config.js           # Playwright configuration with tracing and HTML reports
├── specs/
│   ├── client-to-proxy.spec.js   # CLIENT to PROXY request validation tests (4 tests)
│   ├── proxy-to-downstream.spec.js # PROXY to DOWNSTREAM forwarding tests (2 tests)
│   ├── downstream-to-proxy.spec.js # DOWNSTREAM to PROXY response analysis tests (1 test)
│   ├── proxy-to-client.spec.js   # PROXY to CLIENT response transformation tests (2 tests)
│   └── edge-cases.spec.js        # Additional edge case tests (2 tests)
├── fixtures/
│   ├── test-base.js              # Custom Playwright test base with shared fixtures
│   └── downstreamServer.js       # Mock downstream server module
└── utils/
    ├── testData.json             # Centralized test data (users, invalid requests, endpoints)
    └── apiHelper.js              # Reusable API interaction and validation functions
```

## Core Files

### `package.json`
Defines npm scripts and Playwright test dependencies:
- `npm test` - Runs the full test suite
- `npm run test:report` - Opens the HTML test report with traces

### `playwright.config.js`
Playwright configuration with:
- **Test Directory:** `./specs` - where test files live
- **Workers:** 1 worker (prevents port conflicts with downstream server)
- **Tracing:** Enabled on first retry to capture detailed execution traces
- **Reporter:** HTML report in `playwright-report` directory
- **Base URL:** `http://127.0.0.1:8000` (proxy service)
- **Retries:** 1 retry on failure

### `fixtures/test-base.js`
Custom Playwright test base extending the default test with shared fixtures:

1. **`downstreamServer` (worker-scoped, auto)**
   - Mock HTTP server simulating the downstream service
   - Runs on `127.0.0.1:8085` (matches `config.py`)
   - Started once per worker, shared across all tests
   - Automatically shut down when tests complete

2. **`apiClient` (test-scoped)**
   - Provides a Playwright `APIRequestContext` bound to the proxy (`http://127.0.0.1:8000`)
   - Used to make HTTP requests to the proxy service
   - Automatically disposed after each test

### `fixtures/downstreamServer.js`
Mock HTTP server simulating the downstream service. Handles:
- **`/api/login`** - Happy path returning JSON with `user`, `password`, random `token`, and `expires_in`
- **Any other path** - Returns 404 Not Found

Validates incoming requests require both `user` and `password` keys.

### `utils/testData.json`
Centralized test data file containing:
- **`validUsers`** - Array of valid user credentials (user ID + password) for testing
- **`invalidRequests`** - Array of invalid request scenarios (missing user, missing password, empty/null values)
- **`endpoints`** - Mapping of logical endpoint names to API paths

Benefits:
- Single source of truth for test data
- Easy to add new test scenarios
- No hardcoded values in test specs
- Supports data-driven testing

### `utils/apiHelper.js`
Reusable API interaction and validation functions:

**Request Helpers:**
- `sendPostRequest(apiClient, endpoint, data)` - Generic POST request
- `sendInvalidJsonRequest(apiClient, endpoint, body)` - Send request with invalid JSON format
- `sendLoginRequest(apiClient, endpoint, user, password)` - Convenience wrapper for login

**Response Helpers:**
- `getResponseBody(response)` - Parse JSON response body
- `validateResponseFields(body, expectedFields)` - Check if expected fields exist
- `validateFieldsRemoved(body, forbiddenFields)` - Check if fields are removed
- `validateProxyResponse(body)` - Validate proxy-specific behavior (user removed, other fields present)

Benefits:
- DRY principle - no duplicated code in tests
- Consistent API interactions across all tests
- Easy to add new helper functions
- Simplified test assertions

### Test Specifications (specs/)

Tests are organized into 5 separate spec files by flow category for better maintainability:

#### `client-to-proxy.spec.js` - CLIENT <==> PROXY: Request Validation (4 tests)
Validates how the proxy handles incoming requests from the client.
1. **User key present** - Valid request should be accepted
2. **User key missing** - Should return 400
3. **Password key missing** - Should return 400
4. **Invalid JSON format** - Should return 400

**Covers:** Requirements 1 & 2 (JSON validation and user key presence)

#### `proxy-to-downstream.spec.js` - PROXY <==> DOWNSTREAM: Request Format (2 tests)
Validates how the proxy forwards requests to the downstream server.
5. **Sends user key to downstream** - Validates proxy forwards user correctly
6. **Downstream validation fails** - Proxy should return 400 if downstream rejects

**Covers:** Request forwarding and downstream communication

#### `downstream-to-proxy.spec.js` - DOWNSTREAM <==> PROXY: Response Analysis (1 test)
Validates how the proxy processes responses from the downstream server.
7. **Response contains user key** - Validates proxy receives and processes user

**Covers:** Requirement 4 (Response must contain user key from downstream)

#### `proxy-to-client.spec.js` - PROXY <==> CLIENT: Response Validation (2 tests)
Validates how the proxy transforms responses before sending to the client.
8. **User key removed** - Validates Requirement 5 (user stripping)
9. **Other fields preserved** - Validates response integrity

**Covers:** Requirement 5 (User key removal from response)

#### `edge-cases.spec.js` - Additional Edge Cases (2 tests)
Covers additional scenarios for robust proxy validation.
10. **Unknown API path** - Should return 404
11. **Multiple valid users** - Data-driven test with all users from testData.json

**Covers:** Error handling and data-driven testing

## Requirements Covered

All 5 original requirements are comprehensively tested across multiple scenarios:

| Requirement | Primary Tests | Status |
|------------|---------------|--------|
| 1. Proxy expects JSON request body | Test 4 (invalid JSON format) | ✅ |
| 2. Request must have "user" key | Tests 1, 2 (missing user, missing password) | ✅ |
| 3. Response must be valid JSON | Test 7 (happy path validation) | ✅ |
| 4. Response must have "user" key | Test 7 (downstream includes user) | ✅ |
| 5. "user" key is removed from response | Tests 8, 9, 11 (user removal + field preservation) | ✅ |

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
Tests are split into 5 separate spec files by flow category:
- **Improved maintainability:** Each file focuses on a specific aspect of the proxy flow
- **Better organization:** Easy to locate tests for specific functionality
- **Parallel development:** Team members can work on different test files simultaneously
- **Clear separation of concerns:** CLIENT↔PROXY, PROXY↔DOWNSTREAM, and edge cases are isolated
- **Easier debugging:** Failures in specific flow categories are quickly identifiable
- **Scalability:** New tests can be added to the appropriate category file

### Data-Driven Approach
Tests use centralized test data from `utils/testData.json` to:
- Avoid hardcoded values in test specs
- Enable easy addition of new test scenarios
- Support parameterized testing (e.g., Test 13 runs with all users)
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
const response = await apiClient.post('/api/login', {
    data: { user: 40, password: '12345' }
});
const body = await response.json();
expect(body.user).toBeUndefined();

// With helpers (concise)
const response = await sendLoginRequest(apiClient, '/api/login', 40, '12345');
const body = await getResponseBody(response);
expect(validateProxyResponse(body).userRemoved).toBe(true);
```

### Fixture Pattern
Tests leverage Playwright's fixture system for:
- **Resource management:** Automatic setup/teardown of downstream server and API client
- **Isolation:** Each test gets a fresh API client context
- **Performance:** Worker-scoped fixtures (downstream server) shared across tests
- **Reliability:** No manual cleanup required, reduces flaky tests

## How to Use

### Prerequisites
- Node.js (LTS version) installed
- Proxy service running on `http://127.0.0.1:8000`

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
   - Playwright loads the test base with fixtures
   - `downstreamServer` fixture (worker-scoped) starts once per worker
   - `apiClient` fixture is created for the test

2. **Test Execution**
   - Test sends HTTP request via `apiClient` to proxy (`127.0.0.1:8000`)
   - Proxy validates request, forwards to downstream (`127.0.0.1:8085`)
   - Downstream returns response based on request path
   - Proxy validates response, modifies it, returns to test

3. **Test Verification**
   - Test assertions validate HTTP status and response body
   - Pass/fail recorded

4. **Test Cleanup**
   - `apiClient` disposed automatically
   - After all tests, `downstreamServer` shuts down

## Important Notes

### Trace Configuration
Traces are only generated for failed tests or retried tests (configured with `trace: 'on-first-retry'`). This saves storage while ensuring debugging info is available when needed.

### Random Values
The downstream server generates:
- Random `user` ID (1-10000) if not provided in request
- Random `token` on each response

Tests use flexible assertions (`toBeTruthy()`, `typeof token === 'string'`) to handle randomness.

### Port Configuration
- **Proxy:** `127.0.0.1:8000` (configured in `playwright.config.js`)
- **Downstream:** `127.0.0.1:8085` (configured in `fixtures/test-base.js`)

Matches the Python `config.py` defaults.

## Troubleshooting

### Tests fail with "Connection refused"
- Ensure proxy is running: `cd .. && uv run main.py`
- Check proxy is listening on `127.0.0.1:8000`

### Tests fail with "Port already in use"
- Kill old process: `lsof -ti tcp:8000 | xargs kill`
- Restart proxy

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
