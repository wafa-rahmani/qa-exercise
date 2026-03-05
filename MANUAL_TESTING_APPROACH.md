# Manual Testing Guide for Proxy Service

This guide provides comprehensive manual testing instructions for the proxy service and downstream server interactions.

## Testing Approaches

### 🔷 Postman (GUI-based)
A visual, user-friendly API testing tool with features like:
- Request collections and organization
- Visual response inspection
- Test scripting and assertions
- Environment variables
- Team collaboration
- Request history

### 🔶 curl (Command-line)
A lightweight, scriptable HTTP client that:
- Runs in any terminal
- Works on all platforms
- Can be automated in bash scripts
- Integrates into CI/CD pipelines
- Requires no installation (built-in on Unix systems)

## Prerequisites

### For Postman Testing:
1. **Postman** - Download from [postman.com](https://www.postman.com/downloads/)

### For curl Testing:
1. **curl** - Pre-installed on macOS/Linux, or download from [curl.se](https://curl.se/download.html)
2. **jq** (optional) - For pretty-printing JSON responses: `brew install jq` (macOS) or `apt install jq` (Linux)

### Required Services:
1. **Proxy Service Running** - On `http://127.0.0.1:8000`
2. **Downstream Server Running** - On `127.0.0.1:8085`

## Setup Instructions

### Step 1: Start the Proxy Service
```bash
cd qa-exercise
uv run main.py
```
The proxy will start on `http://127.0.0.1:8000`

### Step 2: Start the Downstream Server
```bash
node start-downstream-server.js
```
The downstream server will start on `127.0.0.1:8085`

### Step 3: Choose Your Testing Method
- **For Postman:** Launch Postman and create a new collection named "Proxy Service Tests"
- **For curl:** Open a terminal window

---

## Test Cases

### Group 1: CLIENT <==> PROXY: Request Validation

#### Test 1: Valid Request - Status 200

**Description:** Send a valid request with both user and password keys. The proxy should forward to downstream, receive response with user key, and return response WITHOUT user key to client.

**Request Details:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "user": 40,
    "password": "12345"
  }
  ```

**Expected Result:**
- **Status Code:** 200
- **Response Body:**
  ```json
  {
    "token": "abc123xyz...",
    "expires_in": 3600
  }
  ```
  *(Note: `user` key is removed by proxy before sending to client)*

**Validations:**
- ✅ Status code is 200
- ✅ `user` key is NOT in response (removed by proxy)
- ✅ `token` field exists and is non-empty string
- ✅ `expires_in` equals 3600

**Steps in Postman:**
1. Click "New" → "Request"
2. Name it "Test 1: Valid Request (200)"
3. Set method to POST
4. Enter URL: `http://127.0.0.1:8000/api/login`
5. Go to Headers tab, add `Content-Type: application/json`
6. Go to Body tab → select "raw" → paste the JSON above
7. Click "Send"
8. Verify status 200 and inspect response body

**Using curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 40, "password": "12345"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected curl output:**
```json
{
  "token": "abc123xyz...",
  "expires_in": 3600
}
HTTP Status: 200
```

**With jq formatting:**
```bash
curl -s -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 40, "password": "12345"}' | jq
```

---

#### Test 2: User key missing in request - should return 400

**Request Details:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "password": "12345"
  }
  ```

**Expected Result:**
- **Status Code:** 400
- **Response Body:**
  ```json
  {
    "detail": "Missing 'user' key in request body"
  }
  ```

**Steps in Postman:**
1. Create new request
2. Name it "Test 2: Missing User Key (400)"
3. Set method to POST
4. Enter URL: `http://127.0.0.1:8000/api/login`
5. Go to Body tab → paste the JSON above (without user key)
6. Click "Send"
7. Verify status code is 400

**Using curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"password": "12345"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected output:**
```
HTTP Status: 400
```

---

#### Test 3: Password key missing in request - should return 400

**Request Details:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "user": 40
  }
  ```

**Expected Result:**
- **Status Code:** 400
- **Response Body:** JSON error about missing password field

**Steps in Postman:**
1. Create new request
2. Name it "Test 3: Missing Password Key (400)"
3. Set method to POST
4. Enter URL: `http://127.0.0.1:8000/api/login`
5. Go to Body tab → paste the JSON above (without password key)
6. Click "Send"
7. Verify status code is 400

**Using curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 40}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected output:**
```
HTTP Status: 400
```

---

#### Test 4: Invalid JSON format - should return 400

**Request Details:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw text, NOT JSON):**
  ```
  not-a-json-body
  ```

**Expected Result:**
- **Status Code:** 400
- **Response Body:** JSON error about invalid JSON

**Steps in Postman:**
1. Create new request
2. Name it "Test 4: Invalid JSON Format (400)"
3. Set method to POST
4. Enter URL: `http://127.0.0.1:8000/api/login`
5. Go to Body tab → select "raw" → change from JSON to "Text"
6. Enter: `not-a-json-body`
7. Click "Send"
8. Verify status code is 400

**Using curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d 'not-a-json-body' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected output:**
```
HTTP Status: 400
```

---

### Group 2: PROXY <==> DOWNSTREAM: Request Format

#### Test 5: Sends user key to downstream server

**Request Details:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "user": 100,
    "password": "password123"
  }
  ```

**Expected Result:**
- **Status Code:** 200
- **Response Body:**
  ```json
  {
    "password": "password123",
    "token": "random-token-string",
    "expires_in": 3600
  }
  ```
  *(No `user` key in response - proxy removed it)*

**Validations:**
- ✅ Proxy successfully received and forwarded the user key to downstream
- ✅ Downstream processed the request and returned 200
- ✅ Proxy received the response with user key
- ✅ Proxy removed the user key before returning to client

**Steps in Postman:**
1. Create new request
2. Name it "Test 5: User Key Forwarding (200)"
3. Follow same setup as Test 1
4. Use different user ID: 100
5. Click "Send"
6. Verify user key is NOT in response

**Using curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 100, "password": "password123"}' | jq
```

**Verify:** Response should NOT contain "user" field

---

#### Test 6: Downstream validation fails - should return 400

**Request Details:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "user": 40
  }
  ```

**Expected Result:**
- **Status Code:** 400
- **Response Body:** Error from downstream validation (missing password)

**Workflow:**
1. Client sends request with user but no password
2. Proxy validates request locally ✅ (user key exists)
3. Proxy forwards to downstream
4. Downstream validates and rejects (missing password) ❌ (400)
5. Proxy returns 400 to client

**Steps in Postman:**
1. Create new request
2. Name it "Test 6: Downstream Validation Fails (400)"
3. Set method to POST
4. Enter URL: `http://127.0.0.1:8000/api/login`
5. Go to Body tab → paste JSON with only user key
6. Click "Send"
7. Verify status code is 400

**Using curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 40}' \
  -w "\nHTTP Status: %{http_code}\n"
```

---

### Group 3: DOWNSTREAM <==> PROXY: Response Analysis

#### Test 7: Response contains user key - should process

**Request Details:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "user": 999,
    "password": "securePass456"
  }
  ```

**Expected Result:**
- **Status Code:** 200
- **Response Body:**
  ```json
  {
    "password": "securePass456",
    "token": "random-token-string",
    "expires_in": 3600
  }
  ```

**Validations:**
- ✅ Proxy received response from downstream with user key
- ✅ User key is removed from final response
- ✅ Other fields (password, token, expires_in) are preserved
- ✅ Response is valid JSON

**Steps in Postman:**
1. Create new request
2. Name it "Test 7: Response Processing (200)"
3. Follow same setup as Test 1
4. Use different user ID: 999
5. Click "Send"
6. Verify in response:
   - `user` key is NOT present
   - `password`, `token`, `expires_in` ARE present

**Using curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 999, "password": "securePass456"}' | jq
```

**Verify:**
- ❌ No "user" field in response
- ✅ "password", "token", "expires_in" are present

---

### Group 4: PROXY <==> CLIENT: Response Validation

#### Test 8: User key removed from response

**Request Details:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "user": 40,
    "password": "12345"
  }
  ```

**Expected Result:**
- **Status Code:** 200
- **Response Body:** (no `user` key)
  ```json
  {
    "password": "12345",
    "token": "random-token-string",
    "expires_in": 3600
  }
  ```

**Key Validation:**
- ❌ `user` key is NOT present in response
- ✅ This is the most critical requirement

**Steps in Postman:**
1. Create new request
2. Name it "Test 8: User Key Removed (200)"
3. Follow same setup as Test 1
4. Click "Send"
5. **Critical Check:** Look at response body and confirm NO `user` key exists

**Using curl:**
```bash
# Test and check if 'user' key exists in response
curl -s -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 40, "password": "12345"}' | jq 'has("user")'
```

**Expected output:**
```
false
```
*("false" means user key is successfully removed)*

---

#### Test 9: Other fields preserved in response

**Request Details:**
- **Method:** POST
- **URL:** `http://127.0.0.1:8000/api/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "user": 40,
    "password": "12345"
  }
  ```

**Expected Result:**
- **Status Code:** 200
- **Response Body:**
  ```json
  {
    "password": "12345",
    "token": "random-token-string",
    "expires_in": 3600
  }
  ```

**Validations:**
- ✅ `password` field is present and correct
- ✅ `token` field is present and is a non-empty string
- ✅ `expires_in` field is present and equals 3600

**Steps in Postman:**
1. Create new request
2. Name it "Test 9: Fields Preserved (200)"
3. Follow same setup as Test 1
4. Click "Send"
5. Verify all three fields are present:
   - `password` = "12345"
   - `token` = non-empty string
   - `expires_in` = 3600

**Using curl:**
```bash
# Check all required fields are present
curl -s -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 40, "password": "12345"}' | \
  jq '{password, token, expires_in}'
```

**Expected output:**
```json
{
  "password": "12345",
  "token": "<some-token>",
  "expires_in": 3600
}
```
---

## curl Command Tips

### Useful curl Options

**Display HTTP Status Code:**
```bash
curl -w "\nHTTP Status: %{http_code}\n" [URL]
```

**Silent Mode (no progress bar):**
```bash
curl -s [URL]
```

**Include Response Headers:**
```bash
curl -i [URL]
```

**Verbose Output (for debugging):**
```bash
curl -v [URL]
```

**Save Response to File:**
```bash
curl [URL] -o response.json
```

### Using jq for JSON Processing

**Pretty Print:**
```bash
curl [URL] | jq
```

**Extract Specific Field:**
```bash
curl [URL] | jq '.token'
```

**Check if Field Exists:**
```bash
curl [URL] | jq 'has("user")'
```

**Select Multiple Fields:**
```bash
curl [URL] | jq '{password, token}'
```

### Bash Script for All Tests

Create a file `test_proxy.sh`:
```bash
#!/bin/bash

BASE_URL="http://127.0.0.1:8000"

echo "Test 1: Valid Request"
curl -s -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 40, "password": "12345"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "Test 2: Missing User Key"
curl -s -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"password": "12345"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "Test 3: Missing Password Key"
curl -s -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"user": 40}' \
  -w "\nStatus: %{http_code}\n\n"

echo "Test 4: Invalid JSON"
curl -s -X POST $BASE_URL/api/login \
  -H "Content-Type: application/json" \
  -d 'not-a-json-body' \
  -w "\nStatus: %{http_code}\n\n"

echo "Test 10: Unknown Path"
curl -s -X POST $BASE_URL/api/unknown \
  -H "Content-Type: application/json" \
  -d '{"user": 40, "password": "12345"}' \
  -w "\nStatus: %{http_code}\n\n"
```

Run with: `bash test_proxy.sh`



**Test Organization:**
- **CLIENT ==> PROXY: Request Validation** - 4 tests covering request handling
- **PROXY ==> CLIENT: Response Transformation** - 2 tests covering response processing
- **DOWNSTREAM: Request & Response Flow** - 4 tests covering integration

---

### Export/Import Collection
1. **Export:** Right-click collection → "Export" → save as JSON
2. **Import:** File → "Import" → select JSON file

### Run Tests in Sequence
1. Select collection folder
2. Click "Run"
3. Postman will run all requests in order
4. View results in the "Test Results" tab

### Add Pre-request Scripts
To add test validation in Postman:
1. Go to "Tests" tab in request
2. Add assertions:
   ```javascript
   pm.test("Status code is 200", function() {
       pm.response.to.have.status(200);
   });

   pm.test("User key is removed", function() {
       var jsonData = pm.response.json();
       pm.expect(jsonData.user).to.be.undefined;
   });
   ```

### Environment Variables
Create an environment to store base URL:
1. Click "Manage Environments"
2. Create new environment "Proxy Testing"
3. Add variable: `base_url` = `http://127.0.0.1:8000`
4. Use in requests: `{{base_url}}/api/login`

---

## Troubleshooting

### Connection Refused (Postman/curl)
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution:** 
- Ensure proxy service is running with `uv run main.py`
- Ensure downstream server is running with `node start-downstream-server.js`
- Check services are listening on correct ports:
  ```bash
  lsof -i :8000  # Check proxy
  lsof -i :8085  # Check downstream
  ```

### Invalid JSON Error (Postman)
```
400 Bad Request - Invalid JSON
```
**Solution:** 
- Verify Body tab is set to "raw" and format is "JSON"
- Check for syntax errors in JSON (missing commas, quotes, etc.)

### curl JSON Syntax Errors
**Problem:** Shell interprets special characters in JSON
**Solution:** 
- Use single quotes around JSON: `-d '{"user": 40}'`
- Or escape double quotes: `-d "{\"user\": 40}"`
- On Windows: Use double quotes and escape inner quotes: `-d "{\"user\": 40}"`

### jq Command Not Found
```
bash: jq: command not found
```
**Solution:**
- macOS: `brew install jq`
- Ubuntu/Debian: `sudo apt install jq`
- Or omit jq and read raw JSON output

### curl: Failed to Connect
```
curl: (7) Failed to connect to 127.0.0.1 port 8000: Connection refused
```
**Solution:**
- Verify proxy is running: `curl http://127.0.0.1:8000/docs`
- Check firewall settings
- Try using `localhost` instead of `127.0.0.1`

### User Key Not Removed
**Solution:**
- Check the response body carefully - sometimes JSON is formatted
- Look for `"user"` key in the response
- If present, the proxy stripping logic has an issue

### Token Generation Issues
- Each request gets a new random token
- Token format: long alphanumeric string
- Expires_in always: 3600 seconds

---

## Test Status Summary

**Current Test Results:**
- ✅ **8 Tests Passing**
- ❌ **2 Tests Failing**

### Known Issues & Failures

The following 2 tests fail due to bugs in the proxy service (`main.py`) :

1. **Invalid JSON format returns 400** (Currently returns 500)
   - Issue: `JSONDecodeError` not caught at line 14 of main.py
   - Expected: 400 status code
   - Actual: 500 status code
   
2. **Proxy removes user key from response** (User key still present)
   - Issue: Line 24 removes "customer" key instead of "user" key
   - Expected: `user` key absent in response
   - Actual: `user` key present in response

---

## Test Summary Table

| # | Test Name | Method | Endpoint | Target | Status | Passing |
|---|-----------|--------|----------|--------|--------|---------|
| 1 | Valid Request | POST | `/api/login` | Proxy | 200 | ✅ |
| 2 | Missing User Key | POST | `/api/login` | Proxy | 400 | ✅ |
| 3 | Missing Password Key | POST | `/api/login` | Proxy | 400 | ✅ |
| 4 | Invalid JSON Format | POST | `/api/login` | Proxy | 400 | ❌ (returns 500) |
| 5 | Response Fields Preserved | POST | `/api/login` | Proxy | 200 | ✅ |
| 6 | User Key Removal | POST | `/api/login` | Proxy | 200 | ❌ (user not removed) |
| 7 | Downstream Valid Request | POST | `/api/login` | Downstream | 200 | ✅ |
| 8 | Downstream User Key Present | POST | `/api/login` | Downstream | 200 | ✅ |
| 9 | Downstream Missing User | POST | `/api/login` | Downstream | 400 | ✅ |
| 10 | Downstream Missing Password | POST | `/api/login` | Downstream | 400 | ✅ |

---

## Proxy Requirements Verification Checklist

Use this checklist to manually verify all 5 requirements:

- [ ] **Req 1:** Proxy expects JSON in request body
  - Test: Send non-JSON body → expect 400
  
- [ ] **Req 2:** Request must have "user" key
  - Test: Send JSON without user key → expect 400
  
- [ ] **Req 3:** Response must be valid JSON
  - Test: Check response is parseable JSON (not text or HTML)
  
- [ ] **Req 4:** Response must have "user" key from downstream
  - Test: Verify downstream processing (Test 7)
  
- [ ] **Req 5:** "user" key is removed from response
  - Test: Send valid request → confirm "user" NOT in response