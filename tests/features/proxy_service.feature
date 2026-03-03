Feature: Simple Proxy Service
  As a proxy service
  I want to validate request bodies for required fields
  So that I can strip the user field from successful responses and handle errors appropriately

  Background:
    Given the proxy service is running at "http://localhost:8000"

  Scenario: Successful login proxies and strips user
    When I send a POST request to "/api/login" with JSON body:
      """
      {
        "user": 40,
        "password": "12345"
      }
      """
    Then the response status should be 200
    And the response JSON should contain keys:
      | token      |
      | expires_in |

  Scenario Outline: Missing required field in request returns 400
    When I send a POST request to "/api/login" without "<missingField>"
    Then the response status should be 400
    And the response JSON error message should contain "<expectedMessage>"

    Examples:
      | missingField | expectedMessage                        |
      | user         | Missing 'user' key in request body     |
      | password     | Missing 'password' key in request body |

  Scenario: Non-JSON request body is rejected
    When I send a POST request to "/api/login" with non-JSON body "not-a-json" and content type "application/json"
    Then the response status should be 400

  Scenario: Downstream response missing user returns 404
    When I send a POST request to "/api/unknown" with JSON body:
      """
      {
        "user": 40,
        "password": "12345"
      }
      """
    Then the response status should be 404
