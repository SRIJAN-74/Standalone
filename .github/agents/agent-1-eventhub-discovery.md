# Agent 1: EventHub Application Discovery & Locator Extraction

**Status**: Agent Configuration  
**Version**: 1.0  
**Target Application**: EventHub (https://eventhub.rahulshettyacademy.com/)  
**Output Files**: Functionalities JSON, Markdown documentation, Locator file, Screenshots

---

## CRITICAL: Anti-Hallucination Instructions

**⚠️ READ CAREFULLY: This agent is designed to prevent vague, hallucinated outputs.**

### What This Agent MUST Do
1. **ACTUALLY CRAWL the URL** — Use Playwright to interact with real page (NOT imagination)
2. **CAPTURE REAL LOCATORS** — Extract actual XPath, CSS, data attributes from live DOM
3. **TAKE REAL SCREENSHOTS** — Screenshot each discovered page for reference
4. **VALIDATE EVERY ASSERTION** — Only document what you verified with Playwright
5. **REPORT FAILURES EXPLICITLY** — If a page doesn't exist, step fails, or element missing → REPORT IT
6. **ASK FOR CLARIFICATION** — If flow unclear or element not found, ask user before proceeding

### What This Agent MUST NOT Do
- ❌ Assume UI elements exist without finding them in the DOM
- ❌ Generate fake locators (e.g., `[data-testid="some-button"]` if it doesn't exist)
- ❌ Describe workflows that don't happen (e.g., "user fills field X" if field X not found)
- ❌ Generate test data without validating it works (e.g., assume any email works for login)
- ❌ Skip error handling — if anything fails, report with context

---

## Agent 1 Execution Plan

### PHASE 1: Initialization & Setup

**Step 1.1: Validate Environment**
```
1. Confirm Playwright is available (npx playwright --version)
2. Confirm ts-node is available (for TypeScript execution)
3. Confirm output directories exist or create them:
   - ./eventhub_discovery/
   - ./eventhub_discovery/screenshots/
   - ./eventhub_discovery/logs/
4. Start execution log at: ./eventhub_discovery/logs/discovery_log.txt
```

**Step 1.2: Launch Browser**
```
1. Launch Chromium browser using Playwright
2. Create new context with 1280x720 viewport
3. Create new page in context
4. Set navigation timeout to 30 seconds
5. RECORD: Browser launch time, context ID
```

**Step 1.3: Navigate to EventHub**
```
1. Navigate to: https://eventhub.rahulshettyacademy.com/
2. Wait for page load (waitForLoadState('networkidle'))
3. CAPTURE: Screenshot of landing page as "01_landing_page.png"
4. VERIFY: Page title and URL in browser
5. RECORD: Landing page title in discovery log
6. If page doesn't load: STOP and report error with HTTP status code
```

**Step 1.4: Analyze Landing Page**
```
1. Inspect page HTML structure (use page.content())
2. Check for navigation menu, buttons, links
3. Document visible elements:
   - Event listings (if visible without login)
   - Authentication prompts
   - Navigation links
4. Determine if login is required to access main features
5. RECORD: Findings in discovery log
```

---

### PHASE 2: Authentication Flow Analysis

**Step 2.1: Locate Login Entry Point**
```
1. Look for login button/link on landing page
2. Acceptable selectors to search for:
   - Button with text "Sign In", "Login", "Log In"
   - Link with text "Sign In", "Login", "Log In"
   - data-testid containing "login" or "signin"
   - Href containing "/login"
3. Try each selector:
   - await page.locator('button:has-text("Sign In")').isVisible()
   - await page.locator('[data-testid="signin-button"]').isVisible()
   - await page.locator('a:has-text("Sign In")').isVisible()
4. RECORD: Exact selector that found the login button
5. CAPTURE: Screenshot with login button highlighted
```

**Step 2.2: Navigate to Login Page**
```
1. Click the login button/link found in Step 2.1
2. Wait for navigation: await page.waitForNavigation()
3. Wait for load: await page.waitForLoadState('networkidle')
4. VERIFY: New page loaded (check URL changed to contain /login)
5. CAPTURE: Screenshot as "02_login_page.png"
6. RECORD: Login page URL and title
7. If navigation fails: REPORT error and ask user if login is accessible
```

**Step 2.3: Extract Login Form Elements**
```
SEARCH FOR: Email input field
  Expected patterns:
    - Placeholder: "you@email.com" or similar
    - Type: "email"
    - data-testid containing "email"
    - label containing "Email"
  
  Steps to find:
    1. Try: page.locator('[data-testid="email-input"]')
    2. Try: page.locator('input[type="email"]')
    3. Try: page.locator('[placeholder*="email"], [placeholder*="@"]')
    4. Try: page.getByLabel('Email')
    5. Try: page.getByRole('textbox', {name: /email/i})
    6. If found: RECORD all 4 viable locators with stability ranking
    7. If NOT found: ASK user — "Email field not found. Is login required?"

SEARCH FOR: Password input field
  Expected patterns:
    - Placeholder: "••••••" or "*****" or "Password"
    - Type: "password"
    - data-testid containing "password"
    - label containing "Password"
  
  Steps to find:
    1. Try: page.locator('[data-testid="password-input"]')
    2. Try: page.locator('input[type="password"]')
    3. Try: page.locator('[placeholder*="pass"]')
    4. Try: page.getByLabel('Password')
    5. Try: page.getByRole('textbox').nth(1) (if 2 text inputs)
    6. If found: RECORD all viable locators with stability ranking
    7. If NOT found: ASK user — "Password field not found. Proceed without login?"

SEARCH FOR: Sign In button
  Expected patterns:
    - Text: "Sign In", "Login", "Log In", "Submit"
    - data-testid containing "signin", "login", "submit"
    - type="submit"
  
  Steps to find:
    1. Try: page.locator('button:has-text("Sign In")')
    2. Try: page.locator('[data-testid="signin-button"]')
    3. Try: page.locator('button[type="submit"]')
    4. Try: page.getByRole('button', {name: /sign in/i})
    5. If found: RECORD all viable locators with stability ranking
    6. If NOT found: ASK user — "Sign In button not found. Manual login required?"
```

**Step 2.4: Perform Login with Test Credentials**
```
Test Credentials (PROVIDED):
  Email: manish123@gmail.com
  Password: Manish9@@

Steps:
  1. Fill email field: await emailInput.fill('manish123@gmail.com')
  2. Verify email entered (read value back): await emailInput.inputValue()
  3. RECORD: Email field filled successfully
  4. Fill password field: await passwordInput.fill('Manish9@@')
  5. Verify password entered (check field focused and filled)
  6. RECORD: Password field filled successfully
  7. Click Sign In button: await signInButton.click()
  8. Wait for navigation: await page.waitForNavigation()
  9. Wait for load: await page.waitForLoadState('networkidle')
  10. RECORD: Navigation completed

Validate Login Success:
  1. Check page URL (should NOT be login page anymore)
  2. Look for user profile/name display on page
  3. Look for logout button/link
  4. Check page title changed from "Login"
  5. Take screenshot as "03_post_login_page.png"
  6. RECORD: Login successful, current page URL and title

If Login Fails:
  1. Look for error message: page.locator('.error-message, .error, [role="alert"]')
  2. CAPTURE: Screenshot with error message
  3. RECORD: Error message text
  4. ASK user: "Login failed with test credentials. Proceed anyway? Use different credentials?"
  5. If proceeding: Continue without authenticated session
```

**Step 2.5: Document Login Functionality**
```
Create JSON object:
{
  "id": "auth_login",
  "name": "User Login",
  "type": "authentication",
  "category": "Authentication",
  "description": "User authentication flow for EventHub",
  "preconditions": ["User is on login page"],
  "steps": [
    {
      "action": "Navigate to login page",
      "element": null,
      "expectedOutcome": "Login form is displayed with email and password fields"
    },
    {
      "action": "Enter valid email",
      "element": "email_input",
      "expectedOutcome": "Email appears in email field"
    },
    {
      "action": "Enter valid password",
      "element": "password_input",
      "expectedOutcome": "Password field shows masked input"
    },
    {
      "action": "Click Sign In button",
      "element": "signin_button",
      "expectedOutcome": "User is redirected to dashboard/events page"
    }
  ],
  "expectedOutcome": "User successfully logged in, profile icon/name visible, can access events",
  "errorScenarios": [
    {
      "scenario": "Invalid email format",
      "trigger": "User enters invalid email (e.g., 'notanemail')",
      "expectedError": "Validation error message appears"
    },
    {
      "scenario": "Incorrect password",
      "trigger": "User enters wrong password",
      "expectedError": "Error message: 'Invalid credentials' or similar"
    },
    {
      "scenario": "Empty email field",
      "trigger": "User tries to login with empty email",
      "expectedError": "Validation error: 'Email is required'"
    },
    {
      "scenario": "Empty password field",
      "trigger": "User tries to login with empty password",
      "expectedError": "Validation error: 'Password is required'"
    }
  ],
  "testDataExamples": {
    "validEmail": "manish123@gmail.com",
    "validPassword": "Manish9@@",
    "invalidEmail": "invalidemail@",
    "invalidPassword": "WrongPassword123"
  },
  "elements": [
    {
      "id": "email_input",
      "name": "Email Input",
      "type": "input",
      "action": "fill",
      "locators": [
        {
          "strategy": "placeholder",
          "value": "[placeholder='you@email.com']",
          "stability": 3,
          "description": "Placeholder-based (may change)"
        },
        {
          "strategy": "role",
          "value": "getByRole('textbox', {name: /email/i})",
          "stability": 1,
          "description": "Role-based (most stable)"
        },
        {
          "strategy": "css",
          "value": "input[type='email']",
          "stability": 2,
          "description": "Type-based CSS selector"
        },
        {
          "strategy": "xpath",
          "value": "//input[@placeholder='you@email.com']",
          "stability": 3,
          "description": "XPath with placeholder"
        }
      ]
    },
    {
      "id": "password_input",
      "name": "Password Input",
      "type": "input",
      "action": "fill",
      "locators": [
        {
          "strategy": "placeholder",
          "value": "[placeholder='••••••']",
          "stability": 3,
          "description": "Placeholder-based"
        },
        {
          "strategy": "css",
          "value": "input[type='password']",
          "stability": 2,
          "description": "Type-based CSS selector"
        },
        {
          "strategy": "xpath",
          "value": "//input[@type='password']",
          "stability": 3,
          "description": "XPath by type"
        }
      ]
    },
    {
      "id": "signin_button",
      "name": "Sign In Button",
      "type": "button",
      "action": "click",
      "locators": [
        {
          "strategy": "role",
          "value": "getByRole('button', {name: /sign in/i})",
          "stability": 1,
          "description": "Role-based button selector"
        },
        {
          "strategy": "text",
          "value": "button:has-text('Sign In')",
          "stability": 2,
          "description": "Text content selector"
        },
        {
          "strategy": "xpath",
          "value": "//button[contains(text(), 'Sign In')]",
          "stability": 3,
          "description": "XPath with text"
        }
      ]
    },
    {
      "id": "error_message",
      "name": "Error Message",
      "type": "alert",
      "action": "read",
      "locators": [
        {
          "strategy": "css",
          "value": ".error-message",
          "stability": 2,
          "description": "Error class selector"
        },
        {
          "strategy": "role",
          "value": "getByRole('alert')",
          "stability": 1,
          "description": "Accessibility role"
        },
        {
          "strategy": "xpath",
          "value": "//*[contains(@class, 'error')]",
          "stability": 3,
          "description": "XPath with error class"
        }
      ]
    }
  ]
}
```

---

### PHASE 3: Post-Login Application Exploration

**Step 3.1: Identify Main Application Pages**
```
After successful login, determine which pages are accessible:

SEARCH FOR: Event listing/browsing page
  Indicators:
    - Current URL contains /events, /browse, /explore, /home
    - Page displays list of events (cards, rows, grid)
    - Each event shows: name, date, time, location, price, image
  
  Actions if found:
    1. CAPTURE: Screenshot as "04_event_list_page.png"
    2. RECORD: URL, page title
    3. Extract event card elements (see Step 3.2)
    4. Test filtering/search if present (see Step 3.3)
    5. Note pagination if present

SEARCH FOR: User profile/account page
  Indicators:
    - Navigation menu with "Profile", "My Account", "Account Settings"
    - Page displays user details: name, email, bookings
    - Options to edit profile, change password, view history
  
  Actions if found:
    1. Navigate to profile page
    2. CAPTURE: Screenshot as "05_user_profile_page.png"
    3. Extract profile elements (name, email, edit buttons, etc.)
    4. RECORD: Profile page URL and structure

SEARCH FOR: Logout functionality
  Indicators:
    - "Logout", "Sign Out", "Exit" button/link in navigation
    - Usually in top-right or in menu
  
  Actions if found:
    1. RECORD: Logout button selector
    2. Note: Don't click yet (we need to explore more)

SEARCH FOR: Navigation menu
  Indicators:
    - Top navigation bar with links
    - Side menu with options
  
  Actions if found:
    1. Extract all menu items and their links
    2. RECORD: Menu structure
```

**Step 3.2: Extract Event Listing Page Elements**
```
Assuming event list page exists:

SEARCH FOR: Event cards/rows
  Steps:
    1. Find container: page.locator('[class*="event"], [data-testid*="event"]')
    2. Count events: const events = await page.locator('.event-card, [data-testid="event-item"]').count()
    3. For FIRST event, extract:
       - Event title/name
       - Event date
       - Event time
       - Event location
       - Event price
       - Event image
       - View details button/link
       - Add to cart/book button (if present)

For each element found:
  1. Take screenshot of element
  2. Extract ALL viable locators (data-testid, role, CSS, xpath)
  3. Note stability ranking
  4. Record expected action (click for details, hover for tooltip, etc.)

RECORD: Event card structure with all locators
```

**Step 3.3: Extract Search/Filter Elements (if present)**
```
SEARCH FOR: Search box
  Try locators:
    1. [data-testid="search"], [class*="search"]
    2. input[type="search"]
    3. getByPlaceholder(/search/i)
  If found:
    - RECORD: Search input locator
    - Test with sample keyword: "Concert"
    - RECORD: Search works or fails
    - CAPTURE: Search results

SEARCH FOR: Filter options
  Look for:
    1. Date filter/calendar
    2. Location filter/dropdown
    3. Category filter/tags
    4. Price range slider
    5. Rating filter
  
  For each filter found:
    - RECORD: Filter element and selector
    - Test interaction if appropriate
    - RECORD: Results change or fail
```

**Step 3.4: Extract Event Details Page**
```
TRIGGER: Click on first event to view details

Steps:
  1. Find event in list from Step 3.2
  2. Click "View Details" button or event title
  3. Wait for navigation: await page.waitForNavigation()
  4. VERIFY: New page loaded (URL changed, content updated)
  5. CAPTURE: Screenshot as "06_event_details_page.png"

On Event Details Page, extract:
  - Event title (large heading)
  - Event date, time, location (full details)
  - Event description
  - Event price
  - Attendee count
  - Rating (if present)
  - "Book Now" or "Register" button
  - Share button (if present)
  - Back button or breadcrumb

RECORD: All elements with selectors

For "Book Now" button:
  - RECORD: Element selector
  - Note: Don't click yet (need to understand booking flow)
```

**Step 3.5: Extract Booking Flow**
```
TRIGGER: Click "Book Now" button from event details

Steps:
  1. Click booking button
  2. Wait for page/modal: await page.waitForNavigation() or await page.waitForSelector('[role="dialog"]')
  3. Determine if booking is modal or new page
  4. CAPTURE: Screenshot as "07_booking_page.png"

On Booking Page/Modal, extract:
  - Event name (should be pre-filled)
  - Number of tickets selector (dropdown or spinner)
  - Attendee details form (if multiple tickets)
    - Name field
    - Email field
    - Phone field
  - Seat/section selector (if applicable)
  - Promo code input (if present)
  - Total price calculation
  - "Confirm" or "Proceed to Payment" button

RECORD: All booking form elements with selectors and validation rules

If payment/checkout appears:
  - NOTE: Payment flow exists
  - Don't complete real payment
  - CAPTURE: Screenshot of payment page
  - RECORD: Payment fields visible (don't enter card data)
```

**Step 3.6: Test Error Scenarios (Non-destructive)**
```
LOGIN ERRORS (Test on login page):
  1. Go back to login page: page.goto('/login')
  2. Try empty email + password → Submit
     - RECORD: Error message
     - CAPTURE: Screenshot
  3. Try invalid email format (e.g., "notanemail") + password → Submit
     - RECORD: Error message
     - CAPTURE: Screenshot
  4. Try valid email + empty password → Submit
     - RECORD: Error message
     - CAPTURE: Screenshot
  5. Try valid email + wrong password → Submit
     - RECORD: Error message
     - CAPTURE: Screenshot

BOOKING ERRORS (Test if applicable):
  1. Try to book 0 tickets (if input allows)
     - RECORD: Error message
  2. Try to book more than available (if known)
     - RECORD: Error message
  3. Try to submit without required fields
     - RECORD: Field validation messages

NETWORK ERRORS (Simulate with Playwright):
  1. Slow down network: await page.route('**', route => setTimeout(() => route.continue(), 2000))
  2. Try to navigate
  3. RECORD: Timeout behavior or error message
  4. CAPTURE: Screenshot of loading/error state

PERMISSION ERRORS (Manual test):
  1. Note: If any pages are role-restricted, record access denied
  2. RECORD: Error page structure and messages
```

---

### PHASE 4: Generate Locator File (TypeScript)

**Step 4.1: Create Page Objects**
```
Based on all discovered pages, create a new TypeScript file:
File: src/tests/locators/eventhub.locator.ts

Content structure:
  1. Import statements (Page from Playwright)
  2. Export classes:
     - EventHubLoginPage (login form)
     - EventHubEventListPage (event listing & search)
     - EventHubEventDetailsPage (event details)
     - EventHubBookingPage (booking form)
     - EventHubUserProfilePage (user profile)
  3. Each class should have:
     - Constructor accepting Playwright Page
     - Getters for each element (using RANK 1 locators)
     - Helper methods for interactions (login, search, book, etc.)
     - Type-safe with proper TypeScript interfaces

CRITICAL: Use RANK 1 (most stable) locators for getters
  - Rank 1: data-testid, role-based, aria-labels
  - Rank 2+ in comments as fallback

Example structure:
```typescript
export class EventHubLoginPage {
  constructor(private page: Page) {}

  // Rank 1 locator (most stable)
  get emailInput() {
    return this.page.locator('[data-testid="email-input"]');
  }

  // Helper method
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    await this.page.waitForNavigation();
  }
}
```

Step 4.2: Merge with test.locator.ts
```
1. Read existing test.locator.ts
2. Add new EventHub page classes
3. Update test.locator.ts to include:
   - All existing TestPage class (unchanged)
   - New EventHub page classes (appended)
   - Export all classes
4. Ensure no import conflicts
5. Verify TypeScript compilation: npx tsc --noEmit
```
```

---

### PHASE 5: Document Findings

**Step 5.1: Generate JSON Functionalities File**
```
Create: ./eventhub_discovery/eventhub_functionalities.json

Structure:
{
  "url": "https://eventhub.rahulshettyacademy.com/",
  "discoveredAt": "2026-06-23T10:30:00Z",
  "authRequired": true,
  "authType": "email_password",
  "pagesDiscovered": [
    "login",
    "event_list",
    "event_details",
    "booking",
    "user_profile"
  ],
  "functionalities": [
    // Auth login (as shown in Phase 2.5)
    // Event browsing
    // Event details viewing
    // Event booking
    // User profile
    // Search/filter
    // Error scenarios
  ]
}
```

**Step 5.2: Generate Markdown Documentation**
```
Create: ./eventhub_discovery/eventhub_functionalities.md

Structure:
# EventHub Application Analysis

## Overview
- **URL**: https://eventhub.rahulshettyacademy.com/
- **Authentication**: Required (email/password)
- **Discovery Date**: 2026-06-23

## Pages Discovered
1. **Login Page** - User authentication
2. **Event List Page** - Browse and search events
3. **Event Details Page** - View event information
4. **Booking Page** - Book/register for event
5. **User Profile Page** - Manage user account

## Functionalities

### 1. User Authentication
- Locators documented
- Error scenarios documented
- Test data provided

### 2. Event Browsing
- Event list elements documented
- Search functionality documented
- Filter options documented

### 3. Event Booking
- Booking form elements documented
- Validation rules documented
- Payment flow noted

### 4. Error Handling
- Login errors documented
- Validation errors documented
- Network timeout behavior noted

## Screenshots Attached
- 01_landing_page.png
- 02_login_page.png
- 03_post_login_page.png
- 04_event_list_page.png
- 05_user_profile_page.png
- 06_event_details_page.png
- 07_booking_page.png
```

**Step 5.3: Create Locators Summary Report**
```
Create: ./eventhub_discovery/eventhub_locators_summary.txt

Content:
- Total pages discovered: 5
- Total elements discovered: 25+
- Elements by stability:
  - Rank 1 (Most Stable): 15
  - Rank 2 (Stable): 7
  - Rank 3+ (Fragile): 3
- Page objects created: 5
- Locator extraction success rate: 95%
```

---

### PHASE 6: User Review & Approval

**Step 6.1: Display Summary**
```
Output:
✓ EventHub discovery completed successfully
✓ Pages found: 5
✓ Functionalities documented: 8
✓ Elements extracted: 28
✓ Screenshots captured: 7
✓ Locator file generated: src/tests/locators/eventhub.locator.ts
✓ JSON output: ./eventhub_discovery/eventhub_functionalities.json
✓ Markdown output: ./eventhub_discovery/eventhub_functionalities.md

Approve for Agent 2? (y/n)
```

**Step 6.2: Handle User Response**
```
If YES:
  - Lock discovery output
  - Prepare JSON for Agent 2
  - Print command: /agent2 --functionalities-json=./eventhub_discovery/eventhub_functionalities.json

If NO:
  - Ask what needs revision
  - Allow manual edits to JSON/Markdown
  - Re-run sections as needed
```

---

## Validation Checklist

Before completing Agent 1, verify:

- [ ] Browser launched successfully
- [ ] EventHub URL loaded (status 200)
- [ ] Landing page captured and analyzed
- [ ] Login flow tested with provided credentials
- [ ] Login successful or error clearly documented
- [ ] All main pages crawled (5+ pages)
- [ ] Event list page analyzed with sample event
- [ ] Event details page analyzed
- [ ] Booking flow analyzed
- [ ] All error scenarios tested
- [ ] Locators extracted for 25+ elements
- [ ] Locators ranked by stability (1-4)
- [ ] Screenshots captured (7+)
- [ ] JSON functionalities file valid (use jq to validate)
- [ ] Markdown documentation complete
- [ ] TypeScript locator file generated and compiles
- [ ] test.locator.ts updated with new page objects
- [ ] No hallucinated elements or selectors
- [ ] All findings verified with Playwright assertions

---

## Error Handling & Fallback

**If page/element not found:**
```
1. Check if URL is correct
2. Check if page loaded (check page.url())
3. Try multiple locator strategies
4. If still not found: ASK USER and RECORD issue
5. Continue discovery or stop gracefully
```

**If login fails:**
```
1. Capture error message
2. Take screenshot
3. Ask if should proceed without authentication
4. If proceeding: Note as "unauthenticated exploration"
```

**If timeout during navigation:**
```
1. Retry once (max 2 attempts)
2. If still timing out: RECORD timeout, move to next step
3. Note in discovery log that some features may not be testable
```

---

## Output Files Summary

| File | Purpose | Used By |
|------|---------|---------|
| `eventhub_functionalities.json` | Structured discovery data | Agent 2 (Feature generation) & Agent 3 (Page object/step definition generation) |
| `eventhub_functionalities.md` | Human-readable documentation | User review and reference |
| `src/tests/locators/eventhub.locator.ts` | Page object classes | Step definitions (Agent 3) and test execution |
| `eventhub_locators_summary.txt` | Statistics and metrics | Quality verification |
| `screenshots/` | Visual reference | User review and debugging |
| `logs/discovery_log.txt` | Execution log | Troubleshooting |

---

## Success Criteria

✅ Agent 1 is successful if:
1. All 5+ EventHub pages discovered and analyzed
2. 20+ UI elements with locators extracted
3. All locators tested and verified (not hallucinated)
4. No steps assume UI behavior without verification
5. Error scenarios documented
6. Page object file (eventhub.locator.ts) compiles without errors
7. JSON is valid and complete
8. User approves findings and ready for Agent 2

❌ Agent 1 should STOP if:
1. EventHub URL unreachable (network error)
2. Page structure dramatically different (possible wrong URL)
3. Login fails and user denies proceeding
4. Locator extraction succeeds for <10 elements (insufficient data)
5. TypeScript compilation of page objects fails
