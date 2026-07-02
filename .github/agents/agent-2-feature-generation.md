# Agent 2: EventHub Feature File Generation (BDD/Gherkin)

**Status**: Agent Configuration  
**Version**: 1.0  
**Target Application**: EventHub (https://eventhub.rahulshettyacademy.com/)  
**Input**: `eventhub_functionalities.json` from Agent 1  
**Output Files**: Single consolidated `test.feature` file with all scenarios, Feature index, Scenario mapping, BDD metadata

---

## CRITICAL: Anti-Hallucination Instructions

**⚠️ READ CAREFULLY: This agent converts real discovered functionality into BDD scenarios.**

### What This Agent MUST Do
1. **READ & VALIDATE Agent 1's JSON** — Verify all required fields exist before processing
2. **CONVERT steps → Gherkin** — Translate functionality steps into Given/When/Then format
3. **CREATE REALISTIC SCENARIOS** — Only scenarios from actual discovered functionality
4. **MAP LOCATORS TO STEPS** — Link each step to element locators from JSON
5. **ORGANIZE BY FEATURE** — Group related scenarios into meaningful feature files
6. **FOLLOW BDD BEST PRACTICES** — Use standardized Gherkin syntax and language
7. **GENERATE TRACEABILITY** — Create mapping between scenarios and JSON functionalities

### What This Agent MUST NOT Do
- ❌ Invent scenarios not documented in Agent 1 JSON
- ❌ Use vague step language ("do something", "verify result")
- ❌ Create steps that reference non-existent locators from JSON
- ❌ Mix multiple scenarios into single Scenario
- ❌ Skip error/negative scenarios documented in JSON
- ❌ Create invalid Gherkin syntax
- ❌ Assume data formats not specified in JSON

---

## Agent 2 Execution Plan

### PHASE 1: Initialization & Validation

**Step 1.1: Validate Environment & Input**
```
1. Check input file exists: ./eventhub_discovery/eventhub_functionalities.json
2. Parse JSON file (use jq or JSON parser)
3. Validate JSON structure:
   - Root has: url, discoveredAt, authRequired, authType, pagesDiscovered, functionalities[]
   - Each functionality has:
     - id (string)
     - name (string)
     - type (string)
     - category (string)
     - description (string)
     - preconditions (array)
     - steps (array of {action, element, expectedOutcome})
     - expectedOutcome (string)
     - errorScenarios (array - optional)
     - testDataExamples (object - optional)
     - elements (array of locators - optional)
4. If any required field missing: STOP and report validation error
5. Count functionalities: __count__
6. List all discovered pages from JSON
```

**Step 1.2: Create Output Directory Structure**
```
Create folders:
  - ./features/                         ← Single consolidated feature file location
  - ./features/test.feature             ← CONSOLIDATED: All scenarios in single file
  - ./bdd_metadata/                     ← Metadata files
  - ./bdd_metadata/scenario_mapping.json ← Scenario to functionality mapping
  - ./bdd_metadata/locator_mapping.json ← Step to locator mapping
  - ./bdd_metadata/feature_index.md     ← Index of all features
  - ./bdd_metadata/gherkin_validation.txt ← Validation report
  - ./bdd_metadata/FEATURE_EXECUTION_GUIDE.md ← Execution instructions
  - ./bdd_metadata/agent1_to_agent2_mapping.json ← Traceability matrix

NOTE: All scenarios from all feature areas (auth, events, booking, user) are consolidated
      into a SINGLE test.feature file for easier maintenance and execution.
```

**Step 1.3: Establish Gherkin Standards**
```
Apply these conventions across all feature files:

LANGUAGE: English

FILE NAMING:
  - Lowercase with underscores
  - Descriptive: auth_login.feature, event_browse.feature, etc.
  - Avoid abbreviations

FEATURE NAMING:
  Feature: <Feature Name>
  Description should match JSON "name" field

SCENARIO NAMING:
  Scenario: <User action and expected outcome>
  Pattern: "[User/System] [Action] [Expected Result]"
  Examples:
    - "User logs in with valid credentials and sees dashboard"
    - "User attempts login with invalid email and sees error"
    - "System validates required fields before submission"

TAGS (for traceability):
  @auth            ← Feature area
  @positive        ← Positive scenario (happy path)
  @negative        ← Negative/error scenario
  @validation      ← Field validation
  @ui_interaction  ← UI element interaction
  @json_id_auth_login ← Reference to JSON functionality ID
  @precondition_user_on_login_page ← Reference precondition

STEP LANGUAGE:
  Given: <Initial state or context>
    "Given the user is on the login page"
    "Given the application has discovered following events"
  
  When: <User action or trigger>
    "When the user enters email 'manish123@gmail.com'"
    "When the user clicks the Sign In button"
    "When the user searches for 'Concert'"
  
  Then: <Expected outcome or assertion>
    "Then the user should be redirected to the events page"
    "Then an error message 'Email is required' should appear"
    "Then the event list should display 10 events"

STEP DATA TABLES (for multiple rows):
  When the user fills the booking form with:
    | Field       | Value          |
    | Email       | user@email.com |
    | Name        | John Doe       |
    | Ticket Type | VIP            |

STEP EXAMPLES (using Scenario Outline):
  Scenario Outline: User attempts login with invalid email formats
    When the user enters "<email>" as email
    Then an error should appear

    Examples:
      | email            |
      | notanemail       |
      | @example.com     |
      | user@            |
```

---

### PHASE 2: Parse Agent 1 JSON & Categorize Functionalities

**Step 2.1: Read & Parse JSON**
```
1. Read: ./eventhub_discovery/eventhub_functionalities.json
2. Parse as JSON object
3. Extract root-level metadata:
   - url
   - discoveredAt
   - authRequired
   - authType
   - pagesDiscovered[]
4. Count total functionalities: __count__
5. List all functionality IDs and names:
   [id1] name1
   [id2] name2
   ...
```

**Step 2.2: Categorize Functionalities by Feature Area**
```
Assign each functionality to a feature file based on type/category:

CATEGORY MAPPING:
  type: "authentication"          → features/auth/
  type: "event_browsing"          → features/events/
  type: "event_details"           → features/events/
  type: "event_search"            → features/events/
  type: "event_filtering"         → features/events/
  type: "booking"                 → features/booking/
  type: "user_profile"            → features/user/
  type: "error_handling"          → features/<parent_area>/errors/
  (default)                        → features/general/

For each category, create feature file:
  - Auth functionalities → auth_login.feature, auth_logout.feature, etc.
  - Event functionalities → event_browsing.feature, event_search.feature, etc.
  - Booking functionalities → booking_flow.feature, booking_validation.feature, etc.
  - User functionalities → user_profile.feature, user_preferences.feature, etc.

ORGANIZE feature files by functionality purpose:
  If multiple related functionalities → Single feature file with multiple scenarios
  If independent functionality → Separate feature file
```

**Step 2.3: Identify Shared Background Steps**
```
BACKGROUND STEPS (common to multiple scenarios):

Navigation steps (shared across many features):
  Given the user is on the EventHub application
  Given the user is logged in with email "<email>" and password "<password>"
  Given the user is on the login page
  Given the user is on the events listing page
  
Validation steps (reusable across multiple features):
  Then an error message should appear with text "<text>"
  Then the field "<field>" should show validation error "<error>"
  Then the page should redirect to "<url>"
  Then the element "<element_id>" should be visible

Create Background section in each feature file:
  Feature: <Feature Name>
    Background:
      Given the user is on the EventHub application
      And the application is ready
  
    Scenario: <Scenario 1>
      ...
    
    Scenario: <Scenario 2>
      ...

CRITICAL: Background applies to ALL scenarios in feature file
  - Only include truly common steps
  - If step applies to 2-3 scenarios, include in Background
  - If step unique to 1 scenario, include in Scenario itself
```

---

### PHASE 3: Convert JSON Functionalities → Gherkin Scenarios

**Step 3.1: Map Functionality Structure → Gherkin Structure**
```
JSON Structure:
{
  "id": "auth_login",
  "name": "User Login",
  "type": "authentication",
  "description": "User authentication flow",
  "preconditions": ["User is on login page"],
  "steps": [
    { "action": "Navigate to login page", "element": null, "expectedOutcome": "Login form displayed" },
    { "action": "Enter email", "element": "email_input", "expectedOutcome": "Email appears in field" }
  ],
  "expectedOutcome": "User logged in successfully",
  "errorScenarios": [
    { "scenario": "Empty email", "trigger": "User submits form", "expectedError": "Email required error" }
  ]
}

CONVERSION RULES:

1. Preconditions → Given statements:
   "User is on login page" → Given the user is on the login page

2. Steps array → When/Then statements (alternating):
   - First action → When
   - Subsequent actions → And When
   - Expected outcomes → Then
   - Multiple outcomes per step → Then + And Then
   
   Example:
   {
     "action": "Enter valid email",
     "element": "email_input",
     "expectedOutcome": "Email appears in field"
   }
   
   Converts to:
   When the user enters email 'manish123@gmail.com' in email field
   Then the email 'manish123@gmail.com' should appear in the email input field

3. expectedOutcome → Final Then assertion:
   "User successfully logged in, profile icon visible"
   →
   Then the user should be redirected to events page
   And the profile icon should be visible in the navigation bar

4. errorScenarios → Separate negative Scenario:
   {
     "scenario": "Incorrect password",
     "trigger": "User enters wrong password",
     "expectedError": "Error: 'Invalid credentials'"
   }
   
   Converts to Scenario:
   Scenario: User attempts login with incorrect password and sees error
     Given the user is on the login page
     When the user enters email 'manish123@gmail.com' in email field
     And the user enters password 'WrongPassword' in password field
     And the user clicks the Sign In button
     Then an error message 'Invalid credentials' should appear
     And the user should remain on the login page
```

**Step 3.2: Create Positive Path (Happy Path) Scenario**
```
For each main functionality, create positive scenario (no errors):

Template:
  Scenario: [Feature] - Happy Path
    Given [preconditions from JSON]
    When [action steps from JSON - first When, rest And When]
    Then [expected outcomes from JSON]

Example from Agent 1 "auth_login":
  Scenario: User successfully logs in with valid credentials
    Given the user is on the login page
    When the user enters email 'manish123@gmail.com' in the email field
    And the user enters password 'Manish9@@' in the password field
    And the user clicks the Sign In button
    Then the user should be redirected to the events page
    And the user profile should be visible in the navigation

TAG: @positive @auth @json_id_auth_login
```

**Step 3.3: Create Error Scenarios (Negative Paths)**
```
For each errorScenario in JSON, create separate scenario:

Template:
  Scenario: [Scenario Name from JSON] and sees error
    Given [preconditions]
    When [trigger/action]
    Then [expected error message]
    And [post-error state]

Example from Agent 1 errorScenarios:
  Scenario: User attempts login with empty email and sees validation error
    Given the user is on the login page
    When the user leaves the email field empty
    And the user clicks the Sign In button
    Then an error message 'Email is required' should appear
    And the Sign In button should be disabled
    And the email field should show red border

TAG: @negative @validation @auth @json_id_auth_login_error_empty_email

For each error, include:
  1. Trigger: What user action causes error
  2. Expected error message: Exact text from JSON
  3. Post-error state: What happens after error (remain on page, field highlight, etc.)
```

**Step 3.4: Create Validation Scenarios**
```
For field-level validation errors, create data-driven scenario:

Template:
  Scenario Outline: User sees validation error for invalid <field>
    Given the user is on the [form page]
    When the user enters "<invalid_value>" in the <field> field
    And the user clicks the [submit button]
    Then an error message "<error_message>" should appear
    And the <field> field should be highlighted in red
    
    Examples:
      | invalid_value | field | error_message           |
      | notanemail    | email | Invalid email format    |
      | @example.com  | email | Email must have name    |
      | 12345         | phone | Phone must be 10 digits |

Extract Examples from JSON:
  - testDataExamples.invalidEmail → Use as invalid_value
  - errorScenarios[].expectedError → Use as error_message
  - JSON element validation rules → Determine fields to test

TAG: @negative @validation @parametrized @json_id_[functionality_id]
```

---

### PHASE 4: Extract & Link Locators to Steps

**Step 4.1: Build Locator Reference Map**
```
From JSON elements array, create mapping:
{
  "email_input": {
    "id": "email_input",
    "name": "Email Input",
    "type": "input",
    "action": "fill",
    "locators": [
      { "strategy": "role", "value": "getByRole('textbox', {name: /email/i})", "stability": 1 },
      { "strategy": "css", "value": "input[type='email']", "stability": 2 }
    ]
  },
  ...
}

STABILITY RANKING:
  Rank 1 (Most Stable): Use in feature files
  Rank 2 (Stable): Use as comment/fallback
  Rank 3+ (Fragile): Use as comment only

For each step that references an element:
  When the user enters email 'test@example.com' in email field

Add comment with locator info:
  When the user enters email 'test@example.com' in email field
  # Locator: email_input -> input[type='email'] (Rank 2 - CSS selector)
  # Fallback: getByRole('textbox', {name: /email/i}) (Rank 1 - Most stable)
```

**Step 4.2: Create Locator Mapping JSON**
```
Generate: ./bdd_metadata/locator_mapping.json

Structure:
{
  "locator_references": [
    {
      "step_text": "the user enters email in email field",
      "element_id": "email_input",
      "locators": [
        {
          "strategy": "role",
          "value": "getByRole('textbox', {name: /email/i})",
          "stability": 1
        }
      ],
      "used_in_scenarios": [
        "auth_login.feature::Scenario: User successfully logs in",
        "auth_login.feature::Scenario: User attempts login with empty email"
      ]
    }
  ],
  "element_id_mapping": {
    "email_input": "auth_login.feature, auth_logout.feature",
    "password_input": "auth_login.feature, auth_reset.feature",
    ...
  }
}
```

---

### PHASE 5: Create Consolidated Feature File

**Step 5.1: Consolidate All Scenarios into Single test.feature File**
```
File: features/test.feature

Structure:
  - ONE Feature file: test.feature
  - EIGHT feature blocks (authentication, event browsing, event details, booking, user profile, etc.)
  - ORGANIZED using Feature names and tags
  - ALL scenarios consolidated with full edge case coverage
  - COMPREHENSIVE: Positive, negative, validation, edge cases, boundary conditions

EACH FUNCTIONALITY WILL INCLUDE:
  1. Positive/Happy Path scenario (base case)
  2. Negative scenarios (error handling for each error type)
  3. Validation scenarios (field-level validation with edge cases)
  4. Edge cases:
     - Boundary values (min/max)
     - Empty/null inputs
     - SQL injection attempts
     - XSS attempts
     - Special characters
     - Unicode characters
     - Very long inputs
     - Rapid submissions
     - Network failures
     - Timeout scenarios

CONSOLIDATED FEATURE STRUCTURE:

# ============================================================================
# AUTHENTICATION FEATURES
# ============================================================================

Feature: User Authentication - Login, Logout, and Session Management
  As a user
  I want to authenticate with the EventHub application
  So that I can access personalized features and book events

  Background:
    Given the EventHub application is accessible at https://eventhub.rahulshettyacademy.com/
    And the user is on the login page

  # ---- POSITIVE SCENARIOS ----
  @positive @auth @json_id_auth_login
  Scenario: User successfully logs in with valid credentials
    When the user enters email 'manish123@gmail.com' in the email field
    And the user enters password 'Manish9@@' in the password field
    And the user clicks the Sign In button
    Then the user should be redirected to the events page
    And the user profile should be visible in the navigation
    And the session should be active

  # ---- NEGATIVE SCENARIOS (Empty Fields) ----
  @negative @validation @json_id_auth_login_error_empty_email
  Scenario: User attempts login with empty email field
    When the user leaves the email field empty
    And the user enters password 'Manish9@@' in the password field
    And the user clicks the Sign In button
    Then an error message 'Email is required' should appear
    And the email field should show validation error state
    And the user should remain on the login page

  @negative @validation @json_id_auth_login_error_empty_password
  Scenario: User attempts login with empty password field
    When the user enters email 'manish123@gmail.com' in the email field
    And the user leaves the password field empty
    And the user clicks the Sign In button
    Then an error message 'Password is required' should appear
    And the password field should show validation error state
    And the user should remain on the login page

  @negative @validation @json_id_auth_login_error_both_empty
  Scenario: User attempts login with both email and password empty
    When the user leaves the email field empty
    And the user leaves the password field empty
    And the user clicks the Sign In button
    Then an error message 'Email is required' should appear
    And an error message 'Password is required' should appear

  # ---- NEGATIVE SCENARIOS (Invalid Email Formats) ----
  @negative @validation @parametrized @json_id_auth_login_error_invalid_email
  Scenario Outline: User attempts login with invalid email format and sees error
    When the user enters '<invalid_email>' in the email field
    And the user enters password 'Manish9@@' in the password field
    And the user clicks the Sign In button
    Then an error message '<expected_error>' should appear

    Examples:
      | invalid_email           | expected_error                |
      | notanemail              | Invalid email format          |
      | @example.com            | Email must contain local part |
      | user@                   | Email must contain domain     |
      | user@domain..com        | Invalid email format          |
      | user name@example.com   | Email must not contain spaces |
      | user+tag@example.com    | Email format invalid          |

  # ---- NEGATIVE SCENARIOS (Password Errors) ----
  @negative @auth @json_id_auth_login_error_incorrect_password
  Scenario: User attempts login with incorrect password
    When the user enters email 'manish123@gmail.com' in the email field
    And the user enters password 'WrongPassword123' in the password field
    And the user clicks the Sign In button
    Then an error message 'Invalid credentials' should appear
    And the user should remain on the login page
    And the password field should be cleared for security

  @negative @auth @json_id_auth_login_error_weak_password
  Scenario: User attempts login with account having weak password
    When the user enters email 'testuser@example.com' in the email field
    And the user enters password '123456' in the password field
    And the user clicks the Sign In button
    Then an error message 'Invalid credentials' or 'Login failed' should appear

  # ---- EDGE CASES (Special Characters & SQL Injection) ----
  @negative @edge_case @security @json_id_auth_login_sql_injection
  Scenario: User attempts login with SQL injection payload in email
    When the user enters "admin' --" in the email field
    And the user enters password 'password' in the password field
    And the user clicks the Sign In button
    Then an error message 'Invalid credentials' should appear
    And the user should remain on the login page
    And no database error should be displayed

  @negative @edge_case @security @json_id_auth_login_xss_attempt
  Scenario: User attempts login with XSS payload in email
    When the user enters '<script>alert("XSS")</script>@example.com' in the email field
    And the user enters password 'password' in the password field
    And the user clicks the Sign In button
    Then an error message 'Invalid email format' should appear
    And no JavaScript should execute
    And the payload should be sanitized

  # ---- EDGE CASES (Special Characters & Unicode) ----
  @negative @edge_case @json_id_auth_login_special_chars
  Scenario Outline: User attempts login with special characters in email
    When the user enters '<special_email>' in the email field
    And the user enters password 'Manish9@@' in the password field
    And the user clicks the Sign In button
    Then an error message '<error_type>' should appear

    Examples:
      | special_email                | error_type            |
      | user\\@example.com            | Invalid email format  |
      | user@exam%le.com             | Invalid email format  |
      | user@example!.com            | Invalid email format  |
      | यूजर@example.com              | Invalid email format  |
      | user@例え.jp                  | Invalid email format  |

  # ---- EDGE CASES (Length Boundaries) ----
  @negative @edge_case @json_id_auth_login_long_email
  Scenario: User attempts login with extremely long email address
    When the user enters a 500-character email address in the email field
    And the user enters password 'Manish9@@' in the password field
    And the user clicks the Sign In button
    Then an error message 'Email is too long' or 'Invalid email' should appear
    And the user should remain on the login page

  @negative @edge_case @json_id_auth_login_long_password
  Scenario: User attempts login with extremely long password
    When the user enters email 'manish123@gmail.com' in the email field
    And the user enters a 1000-character password in the password field
    And the user clicks the Sign In button
    Then an error message 'Password is too long' or 'Invalid credentials' should appear
    And the user should remain on the login page

  # ---- EDGE CASES (Case Sensitivity) ----
  @edge_case @json_id_auth_login_case_sensitivity_email
  Scenario: User attempts login with uppercase/mixed case email
    When the user enters email 'MANISH123@GMAIL.COM' in the email field
    And the user enters password 'Manish9@@' in the password field
    And the user clicks the Sign In button
    Then the system should handle case-insensitive email matching
    And the login should either succeed or show appropriate error

  # ---- EDGE CASES (Whitespace Handling) ----
  @edge_case @json_id_auth_login_whitespace_email
  Scenario: User attempts login with leading/trailing spaces in email
    When the user enters email '  manish123@gmail.com  ' in the email field
    And the user enters password 'Manish9@@' in the password field
    And the user clicks the Sign In button
    Then the system should trim whitespace
    And the login should succeed or handle trimming properly

  @edge_case @json_id_auth_login_whitespace_password
  Scenario: User attempts login with spaces in password
    When the user enters email 'manish123@gmail.com' in the email field
    And the user enters password '  Manish9@@  ' in the password field
    And the user clicks the Sign In button
    Then the password field should NOT trim spaces (passwords are case/space sensitive)
    And an error message 'Invalid credentials' should appear

  # ---- NEGATIVE SCENARIOS (Non-existent User) ----
  @negative @auth @json_id_auth_login_user_not_found
  Scenario: User attempts login with non-existent email address
    When the user enters email 'nonexistent@example.com' in the email field
    And the user enters password 'Password123' in the password field
    And the user clicks the Sign In button
    Then an error message 'Invalid credentials' should appear
    And the user should remain on the login page

  # ---- EDGE CASES (Rapid Submissions) ----
  @negative @edge_case @json_id_auth_login_brute_force_protection
  Scenario: User attempts multiple failed logins rapidly
    When the user attempts to login 5 times with wrong password
    Then after 3-5 failed attempts, the account should be temporarily locked
    Or a CAPTCHA should appear
    Or an error message 'Too many failed attempts' should appear
    And the user should see a cooldown message

  # ---- EDGE CASES (Network/Timeout) ----
  @negative @edge_case @json_id_auth_login_network_timeout
  Scenario: User attempts login during network timeout
    When the user enters email 'manish123@gmail.com' in the email field
    And the user enters password 'Manish9@@' in the password field
    And the network connection is slow or times out
    And the user clicks the Sign In button
    Then an error message 'Network error' or 'Connection timeout' should appear
    And the user should see a retry option
    And the form should remain populated for retry

  # ---- SESSION MANAGEMENT ----
  @positive @auth @json_id_auth_session_timeout
  Scenario: User session expires after inactivity
    Given the user is logged in and on the events page
    When the user is inactive for 30 minutes
    And the user attempts to perform an action
    Then the user should be redirected to the login page
    And an error message 'Session expired. Please login again' should appear

  @positive @auth @json_id_auth_logout
  Scenario: User successfully logs out from application
    Given the user is logged in and on the events page
    When the user clicks the Logout button
    Then the user should be redirected to the login page
    And the user session should be cleared
    And the browser should not store sensitive data

# ============================================================================
# EVENT BROWSING & SEARCH FEATURES
# ============================================================================

Feature: Event Discovery - Browse, Search, Filter, and View Events
  As a logged-in user
  I want to discover and search for events
  So that I can find events that match my interests

  Background:
    Given the user is logged in with email 'manish123@gmail.com' and password 'Manish9@@'
    And the user is on the events listing page
    And the events page displays a list of available events

  # ---- POSITIVE SCENARIOS (Browse) ----
  @positive @event_browsing @json_id_event_list_display
  Scenario: User views list of available events
    Then the events page should display at least 1 event
    And each event should show title, date, time, location, and price
    And the events should be displayed in a list or grid format
    And event images should load successfully
    And pagination should be available if more than 10 events

  # ---- POSITIVE SCENARIOS (Search) ----
  @positive @event_search @json_id_event_search
  Scenario: User successfully searches for events by keyword
    When the user enters 'Concert' in the search box
    And the user presses Enter or clicks the search button
    Then the events list should be filtered to show matching events
    And events containing 'Concert' should be displayed
    And events not matching should be hidden
    And the search results count should be displayed
    And a 'Clear Search' button should appear

  @positive @event_search @json_id_event_search_partial_match
  Scenario: User searches for events with partial keyword matching
    When the user enters 'Con' in the search box
    Then events containing 'Concert', 'Conference', 'Conclave' should appear
    And search suggestions/autocomplete should help the user

  # ---- NEGATIVE SCENARIOS (Search No Results) ----
  @negative @event_search @json_id_event_search_error_no_results
  Scenario: User searches for events with no matching results
    When the user enters 'NonexistentEventXYZ123' in the search box
    And the user presses Enter or clicks the search button
    Then a message 'No events found' or 'No results' should appear
    And the events list should be empty
    And a suggestion to refine search should appear
    And 'Browse all events' option should be available

  # ---- EDGE CASES (Search Special Characters) ----
  @negative @edge_case @json_id_event_search_special_chars
  Scenario: User searches for events with special characters
    When the user enters '@#$%^&*()' in the search box
    Then no results should appear
    Or events with special character names should be found
    And no error should crash the search

  @negative @edge_case @json_id_event_search_sql_injection
  Scenario: User attempts search with SQL injection payload
    When the user enters "'; DROP TABLE events; --" in the search box
    Then an error should not occur
    And no database error should be displayed
    And the payload should be treated as literal search string

  # ---- EDGE CASES (Search Length) ----
  @edge_case @json_id_event_search_long_query
  Scenario: User searches with very long search query
    When the user enters a 500-character search string in the search box
    Then the system should handle it gracefully
    And either show no results or truncate the input
    And no error message should appear

  # ---- EDGE CASES (Empty Search) ----
  @edge_case @json_id_event_search_empty_query
  Scenario: User submits empty search query
    When the user clears the search box
    And the user presses Enter or clicks the search button
    Then all events should be displayed (reset to default view)
    Or a message 'Please enter search term' should appear

  # ---- FILTER SCENARIOS ----
  @positive @event_filter @json_id_event_filter_by_date
  Scenario: User filters events by date range
    When the user selects date range from 2026-07-01 to 2026-07-31
    Then only events within this date range should be displayed
    And events outside range should be hidden

  @positive @event_filter @json_id_event_filter_by_location
  Scenario: User filters events by location
    When the user selects 'Delhi' as location filter
    Then only events in Delhi should be displayed
    And events in other cities should be hidden

  @positive @event_filter @json_id_event_filter_by_price
  Scenario: User filters events by price range
    When the user sets price range from 500 to 2000
    Then only events within price range should be displayed
    And price is calculated correctly

  @positive @event_filter @json_id_event_filter_multiple
  Scenario: User applies multiple filters together
    When the user filters by date AND location AND price range
    Then results should match ALL filter criteria
    And no events outside filters should appear

  @negative @event_filter @json_id_event_filter_no_results_combined
  Scenario: User applies filters that result in no events
    When the user applies conflicting filters
    Then a message 'No events match your criteria' should appear
    And suggestions to adjust filters should be shown
    And 'Clear Filters' button should work

  # ---- PAGINATION ----
  @positive @event_pagination @json_id_event_pagination
  Scenario: User navigates through event pages
    Given there are 25+ events available
    When the user is on page 1 showing 10 events
    And the user clicks 'Next' button
    Then page 2 should display events 11-20
    And 'Previous' button should be enabled
    And page indicator should show correct page number

  @negative @event_pagination @json_id_event_pagination_invalid_page
  Scenario: User attempts to access invalid page number
    When the user tries to access page 999
    Then an error message or redirect should appear
    Or the user should see last available page

# ============================================================================
# EVENT DETAILS FEATURES
# ============================================================================

Feature: Event Details - View Comprehensive Event Information
  As a logged-in user
  I want to view detailed information about specific events
  So that I can make informed booking decisions

  Background:
    Given the user is logged in and on the events listing page

  # ---- POSITIVE SCENARIOS ----
  @positive @event_details @json_id_event_details_view
  Scenario: User views event details by clicking on an event
    When the user clicks on an event in the list
    Then the event details page should load
    And the event title should be displayed prominently
    And the event date, time, and location should be shown
    And the event description should be visible
    And the event price should be displayed
    And event capacity information should be shown
    And a 'Book Now' or 'Register' button should be present
    And share and favorite buttons should be available

  @positive @event_details @json_id_event_details_booking_trigger
  Scenario: User clicks Book Now button and sees booking form
    When the user clicks on an event in the list
    And the event details page loads
    And the user clicks the 'Book Now' button
    Then the booking form or modal should appear
    And the event name should be pre-filled
    And the number of tickets field should be editable
    And the total price calculation should be visible

  @positive @event_details @json_id_event_details_favorite
  Scenario: User adds event to favorites
    When the user views event details
    And the user clicks the 'Add to Favorites' button
    Then the event should be added to favorites
    And the button should show 'Remove from Favorites'
    And the favorite icon should be highlighted

  @positive @event_details @json_id_event_details_share
  Scenario: User shares event details
    When the user views event details
    And the user clicks the 'Share' button
    Then share options (email, social media, link copy) should appear
    And user should be able to share successfully
    And a confirmation message should appear

  # ---- NEGATIVE SCENARIOS ----
  @negative @event_details @json_id_event_details_sold_out
  Scenario: User views sold-out event details
    When the user views details of a sold-out event
    Then the 'Book Now' button should be disabled
    And a message 'Event Sold Out' should appear
    And a 'Waitlist' option might be available

  @negative @event_details @json_id_event_details_cancelled
  Scenario: User views cancelled event details
    When the user views details of a cancelled event
    Then the 'Book Now' button should be disabled
    And a red banner 'Event Cancelled' should appear
    And refund information (if applicable) should be shown

  # ---- EDGE CASES ----
  @edge_case @event_details @json_id_event_details_long_description
  Scenario: User views event with very long description
    When the user views event with 5000+ character description
    Then the description should be properly formatted
    And it should have 'Read More/Less' toggle if too long
    And no layout issues should occur

  @negative @edge_case @json_id_event_details_missing_image
  Scenario: User views event with missing image
    When the user views event details where image fails to load
    Then a placeholder image should appear
    And the rest of the details should be readable
    And no error should crash the page

# ============================================================================
# BOOKING FEATURES
# ============================================================================

Feature: Event Booking - Book Tickets, Validate Forms, and Complete Transactions
  As a logged-in user
  I want to book tickets for events
  So that I can secure my attendance

  Background:
    Given the user is logged in and on the event details page
    And the booking form is displayed

  # ---- POSITIVE SCENARIOS ----
  @positive @booking @json_id_booking_start
  Scenario: User fills booking form with valid ticket quantity
    When the user selects '2' tickets
    Then the total number of tickets should show '2'
    And the price should be calculated correctly
    And the 'Next' or 'Confirm' button should be enabled

  @positive @booking @json_id_booking_attendee_details
  Scenario: User fills attendee details for single ticket booking
    When the user selects '1' ticket
    And the user enters attendee name 'John Doe'
    And the user enters attendee email 'john@example.com'
    And the user enters attendee phone '9876543210'
    Then all attendee details should be visible in a summary
    And the booking should be ready for confirmation
    And no validation errors should appear

  @positive @booking @json_id_booking_multiple_attendees
  Scenario: User fills details for multiple attendees
    When the user selects '3' tickets
    And the user fills attendee details for each ticket:
      | Name      | Email             | Phone      |
      | John Doe  | john@example.com  | 9876543210 |
      | Jane Doe  | jane@example.com  | 9876543211 |
      | Bob Smith | bob@example.com   | 9876543212 |
    Then all attendee details should be captured
    And the booking summary should show all attendees

  @positive @booking @json_id_booking_promo_code
  Scenario: User applies valid promo code to booking
    When the user enters valid promo code 'SAVE10' in promo field
    And the user clicks 'Apply Promo Code'
    Then a discount of 10% should be applied
    And the total price should be recalculated
    And a 'Promo code applied successfully' message should appear

  # ---- NEGATIVE SCENARIOS (Quantity) ----
  @negative @validation @json_id_booking_error_zero_tickets
  Scenario: User attempts to book with zero tickets
    When the user tries to set ticket quantity to '0'
    Then an error message 'At least 1 ticket required' should appear
    Or the field should not allow '0' as input
    And the Confirm button should remain disabled

  @negative @validation @json_id_booking_error_negative_tickets
  Scenario: User attempts to book with negative ticket quantity
    When the user tries to enter '-5' in ticket quantity field
    Then the field should not accept negative values
    Or an error message should appear

  @negative @validation @json_id_booking_error_exceeds_limit
  Scenario: User attempts to book more tickets than available
    Given the event has only 5 tickets remaining
    When the user tries to book '10' tickets
    Then an error message 'Only 5 tickets available' should appear
    And the user should be limited to available quantity

  @negative @validation @json_id_booking_error_exceeds_per_user_limit
  Scenario: User attempts to book more than per-person limit
    Given the event has a limit of 4 tickets per person
    When the user tries to book '6' tickets
    Then an error message 'Maximum 4 tickets per person' should appear

  # ---- NEGATIVE SCENARIOS (Missing Fields) ----
  @negative @validation @json_id_booking_error_missing_fields
  Scenario Outline: User attempts to book with missing attendee information
    When the user selects '1' ticket
    And the user leaves '<missing_field>' empty
    And the user clicks the 'Confirm Booking' button
    Then an error message '<error_message>' should appear
    And the booking should not be confirmed

    Examples:
      | missing_field | error_message          |
      | Name          | Attendee name required |
      | Email         | Attendee email required|
      | Phone         | Attendee phone required|

  @negative @validation @json_id_booking_error_invalid_email
  Scenario: User enters invalid email in attendee details
    When the user enters 'notanemail' in the email field
    And the user clicks the 'Confirm Booking' button
    Then an error message 'Please enter valid email' should appear
    And the email field should be highlighted

  @negative @validation @json_id_booking_error_invalid_phone
  Scenario: User enters invalid phone number in attendee details
    When the user enters '123' in the phone field
    And the user clicks the 'Confirm Booking' button
    Then an error message 'Phone must be 10 digits' should appear

  # ---- EDGE CASES (Special Characters) ----
  @edge_case @json_id_booking_special_chars_name
  Scenario: User enters special characters in attendee name
    When the user enters '@#$%John' in the name field
    Then the system should reject or sanitize the input
    And an error message 'Name should contain only letters' should appear
    Or special characters should be removed

  @edge_case @json_id_booking_unicode_name
  Scenario: User enters Unicode/non-ASCII characters in attendee name
    When the user enters 'João Silva' in the name field
    Then the system should accept international characters
    And the booking should proceed successfully

  # ---- EDGE CASES (Length) ----
  @edge_case @json_id_booking_long_name
  Scenario: User enters very long attendee name
    When the user enters a 200-character name
    Then the system should either accept it or truncate at max length
    And an error 'Name too long' should appear if rejected

  # ---- EDGE CASES (Whitespace) ----
  @edge_case @json_id_booking_whitespace_name
  Scenario: User enters name with extra whitespace
    When the user enters '  John  Doe  ' as attendee name
    Then the system should trim whitespace
    And the name should be stored as 'John Doe'

  # ---- EDGE CASES (Rapid Clicks) ----
  @edge_case @json_id_booking_double_click_confirm
  Scenario: User double-clicks Confirm button during booking
    When the user fills all required booking details
    And the user double-clicks the Confirm Booking button
    Then only ONE booking should be created
    And duplicate booking should not occur
    And a message 'Booking in progress' should prevent additional clicks

  # ---- NEGATIVE SCENARIOS (Promo Code) ----
  @negative @booking @json_id_booking_invalid_promo_code
  Scenario: User applies invalid promo code
    When the user enters invalid promo code 'INVALID123' in promo field
    And the user clicks 'Apply Promo Code'
    Then an error message 'Invalid promo code' should appear
    And the price should not change
    And the booking should still proceed without promo

  @negative @booking @json_id_booking_expired_promo_code
  Scenario: User applies expired promo code
    When the user enters expired promo code 'EXPIRED10' in promo field
    And the user clicks 'Apply Promo Code'
    Then an error message 'Promo code expired' should appear
    And the original price should be shown

  # ---- PAYMENT SCENARIOS ----
  @positive @booking_payment @json_id_booking_payment_screen
  Scenario: User proceeds to payment after filling booking details
    When the user completes booking form with all valid details
    And the user clicks 'Proceed to Payment'
    Then the payment page should load
    And the booking summary should be displayed
    And payment method options should be available
    And the total amount should be clearly shown

  @negative @booking_payment @json_id_booking_payment_failure
  Scenario: User attempts booking with payment method failure
    When the user completes booking form
    And the user proceeds to payment
    And the payment is declined
    Then an error message 'Payment failed' should appear
    And a retry option should be provided
    And the booking details should remain intact for retry

# ============================================================================
# USER PROFILE FEATURES
# ============================================================================

Feature: User Profile - Manage Account, Bookings, and Preferences
  As a logged-in user
  I want to manage my profile and view my bookings
  So that I can stay organized and access my event information

  Background:
    Given the user is logged in with email 'manish123@gmail.com'
    And the user navigates to the profile page

  # ---- POSITIVE SCENARIOS (Profile View) ----
  @positive @user_profile @json_id_user_profile_view
  Scenario: User views their profile information
    Then the profile page should display the user's email
    And the profile page should display the user's name (if available)
    And the profile page should display the user's phone (if available)
    And an 'Edit' button should be present
    And the profile picture (if set) should be displayed

  # ---- POSITIVE SCENARIOS (Bookings History) ----
  @positive @user_profile @json_id_user_profile_bookings
  Scenario: User views their booking history
    When the user navigates to the 'My Bookings' section
    Then the user should see a list of their bookings
    And each booking should show event name, date, and status
    And a 'View Details' option should be available for each booking
    And bookings should be sorted by date (newest first)

  @positive @user_profile @json_id_user_profile_bookings_empty
  Scenario: User with no bookings views booking history
    Given the user has no bookings
    When the user navigates to 'My Bookings'
    Then a message 'You have no bookings yet' should appear
    And a 'Browse Events' link should be provided

  # ---- POSITIVE SCENARIOS (Profile Edit) ----
  @positive @user_profile @json_id_user_profile_edit
  Scenario: User updates their profile information
    When the user clicks 'Edit Profile' button
    And the user updates their name to 'Manish Kumar'
    And the user updates their phone to '9876543210'
    And the user clicks 'Save Changes'
    Then the changes should be saved successfully
    And a success message 'Profile updated' should appear
    And the profile page should reflect the updated information

  # ---- NEGATIVE SCENARIOS (Profile Edit Validation) ----
  @negative @user_profile @json_id_user_profile_edit_invalid_phone
  Scenario: User attempts to update profile with invalid phone
    When the user clicks 'Edit Profile'
    And the user enters invalid phone '123' in phone field
    And the user clicks 'Save Changes'
    Then an error message 'Phone must be 10 digits' should appear
    And the changes should not be saved

  # ---- POSITIVE SCENARIOS (Favorites) ----
  @positive @user_profile @json_id_user_profile_favorites
  Scenario: User views their favorite events
    When the user navigates to 'My Favorites'
    Then the user should see all events they marked as favorites
    And each favorite should show event details
    And a 'Remove from Favorites' option should be available

  # ---- POSITIVE SCENARIOS (Account Settings) ----
  @positive @user_profile @json_id_user_profile_change_password
  Scenario: User changes their password successfully
    When the user navigates to 'Account Settings'
    And the user enters current password 'Manish9@@'
    And the user enters new password 'NewPassword123@@'
    And the user confirms new password 'NewPassword123@@'
    And the user clicks 'Change Password'
    Then the password should be updated
    And a success message 'Password changed successfully' should appear
    And the user should remain logged in

  @negative @user_profile @json_id_user_profile_change_password_wrong_current
  Scenario: User attempts password change with wrong current password
    When the user navigates to 'Account Settings'
    And the user enters current password 'WrongPassword'
    And the user enters new password 'NewPassword123@@'
    And the user clicks 'Change Password'
    Then an error message 'Current password is incorrect' should appear
    And the password should not be changed

  @negative @user_profile @json_id_user_profile_change_password_mismatch
  Scenario: User attempts password change with mismatched new passwords
    When the user navigates to 'Account Settings'
    And the user enters current password 'Manish9@@'
    And the user enters new password 'NewPassword123@@'
    And the user confirms with 'DifferentPassword123@@'
    And the user clicks 'Change Password'
    Then an error message 'Passwords do not match' should appear
    And the password should not be changed

  # ---- EDGE CASES (Account) ----
  @edge_case @user_profile @json_id_user_profile_weak_password
  Scenario: User attempts to set weak password
    When the user navigates to 'Account Settings'
    And the user enters current password 'Manish9@@'
    And the user enters weak new password '12345' (too short/simple)
    And the user clicks 'Change Password'
    Then an error message about password complexity should appear
    And the password should not be changed
```

CONSOLIDATION BENEFITS:
  - ALL scenarios in ONE file for easy management
  - Clear feature-based organization with comments
  - Complete edge case coverage per functionality
  - Comprehensive test data examples
  - Better traceability with organized tags
  - Easier to maintain and update
  - Faster CI/CD execution (single file run)
  - Better version control (single file diff)
```

---

### PHASE 6: Generate Metadata Files

**Step 6.1: Create Scenario Mapping JSON**
```
File: ./bdd_metadata/scenario_mapping.json

Structure:
{
  "mapping": [
    {
      "scenario_id": "auth_login_positive",
      "feature_file": "features/test.feature",
      "scenario_name": "User successfully logs in with valid credentials",
      "json_functionality_id": "auth_login",
      "scenario_type": "positive",
      "tags": ["@positive", "@auth", "@json_id_auth_login"],
      "given_statements": [
        "the EventHub application is accessible",
        "the user is on the login page"
      ],
      "when_statements": [
        "the user enters email 'manish123@gmail.com'",
        "the user enters password 'Manish9@@'",
        "the user clicks the Sign In button"
      ],
      "then_statements": [
        "the user should be redirected to the events page",
        "the user profile should be visible"
      ],
      "elements_used": ["email_input", "password_input", "signin_button"],
      "test_data": {
        "email": "manish123@gmail.com",
        "password": "Manish9@@"
      }
    },
    ...
  ],
  "summary": {
    "total_scenarios": 100,
    "positive_scenarios": 25,
    "negative_scenarios": 35,
    "edge_case_scenarios": 25,
    "validation_scenarios": 15,
    "parametrized_scenarios": 8,
    "security_test_scenarios": 5,
    "feature_file_count": 1,
    "file_location": "features/test.feature"
  }
}
```

**Step 6.2: Create Feature Index Markdown**
```
File: ./bdd_metadata/feature_index.md

# EventHub Feature Index - Consolidated Single File Format

## Summary
- **Total Feature File**: 1 (test.feature)
- **Total Scenarios**: 100+
- **Positive Scenarios**: 25+
- **Negative Scenarios**: 35+
- **Edge Case Scenarios**: 25+
- **Validation Scenarios**: 15+
- **Security Test Cases**: 5+
- **Parametrized Scenarios**: 8+

## Single Feature File Organization

### test.feature (features/test.feature)
One consolidated file organized into feature blocks:

#### Authentication Features (20+ scenarios)
- Positive: User login, session management, logout
- Negative: Empty fields, invalid credentials, non-existent user
- Edge Cases: SQL injection, XSS attempts, special characters, Unicode, long inputs
- Validation: Email format, password format
- Security: Brute force protection, account lockout
- Edge Cases: Whitespace handling, case sensitivity, rapid submissions, network timeout

#### Event Browsing & Search Features (25+ scenarios)
- Positive: Browse events, search keywords, partial matching
- Negative: No search results, invalid queries
- Edge Cases: SQL injection in search, XSS payload, special characters
- Search: Empty query, very long query, whitespace handling
- Filters: Date range, location, price range, multiple filters combined
- Pagination: Navigate pages, invalid page numbers

#### Event Details Features (15+ scenarios)
- Positive: View details, add to favorites, share event
- Negative: Sold-out events, cancelled events
- Edge Cases: Long descriptions, missing images, Unicode content

#### Event Booking Features (30+ scenarios)
- Positive: Single ticket, multiple tickets, attendee details, promo code, payment
- Negative: Zero/negative tickets, exceeds limits, missing fields, invalid data
- Edge Cases: Special characters in name, Unicode names, long names, whitespace
- Validation: Email format, phone format, name validation
- Security: Double-click protection, rapid submissions
- Payment: Success and failure scenarios

#### User Profile Features (15+ scenarios)
- Positive: View profile, edit profile, view bookings, change password, favorites
- Negative: Invalid phone, wrong current password, password mismatch
- Edge Cases: Weak passwords, long names, special characters
- Validation: Profile field validation, password strength

## Scenario Distribution

| Category | Count | Percentage |
|----------|-------|------------|
| Positive (Happy Path) | 25+ | 25% |
| Negative (Error Cases) | 35+ | 35% |
| Edge Cases & Boundary | 25+ | 25% |
| Validation & Security | 15+ | 15% |

## Element Usage Report

**All locators used throughout test.feature with stability rankings:**
- email_input: 12+ scenarios (authentication, booking, profile)
- password_input: 10+ scenarios (authentication, password change)
- signin_button: 8+ scenarios (authentication flows)
- search_box: 8+ scenarios (event search and filter)
- event_card: 10+ scenarios (browsing, details, booking)
- ticket_selector: 8+ scenarios (booking flows)
- attendee_form_fields: 12+ scenarios (booking validation)
- promo_code_input: 4+ scenarios (booking with discounts)
- profile_edit_button: 5+ scenarios (profile management)
- payment_methods: 3+ scenarios (payment flows)
```

**Step 6.3: Create Gherkin Validation Report**
```
File: ./bdd_metadata/gherkin_validation.txt

Content:

GHERKIN VALIDATION REPORT
Generated: 2026-06-23 10:30:00
Total Feature Files Validated: 6

✓ SYNTAX VALIDATION
  - All feature files have valid Gherkin syntax
  - Total Scenarios: 25
  - Total Steps: 145
  - Average Steps per Scenario: 5.8

✓ STEP LANGUAGE CONSISTENCY
  - Given statements: 18 unique
  - When statements: 32 unique
  - Then statements: 28 unique
  - Step reusability: 45% (shared step definitions possible)

✓ TAG VALIDATION
  - @positive: 8 scenarios
  - @negative: 12 scenarios
  - @validation: 5 scenarios
  - @json_id_*: 25 scenarios (all mapped to JSON)
  - @parametrized: 3 scenarios (Scenario Outlines)

✓ ELEMENT REFERENCE VALIDATION
  - Total locator references: 35
  - Elements with locators in JSON: 32 (91%)
  - Missing locators: 3 (requires Agent 1 update)

✓ TEST DATA VALIDATION
  - Hardcoded test data in scenarios: 8
  - Parametrized test data (Examples): 3
  - Data consistency: All matches testDataExamples from JSON

⚠ WARNINGS
  - 2 scenarios without explicit error message assertions (recommendations made)
  - 1 scenario with vague assertion language (review needed)

✓ RECOMMENDATION: Ready for Agent 3 (Step Definition Generation)

NEXT STEPS:
  1. Review validation report
  2. Fix any warnings
  3. Provide feature files to Agent 3
  4. Agent 3 will generate step definitions with locator integration
```

---

### PHASE 7: Create Feature Files Summary Document

**Step 7.1: Create Feature Execution Guide**
```
File: ./bdd_metadata/FEATURE_EXECUTION_GUIDE.md

# EventHub Feature Execution Guide

## Quick Start

### Running All Features
\`\`\`bash
npx cucumber-js features/
\`\`\`

### Running Specific Feature Category
\`\`\`bash
npx cucumber-js features/auth/          # Only authentication
npx cucumber-js features/events/        # Only events
npx cucumber-js features/booking/       # Only booking
\`\`\`

### Running Specific Scenario
\`\`\`bash
npx cucumber-js features/auth/auth_login.feature
\`\`\`

### Running by Tag
\`\`\`bash
npx cucumber-js features/ --tags="@positive"    # Happy path only
npx cucumber-js features/ --tags="@negative"    # Error scenarios only
npx cucumber-js features/ --tags="@validation"  # Validation only
npx cucumber-js features/ --tags="@auth"        # Auth features only
\`\`\`

## Feature Categories

### Authentication Features (`features/auth/`)
**Purpose**: Test user login/logout and authentication flows  
**Files**: auth_login.feature  
**Scenarios**: 5  
**Precondition**: User should have test account (manish123@gmail.com / Manish9@@)  
**Expected Duration**: ~2 minutes

### Event Browsing Features (`features/events/`)
**Purpose**: Test event discovery, search, and filtering  
**Files**: event_browsing.feature, event_details.feature  
**Scenarios**: 5  
**Precondition**: User must be logged in  
**Expected Duration**: ~3 minutes

### Booking Features (`features/booking/`)
**Purpose**: Test booking form validation and submission  
**Files**: booking_flow.feature  
**Scenarios**: 5  
**Precondition**: User must be logged in and event selected  
**Expected Duration**: ~3 minutes

### User Profile Features (`features/user/`)
**Purpose**: Test user account management  
**Files**: user_profile.feature  
**Scenarios**: 2  
**Precondition**: User must be logged in  
**Expected Duration**: ~1 minute

## Test Data

### Primary Test Account
- Email: manish123@gmail.com
- Password: Manish9@@
- Status: Valid account for all scenarios

### Sample Event Data
- Event 1: Concert on 2026-07-15 at Delhi
- Event 2: Conference on 2026-07-20 at Mumbai
- Event 3: Workshop on 2026-07-25 at Bangalore

### Invalid Test Data
- Invalid emails: notanemail, @example.com, user@
- Invalid phone: 123, abcdefghij
- Invalid passwords: short, 123, password (if complexity required)

## CI/CD Integration

### GitHub Actions Example
\`\`\`yaml
name: EventHub BDD Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run BDD tests
        run: npx cucumber-js features/ --parallel 2
\`\`\`

## Debugging Failed Scenarios

### Step 1: Check Error Message
Look for step definition missing or step execution error

### Step 2: Verify Locators
Check `./bdd_metadata/locator_mapping.json` for element locators

### Step 3: Review Screenshot (if available)
Most step definitions should capture screenshots on failure

### Step 4: Check Test Data
Verify test data in scenario matches element expectations

## Success Criteria

✓ All positive scenarios pass  
✓ All negative scenarios catch expected errors  
✓ All validation scenarios catch missing/invalid data  
✓ No flaky tests (consistently pass/fail)  
✓ <5 second average step execution time  
✓ <2 minute total feature execution time
```

---

### PHASE 8: Generate Traceability Matrix

**Step 8.1: Create Agent 1 to Agent 2 Mapping**
```
File: ./bdd_metadata/agent1_to_agent2_mapping.json

Structure:
{
  "mapping": [
    {
      "agent1_functionality_id": "auth_login",
      "agent1_name": "User Login",
      "agent1_steps_count": 4,
      "agent1_error_scenarios_count": 4,
      "agent2_feature_file": "features/auth/auth_login.feature",
      "agent2_scenarios_generated": [
        {
          "scenario_name": "User successfully logs in with valid credentials",
          "scenario_type": "positive",
          "derived_from_json_steps": true,
          "error_scenarios_included": 0
        },
        {
          "scenario_name": "User attempts login with empty email",
          "scenario_type": "negative",
          "derived_from_json_steps": false,
          "error_scenarios_included": 1
        },
        ...
      ],
      "total_scenarios_generated": 5,
      "traceability_status": "COMPLETE"
    },
    ...
  ],
  "summary": {
    "total_json_functionalities": 8,
    "total_scenarios_generated": 25,
    "coverage_percentage": 100,
    "unmapped_functionalities": 0
  }
}
```

---

### PHASE 9: Generate Agent 2 Completion Summary

**Step 9.1: Display Completion Report**
```
✓ Agent 2: Feature Generation Completed Successfully

VALIDATION RESULTS:
  ✓ Input JSON validated: 8 functionalities found
  ✓ Output directories created: 6 feature folders
  ✓ Feature files generated: 6 files
  ✓ Total scenarios created: 25 scenarios
    - Positive: 8 scenarios
    - Negative: 12 scenarios
    - Validation: 5 scenarios
  ✓ Parametrized scenarios: 3 Scenario Outlines
  ✓ Gherkin syntax validated: 100% pass
  ✓ Step language consistency: 95% reusable steps
  ✓ Element locators mapped: 91% coverage
  ✓ Metadata generated: 5 mapping files

OUTPUT FILES:
  ✓ features/auth/auth_login.feature (5 scenarios)
  ✓ features/events/event_browsing.feature (3 scenarios)
  ✓ features/events/event_details.feature (2 scenarios)
  ✓ features/booking/booking_flow.feature (5 scenarios)
  ✓ features/user/user_profile.feature (2 scenarios)
  ✓ bdd_metadata/scenario_mapping.json
  ✓ bdd_metadata/locator_mapping.json
  ✓ bdd_metadata/feature_index.md
  ✓ bdd_metadata/gherkin_validation.txt
  ✓ bdd_metadata/FEATURE_EXECUTION_GUIDE.md
  ✓ bdd_metadata/agent1_to_agent2_mapping.json

STATISTICS:
  Total Steps: 145
  Unique Step Definitions Possible: 65 (45% reusable)
  Average Steps per Scenario: 5.8
  Estimated Test Execution Time: ~9 minutes

RECOMMENDATIONS:
  1. Review gherkin_validation.txt for any warnings
  2. Update test.locator.ts with all discovered locators
  3. Proceed to Agent 3 for step definition generation
  4. Consider CI/CD integration with provided YAML template

READY FOR AGENT 3: Step Definition Generation? (y/n)
  If YES: Provide feature files and locator mappings to Agent 3
  If NO: What needs revision or improvement?
```

---

## Validation Checklist

Before completing Agent 2, verify:

- [ ] Input JSON file exists and is valid
- [ ] JSON structure validated (all required fields present)
- [ ] 8+ functionalities parsed from JSON
- [ ] Single consolidated test.feature file created
- [ ] All scenarios from Agent 1 JSON included
- [ ] Positive path scenarios generated (20+)
- [ ] Negative/error scenarios generated (35+)
- [ ] Edge case scenarios generated (25+)
- [ ] Validation scenarios with Examples generated (15+)
- [ ] Parametrized Scenario Outlines for data-driven testing
- [ ] Boundary condition tests included
- [ ] Security test cases (SQL injection, XSS attempts)
- [ ] Performance/load test scenarios (rapid clicks, long inputs)
- [ ] Network/timeout scenarios
- [ ] Special character & Unicode handling tests
- [ ] Tags applied to all scenarios (@positive, @negative, @edge_case, @security, @json_id_*)
- [ ] All step language uses Given/When/Then/And correctly
- [ ] Locator references added as comments
- [ ] Scenario mapping JSON valid (references single test.feature)
- [ ] Locator mapping JSON valid
- [ ] Feature index markdown complete
- [ ] Gherkin validation report generated
- [ ] Traceability to Agent 1 JSON complete (100%)
- [ ] No vague or ambiguous step language
- [ ] All test data from JSON used consistently
- [ ] No hardcoded values except test credentials
- [ ] Feature sections organized by functionality area
- [ ] Scenario names follow pattern: [Action] [Expected Result]
- [ ] At least 75% step reusability potential (consolidated format)

---

## Success Criteria

✅ Agent 2 is successful if:
1. All 8 JSON functionalities converted to Gherkin scenarios in single test.feature
2. 100+ scenarios generated with positive + negative + validation + edge case coverage
3. All scenarios include comprehensive edge cases:
   - Boundary values and limits
   - Empty/null inputs
   - Special characters and Unicode
   - Very long inputs
   - SQL injection and XSS attempts
   - Network timeouts and errors
   - Rapid submissions and double-clicks
   - Case sensitivity and whitespace handling
4. All scenarios mapped to JSON with traceability tags
5. Feature file follows standard Gherkin format and language
6. 95%+ step language consistency (reusable step definitions)
7. All locators from JSON referenced in step comments
8. Complete metadata and mapping files generated
9. Single test.feature file is well-organized and maintainable
10. <25 minutes total execution time for all feature tests
11. User approves features and ready for Agent 3

❌ Agent 2 should STOP if:
1. Input JSON file missing or invalid
2. JSON parsing fails (invalid JSON syntax)
3. <5 functionalities found in JSON (insufficient data)
4. Cannot create feature directory (permission error)
5. Gherkin syntax validation fails >5% of scenarios
6. Step language is vague or inconsistent (>50% unrecognizable steps)
7. Edge cases not covered for critical functionalities
8. test.feature file is not created or has syntax errors

---

## Traceability Summary

```
Agent 1 Output (Discovery)
         ↓
    JSON Functionalities
    (8 functionalities, 20+ elements, locators extracted)
         ↓
Agent 2 (Feature Generation)
    ├─ Parse JSON
    ├─ Convert steps to Gherkin (organized by feature area)
    ├─ Generate 100+ comprehensive scenarios:
    │  ├─ Positive: 25+ scenarios (happy path)
    │  ├─ Negative: 35+ scenarios (error handling)
    │  └─ Edge Cases: 25+ scenarios (boundary, security, performance)
    ├─ Add locator references as comments
    ├─ Consolidate into SINGLE test.feature file
    └─ Generate metadata & traceability
         ↓
test.feature + Metadata
    (1 consolidated feature file, 100+ scenarios, 100% JSON coverage)
         ↓
Ready for Agent 3 (Step Definition Generation)
```
