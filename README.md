# Playwright API Tests for Proxy Service

This folder contains comprehensive automated Playwright tests for the FastAPI proxy service. The tests validate all technical requirements around JSON request/response validation and the user key stripping behavior, covering the full CLIENT <==> PROXY <==> DOWNSTREAM flow.

## Folder Structure

```
qa-exercise/
├── README.md                      # This file
├── package.json                   # npm configuration and dependencies
├── playwright.config.js           # Playwright configuration with tracing and HTML reports
├── MANUAL_TESTING_APPROACH.md    # Manual testing guide (Postman + curl)
├── tests/
│   └── login-api.spec.js         # Complete test suite (10 tests in 3 describe blocks)
├── fixtures/
│   └── request.fixture.js        # Custom Playwright test fixtures (proxyClient, downstreamClient)
└── utils/
    ├── config.json               # API configuration (endpoints, baseURL)
    ├── testData.json             # Test data (users, invalid users)
    └── apiHelper.js              # Reusable API interaction and validation helpers
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

### `fixtures/request.fixture.js`
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
- `login(client, json)` - Send login request with status/body access (works with proxy or downstream client)

**Response Helpers:**
- `validateProxyResponse(response, expectedFields)` - Validates response structure and user key removal (returns {userRemoved, fieldsPresent, body})
- `checkResponseOtherFields(response)` - Checks if token field exists and expires_in equals 3600 (returns boolean)
- `checkUserKey(response, expectedUser)` - Checks if user key matches expected value (returns boolean)

Benefits:
- DRY principle - reusable validation logic across tests
- Integrated JSON parsing - each helper handles response.json() internally
- Boolean return types - simplifies test assertions
- Clear validation semantics - function names indicate what they check
- Maintainability - response parsing logic centralized

### Test Specifications (tests/)

Tests are organized in a single consolidated spec file with `describe()` blocks for logical grouping:

#### `login-api.spec.js` - Complete API Integration Tests (10 tests)
Comprehensive test suite covering all proxy and downstream server interactions.

**CLIENT ==> PROXY: Request Validation (4 tests)**
- Valid request with user and password keys is accepted
- Missing user key in request returns 400
- Missing password key in request returns 400
- Invalid JSON format returns 400

**PROXY ==> CLIENT: Response Transformation (2 tests)**
- Proxy removes user key from response to client (uses `validateProxyResponse()`)
- Proxy preserves other response fields (uses `checkResponseOtherFields()`)

**DOWNSTREAM: Request & Response Flow (4 tests)**
- Valid request to DOWNSTREAM with user and password keys is accepted
- Downstream response includes user key (uses `checkUserKey()`)
- Downstream validation failure returns 400 : missing user key
- Downstream validation failure returns 400 : missing password key

**Organization:** Tests grouped with `test.describe()` blocks for better filtering and readability
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
| PROXY ➡️ CLIENT | Response transformation tests | 2 |
| DOWNSTREAM Server | Direct downstream interaction tests | 4 |
| **Total** | | **10** |

## Test Architecture

### Consolidated Test Structure with describe() Blocks
All tests are organized in a single comprehensive spec file with logical grouping:
- **login-api.spec.js:** Complete test suite in 3 `describe()` blocks for better organization
- **Logical organization:** Tests grouped by flow stage (request validation, response transformation, server communication)
- **Improved navigation:** `test.describe()` blocks enable test filtering and hierarchical structure
- **Clear separation:** Comment sections replaced with `describe()` blocks

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
// Test assertion patterns using helpers:

// Pattern 1: Validate proxy response (user removed + fields present)
const validation = await validateProxyResponse(response);
expect(validation.userRemoved).toBe(true);
expect(validation.fieldsPresent.valid).toBe(true);

// Pattern 2: Check specific response field
const isValid = await checkResponseOtherFields(response);
expect(isValid).toBe(true);

// Pattern 3: Verify user key value
const userMatch = await checkUserKey(response, expectedUser);
expect(userMatch).toBe(true);
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

### Test Organization with describe() Blocks
Tests use `test.describe()` blocks for logical grouping:
- Improves test filtering with `--grep` pattern matching
- Better readability with hierarchical test structure
- Cleaner than comment-based separation
- Enables running tests by describe block if needed

Example: Run only proxy validation tests:
```bash
npm test -- --grep "CLIENT ==> PROXY"
```

### Helper Functions Design
Helper functions handle JSON parsing internally:
- `validateProxyResponse()` - Checks user removal + expected fields
- `checkResponseOtherFields()` - Validates token and expires_in
- `checkUserKey()` - Compares user values

All return boolean or structured objects for simple assertions.

### Trace Configuration
Traces are only generated for failed tests or retried tests (configured with `trace: 'on-first-retry'`). This saves storage while ensuring debugging info is available when needed.

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

## Manual Testing

For manual testing with Postman or curl CLI, see `MANUAL_TESTING_APPROACH.md` which includes:
- Setup instructions
- Detailed test cases with request/response examples
- Postman step-by-step guides
- curl command snippets
- Known proxy service limitations
- Troubleshooting tips
