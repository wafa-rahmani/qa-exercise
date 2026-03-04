# Playwright API Tests for Proxy Service

This folder contains automated Playwright tests for the FastAPI proxy service. The tests validate all technical requirements around JSON request/response validation and the user key stripping behavior.

## Folder Structure

```
tests/
├── README.md                      # This file
├── package.json                   # npm configuration and dependencies
├── playwright.config.js           # Playwright configuration with tracing and HTML reports
├── specs/
│   └── proxy.spec.js             # Test specifications for proxy behavior
└── fixtures/
    ├── test-base.js              # Custom Playwright test base with shared fixtures
```

## Core Files

### `package.json`
Defines npm scripts and Playwright test dependencies:
- `npm test` - Runs the full test suite
- `npm run test:report` - Opens the HTML test report with traces

### `playwright.config.js`
Playwright configuration with:
- **Test Directory:** `./specs` - where test files live
- **Tracing:** Enabled on first retry to capture detailed execution traces
- **Reporter:** HTML report in `playwright-report` directory
- **Base URL:** `http://127.0.0.1:8000` (proxy service)
- **Retries:** 1 retry on failure

### `fixtures/test-base.js`
Custom Playwright test base extending the default test with :

1. **`apiClient` (test-scoped)**
   - Provides a Playwright `APIRequestContext` bound to the proxy (`http://127.0.0.1:8000`)
   - Used to make HTTP requests to the proxy service
   - Automatically disposed after each test

### `fixtures/downstreamServer.js`
Mock HTTP server simulating the downstream service. Handles:
- **`/api/login`** - Happy path returning JSON with `user`, `password`, random `token`, and `expires_in`
- **`/api/login-missing-user-in-response`** - Returns JSON without `user` key (for error testing)
- **`/api/login-non-json-response`** - Returns plain text instead of JSON (for error testing)
- **Any other path** - Returns 404 Not Found

Validates incoming requests require both `user` and `password` keys.

### `specs/proxy.spec.js`
Test specifications validating the 5 proxy service requirements:

#### Test 1: Missing `user` in Request
**Requirement:** Proxy expects JSON request body with `user` key
- Sends POST to `/api/login` without `user` field
- Expects HTTP 400 error response
- Validates proxy validates request structure

#### Test 2: Invalid JSON Request
**Requirement:** Proxy expects JSON request body
- Sends POST with `Content-Type: text/plain` and non-JSON payload
- Expects HTTP 400 error response
- Validates proxy can parse JSON

#### Test 3: Happy Path - User Stripping
**Requirements:** All five requirements validated in single test
- Sends valid POST with `user` and `password` to `/api/login`
- Validates proxy returns HTTP 200 success
- Validates `user` key is **removed** from response (Req 5)
- Validates other fields (`token`, `password`, `expires_in`) are **preserved** (Req 3)
- Validates response is valid JSON (Req 3)
- Validates response contains `user` from downstream (Req 4)

#### Test 4: Unknown API Path
**Bonus:** Error handling for non-existent endpoints
- Sends valid POST to `/api/unknown` 
- Expects HTTP 404 from downstream (passed through by proxy)

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

## Requirements Covered

| Requirement | Test | Status |
|------------|------|--------|
| Proxy expects JSON request body | Test 2 | ✅ |
| Request must have "user" key | Test 1 | ✅ |
| Response must be valid JSON | Test 3 | ✅ |
| Response must have "user" key | Test 3 | ✅ |
| "user" key is removed from response | Test 3 | ✅ |

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
