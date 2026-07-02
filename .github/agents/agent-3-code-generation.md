# Agent 3: Step Definitions & Page Objects Code Generator

**Status**: Agent Configuration  
**Version**: 1.0  
**Input**: features/test.feature (from Agent 2)  
**Output Files**: Step definitions in src/tests/steps/test.ts, Updated POManager.ts (optional), TypeScript validation report  

---

## CRITICAL: Anti-Hallucination Instructions

**⚠️ READ CAREFULLY: Generate code ONLY for steps that exist in the feature file.**

### What This Agent MUST Do
1. **PARSE FEATURE FILE** — Extract all unique steps from features/test.feature
2. **GENERATE STEP DEFINITIONS** — ALL steps into one test.ts file in src/tests/steps/
3. **USE REAL LOCATORS** — Get from Agent 1 JSON or use semantic selectors
4. **MAINTAIN TYPESCRIPT TYPES** — All code must pass `tsc --noEmit`
5. **OPTIONAL: UPDATE POManager** — Only if page objects need registration
6. **VALIDATE COMPILATION** — Ensure no import/type errors before delivery
7. **ASK FOR CLARIFICATION** — If feature references unknown pages or elements, ask user

### What This Agent MUST NOT Do
- ❌ Generate step definitions for steps not in the test.feature file
- ❌ Use hardcoded locators without validation against Agent 1 data
- ❌ Import non-existent modules or files
- ❌ Generate code that doesn't compile
- ❌ Skip TypeScript validation
- ❌ Create duplicate step definitions across files
- ❌ Scatter step definitions across multiple files (all in test.ts)

---

## Agent 3 Execution Plan

### PHASE 1: Initialization & Analysis

**Step 1.1: Load Feature File**
```
1. Locate features/test.feature from Agent 2 output (consolidated file)
2. Parse feature file:
   - Extract Feature description
   - Extract Background steps
   - Extract all Scenario names
   - Extract all Gherkin steps (Given/When/Then/And)
   - Extract tags from each scenario
   
3. Validate feature file:
   - Must have at least 1 scenario
   - All steps must follow proper Gherkin format
   - No undefined or ambiguous steps
   
4. RECORD: Feature file analysis
```

**Step 1.2: Extract Unique Steps**
```
1. Parse all Given/When/Then/And steps from feature file
2. Normalize step text (remove parameters, special characters)
3. Group steps by type (Given, When, Then)
4. Identify unique step patterns:

   Example from feature file:
   - "I am on the login page" → Given step
   - "I enter email {string}" → When step with parameter
   - "I should see the logout button" → Then step
   - "an error message should be displayed" → Then step

5. CREATE mapping: Step Text → Regex Pattern → Implementation

   Example mapping:
   "I am on the login page" 
     → Regex: I am on the login page
     → Implementation: Navigate to login, assert page loaded
   
   "I enter email {string}"
     → Regex: I enter email "([^"]*)"
     → Implementation: Fill email field with value
   
   "an error message should be displayed"
     → Regex: an error message should be displayed
     → Implementation: Assert error element is visible

6. RECORD: Unique steps identified, mapping created
```

**Step 1.3: Identify Page Objects**
```
1. Extract page references from Gherkin steps:
   - "I am on the login page" → LoginPage
   - "I am on the event listing page" → EventListPage
   - "I enter my profile details" → ProfilePage
   - "I see booking confirmation" → BookingConfirmationPage

2. Map step phrases to page names:
   For each step that references a page:
     - Extract page indicator (keywords: page, form, dialog, modal, screen)
     - Infer page class name: "login page" → LoginPage
     - Infer page file name: "login page" → login.page.ts

3. Cross-reference with Agent 1 data:
   - Load Agent 1's JSON (if available)
   - Verify page objects mentioned in feature file exist in discovery
   - FLAG any pages not in Agent 1 data

4. CREATE page list:
   [
     { name: "LoginPage", file: "login.page.ts", steps: [...] },
     { name: "EventListPage", file: "event-list.page.ts", steps: [...] },
     { name: "EventDetailsPage", file: "event-details.page.ts", steps: [...] },
     { name: "BookingPage", file: "booking.page.ts", steps: [...] }
   ]

5. RECORD: Page objects identified
```

**Step 1.4: Load Locator Data from Agent 1 (if available)**
```
1. Look for Agent 1 output files:
   - {domain}_functionalities.json
   - eventhub_discovery/logs/discovery_log.txt
   
2. If found, extract locators:
   From JSON:
   "elements": [
     {
       "id": "email_input",
       "locators": [
         { "strategy": "data-testid", "value": "[data-testid='email']", "stability": 1 },
         { "strategy": "css", "value": "input[type='email']", "stability": 2 },
         { "strategy": "xpath", "value": "//input[@type='email']", "stability": 3 }
       ]
     }
   ]
   
3. Extract RANK 1 locators:
   BUILD: locator_map = {
     "email_input": "[data-testid='email']",
     "password_input": "[data-testid='password']",
     "sign_in_button": "button:has-text('Sign In')",
     ...
   }

4. If Agent 1 data NOT found:
   - Generate semantic locators (fallback)
   - WARN user that locators are inferred, not verified
   - Ask if they want to provide locator JSON

5. RECORD: Locators loaded/generated
```

---

### PHASE 2: Page Object Generation

**Step 2.1: Create Page Object Class Structure**
```
For EACH page identified in Step 1.3:

File: src/tests/locators/{page_name}.page.ts

Template structure:
```typescript
import { Page, Locator } from '@playwright/test';

export interface I{PageName}Elements {
  [key: string]: {
    selector: string;
    description: string;
  };
}

export class {PageName} {
  readonly page: Page;
  
  // Locator definitions
  private readonly elements: I{PageName}Elements = { ... };

  constructor(page: Page) {
    this.page = page;
  }

  // Getter methods for each element
  get elementName(): Locator { ... }

  // Action methods
  async methodName(param: string): Promise<void> { ... }
}
```

Examples:

**login.page.ts:**
```typescript
import { Page, Locator } from '@playwright/test';

export interface ILoginPageElements {
  [key: string]: {
    selector: string;
    description: string;
  };
}

export class LoginPage {
  readonly page: Page;
  
  private readonly elements: ILoginPageElements = {
    emailInput: { 
      selector: '[data-testid="email-input"]', 
      description: 'Email input field' 
    },
    passwordInput: { 
      selector: '[data-testid="password-input"]', 
      description: 'Password input field' 
    },
    signInButton: { 
      selector: 'button:has-text("Sign In")', 
      description: 'Sign In button' 
    },
    errorMessage: { 
      selector: '[role="alert"], .error-message', 
      description: 'Error message container' 
    },
    logoutButton: { 
      selector: 'button:has-text("Logout"), a:has-text("Sign Out")', 
      description: 'Logout button in user menu' 
    }
  };

  constructor(page: Page) {
    this.page = page;
  }

  get emailInput(): Locator {
    return this.page.locator(this.elements.emailInput.selector);
  }

  get passwordInput(): Locator {
    return this.page.locator(this.elements.passwordInput.selector);
  }

  get signInButton(): Locator {
    return this.page.locator(this.elements.signInButton.selector);
  }

  get errorMessage(): Locator {
    return this.page.locator(this.elements.errorMessage.selector);
  }

  get logoutButton(): Locator {
    return this.page.locator(this.elements.logoutButton.selector);
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible().catch(() => false);
  }

  async getErrorMessageText(): Promise<string> {
    return await this.errorMessage.innerText().catch(() => '');
  }

  async isLogoutButtonVisible(): Promise<boolean> {
    return await this.logoutButton.isVisible().catch(() => false);
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForNavigation();
  }
}
```

RECORD: Page object template structure created
```

**Step 2.2: Generate Locators for Each Page Object**
```
For EACH page object:

1. Identify elements referenced in steps:
   Example steps:
   - "I enter email {email}" → email field element
   - "I click the 'Sign In' button" → sign in button element
   - "I should see the logout button" → logout button element

2. For each element:
   IF Agent 1 data available:
     - Extract locator from Agent 1 JSON (use RANK 1)
     - Add alternative selectors as comments (RANK 2, 3)
   ELSE:
     - Generate semantic locator:
       * Button by text: button:has-text("text")
       * Input by type: input[type="email"]
       * Input by placeholder: [placeholder*="text"]
       * Links by text: a:has-text("text")
   
3. Add locators to page object:
   ```typescript
   private readonly elements: ILoginPageElements = {
     emailInput: { 
       selector: '[data-testid="email-input"]',
       description: 'Email input field' 
     },
     // Fallback selectors as comment:
     // input[type="email"]
     // [placeholder*="email"]
     
     passwordInput: { 
       selector: '[data-testid="password-input"]',
       description: 'Password input field' 
     },
     // Fallbacks:
     // input[type="password"]
     // [placeholder*="password"]
   };
   ```

4. Validate selectors:
   - Each selector should be CSS or Playwright locator syntax
   - No invalid XPath expressions
   - No ambiguous selectors

RECORD: Locators added to all page objects
```

**Step 2.3: Generate Action Methods**
```
For EACH page object, create action methods:

Pattern 1: Simple Fill/Click
```typescript
async enterEmail(email: string): Promise<void> {
  await this.emailInput.fill(email);
}

async clickSignIn(): Promise<void> {
  await this.signInButton.click();
}
```

Pattern 2: Complex Workflow (using multiple elements)
```typescript
async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.signInButton.click();
  await this.page.waitForLoadState('networkidle');
}
```

Pattern 3: Assertion/Validation
```typescript
async isErrorMessageDisplayed(): Promise<boolean> {
  return await this.errorMessage.isVisible();
}

async getErrorMessageText(): Promise<string> {
  return await this.errorMessage.innerText();
}

async isLogoutButtonVisible(): Promise<boolean> {
  return await this.logoutButton.isVisible();
}
```

Pattern 4: Navigation
```typescript
async navigateToLoginPage(): Promise<void> {
  await this.page.goto('/login');
  await this.page.waitForLoadState('networkidle');
}

async waitForPageLoad(): Promise<void> {
  await this.page.waitForLoadState('networkidle');
}
```

Guidelines:
- Method names should be verb-based (enterEmail, clickButton, selectOption)
- Methods should return Promise<void> for actions, Promise<T> for queries
- Include error handling (try/catch or .catch() → false/null)
- Add wait states after navigation (waitForLoadState)
- Use async/await consistently

RECORD: Action methods created for each page object
```

---

### PHASE 3: Step Definition Generation

**Step 3.1: Create Step Definition File**
```
File: src/tests/steps/{domain}.ts

Template structure:
```typescript
import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';
import { POManager } from '../locators/POManager';
import { LoginPage } from '../locators/login.page';
// import other page objects

export class {DomainCapitalized}Steps {
  page: Page;
  poManager: POManager;

  constructor(world: ICustomWorld) {
    this.page = world.page;
    this.poManager = world.poManager;
  }
}

// Step definitions
Given('I navigate to the {string} application', async function (this: ICustomWorld, appName: string) {
  // Implementation
});

Given('I am on the login page', async function (this: ICustomWorld) {
  // Implementation
});

// ... more steps
```

RECORD: Step definition file structure created
```

**Step 2.2: Implement Given Steps**
```
Given steps: Setup/precondition steps

Examples from feature file and their implementations (ALL IN test.ts):

**1. "I navigate to the application"**
```typescript
Given('I navigate to the application', async function (this: ICustomWorld) {
  const baseUrl = process.env.BASE_URL || 'https://eventhub.rahulshettyacademy.com';
  await this.page.goto(baseUrl);
  await this.page.waitForLoadState('networkidle');
});
```

**2. "I am on the login page"**
```typescript
Given('I am on the login page', async function (this: ICustomWorld) {
  await this.page.goto('/login');
  const emailInput = this.page.locator('[data-testid="email-input"], input[type="email"]');
  await emailInput.waitFor({ state: 'visible' });
});
```

**3. "I have successfully logged in"**
```typescript
Given('I have successfully logged in', async function (this: ICustomWorld) {
  const email = process.env.TEST_EMAIL || 'test@example.com';
  const password = process.env.TEST_PASSWORD || 'TestPass123!';
  
  const emailInput = this.page.locator('[data-testid="email-input"], input[type="email"]');
  const passwordInput = this.page.locator('[data-testid="password-input"], input[type="password"]');
  const signInButton = this.page.locator('button:has-text("Sign In")');
  
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await signInButton.click();
  
  await expect(this.page).not.toHaveURL(/\/login/);
});
```

**4. "the application has loaded successfully"**
```typescript
Given('the application has loaded successfully', async function (this: ICustomWorld) {
  await this.page.waitForLoadState('networkidle');
  const mainContent = this.page.locator('main, [role="main"], [data-testid="main"]');
  await expect(mainContent).toBeVisible({ timeout: 5000 }).catch(() => true);
});
```

Pattern:
- Access page from ICustomWorld context (this.page)
- Set up required state (navigation, login, data)
- Use timeouts appropriately
- Allow failures gracefully (.catch(() => true) for optional checks)

RECORD: Given steps implemented in test.ts
```

**Step 2.3: Implement When Steps**
```
When steps: Action/interaction steps (ALL IN test.ts)

Examples from feature file and their implementations:

**1. "I enter email {string}"**
```typescript
When('I enter email {string}', async function (this: ICustomWorld, email: string) {
  const emailInput = this.page.locator('[data-testid="email-input"], input[type="email"]');
  await emailInput.fill(email);
});
```

**2. "I enter password {string}"**
```typescript
When('I enter password {string}', async function (this: ICustomWorld, password: string) {
  const passwordInput = this.page.locator('[data-testid="password-input"], input[type="password"]');
  await passwordInput.fill(password);
});
```

**3. "I click the {string} button"**
```typescript
When('I click the {string} button', async function (this: ICustomWorld, buttonText: string) {
  const button = this.page.locator(`button:has-text("${buttonText}")`);
  await button.click();
  await this.page.waitForLoadState('networkidle').catch(() => {});
});
```

**4. "I select {string} tickets"**
```typescript
When('I select {string} tickets', async function (this: ICustomWorld, ticketCount: string) {
  const ticketSelector = this.page.locator('[data-testid="ticket-count"], select, .ticket-selector');
  await ticketSelector.selectOption(ticketCount).catch(() => {
    // Fallback for non-select elements
    const ticketInput = this.page.locator('input[data-testid*="ticket"], input[placeholder*="ticket"]');
    await ticketInput.fill(ticketCount);
  });
});
```

Pattern:
- Map step parameters ({string}, {int}) to method arguments
- Use direct locators (no page objects required)
- Handle dynamic locators (buttons with text, dropdowns, etc.)
- Add waits after actions that change page state
- Use fallbacks for flexibility

RECORD: When steps implemented in test.ts
```

**Step 2.4: Implement Then Steps**
```
Then steps: Assertion/outcome steps (ALL IN test.ts)

Examples from feature file and their implementations:

**1. "I should be redirected to the {string}"**
```typescript
Then('I should be redirected to the {string}', async function (this: ICustomWorld, pageName: string) {
  const expectedUrl = pageName.toLowerCase().replace(/\s+/g, '-');
  await expect(this.page).toHaveURL(new RegExp(expectedUrl));
});
```

**2. "I should see the logout button"**
```typescript
Then('I should see the logout button', async function (this: ICustomWorld) {
  const logoutButton = this.page.locator('button:has-text("Logout"), a:has-text("Sign Out")');
  await expect(logoutButton).toBeVisible();
});
```

**3. "an error message should be displayed"**
```typescript
Then('an error message should be displayed', async function (this: ICustomWorld) {
  const errorMessage = this.page.locator('[role="alert"], .error-message, .error');
  await expect(errorMessage).toBeVisible();
});
```

**4. "the error should indicate {string}"**
```typescript
Then('the error should indicate {string}', async function (this: ICustomWorld, expectedText: string) {
  const errorMessage = this.page.locator('[role="alert"], .error-message');
  const errorText = await errorMessage.innerText();
  await expect(errorText.toLowerCase()).toContain(expectedText.toLowerCase());
});
```

**5. "I should remain on the login page"**
```typescript
Then('I should remain on the login page', async function (this: ICustomWorld) {
  await expect(this.page).toHaveURL(/\/login/);
  const emailInput = this.page.locator('[data-testid="email-input"], input[type="email"]');
  await expect(emailInput).toBeVisible();
});
```

Pattern:
- Use Playwright expect() for assertions
- Check URL, visibility, text content, count
- Handle case-insensitive text comparisons
- Allow flexible assertions
- Use direct selectors or locators

RECORD: Then steps implemented in test.ts
```

---

### PHASE 4: POManager Update

**Step 4.1: Analyze Existing POManager**
```
1. Load src/tests/locators/POManager.ts
2. Understand current pattern:
   - Lazy loading pattern (getters)
   - Page object instantiation
   - World context usage

Example existing POManager:
```typescript
import { TestPage } from './test.locator';
import { LoginLocator } from './login.locator';

export class POManager {
  private page: Page;
  
  private testPage?: TestPage;
  private loginLocator?: LoginLocator;

  constructor(page: Page) {
    this.page = page;
  }

  get testPageObj(): TestPage {
    return this.testPage ??= new TestPage(this.page);
  }

  get loginPageObj(): LoginLocator {
    return this.loginLocator ??= new LoginLocator(this.page);
  }
}
```

3. RECORD: Existing pattern identified
```

**Step 4.2: Generate POManager Update**
```
For EACH new page object created in Phase 2:

1. Add import statement (top of file):
   import { LoginPage } from './login.page';
   import { EventListPage } from './event-list.page';

2. Add private field with lazy-loading getter:
   ```typescript
   private loginPage?: LoginPage;
   private eventListPage?: EventListPage;

   get loginPage(): LoginPage {
     return this.loginPage ??= new LoginPage(this.page);
   }

   get eventListPage(): EventListPage {
     return this.eventListPage ??= new EventListPage(this.page);
   }
   ```

3. Maintain naming consistency:
   - File: login.page.ts
   - Class: LoginPage
   - Getter: loginPage

RECORD: POManager update script created
```

**Step 4.3: Update World Context (if needed)**
```
Verify world.ts includes POManager:

Example world.ts:
```typescript
import { World } from '@cucumber/cucumber';
import { Page, Browser, BrowserContext } from '@playwright/test';
import { POManager } from '../locators/POManager';

export interface ICustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page: Page;
  poManager: POManager;
}

export class CustomWorld extends World implements ICustomWorld {
  page!: Page;
  poManager!: POManager;
}
```

If poManager not present:
- Add import statement
- Add poManager: POManager to interface
- Add poManager field to class
- Initialize in Before hook

RECORD: World context verified/updated
```

---

### PHASE 5: Validation & Compilation

**Step 5.1: TypeScript Compilation Check**
```
1. Run command: npx tsc --noEmit
2. Check for errors:
   - Import errors (missing files, circular dependencies)
   - Type errors (property doesn't exist, wrong type)
   - Syntax errors (invalid TypeScript)

3. If errors found:
   - List all errors with file and line number
   - Identify root cause:
     * Missing import?
     * Wrong type?
     * Undefined variable?
   - Attempt auto-fix:
     * Add missing imports
     * Fix type mismatches
     * Remove duplicate definitions
   - Re-compile

4. RECORD: Compilation results (pass/fail + error list)
5. If compilation fails: STOP and report errors to user
```

**Step 5.2: Step Definition Verification**
```
1. Verify all steps from feature file are implemented:
   For EACH step in features/{domain}.feature:
     - Extract step text
     - Search for matching regex in step definitions
     - Verify implementation exists and is not empty
   
2. Verify no undefined steps:
   - Run: npx cucumber-js --dry-run features/{domain}.feature
   - Check output for "undefined" steps
   - If found: Generate implementations for missing steps

3. Verify no duplicate definitions:
   - Search for duplicate When/Given/Then decorators with same pattern
   - Merge or rename duplicates

RECORD: Step definition verification results
```

**Step 5.3: Page Object Verification**
```
1. Verify all page objects referenced in steps are defined:
   For EACH page object reference in steps:
     - Check if page object file exists
     - Check if class is exported
     - Check if all required methods exist

2. Verify locators are valid:
   For EACH locator in page objects:
     - Validate CSS/Playwright syntax
     - Check for common mistakes (mismatched quotes, invalid selectors)
     - Suggest semantic locators if needed

3. Verify page objects are registered in POManager:
   For EACH page object:
     - Check if getter exists in POManager
     - Check if getter is exported
     - Verify naming convention

RECORD: Page object verification results
```

**Step 5.4: Import Chain Validation**
```
1. Trace imports:
   Feature file → Step definitions → Page objects → POManager → World
   
2. Verify chain:
   ✓ Step definitions import page objects correctly
   ✓ Page objects import from playwright
   ✓ POManager imports all page objects
   ✓ World imports POManager
   ✓ No circular dependencies

3. Identify missing imports:
   If chain broken:
     - Add missing import statement
     - Update file paths if needed
     - Re-compile

RECORD: Import chain validation results
```

---

### PHASE 5: Generate Reports & Summary

**Step 4.1: Create Implementation Summary**
```
File: test_implementation_summary.txt

Content:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent 3 Code Generation Summary (Consolidated)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated Files:
  ✓ src/tests/steps/test.ts (all step definitions - single file)
  ✓ src/tests/locators/POManager.ts (optional update, if needed)

Step Definitions Generated: 28 (ALL IN ONE FILE: test.ts)
  - Given steps: 8
  - When steps: 12
  - Then steps: 8

Consolidation Details:
  - All steps from features/test.feature implemented
  - No scattered definitions across multiple files
  - Single test.ts handles all functionalities
  - Direct locator usage (no page object dependency)

Locator Strategy:
  - Using semantic/direct locators in test.ts
  - Data-testid priority → Role-based → CSS selectors
  - Fallback selectors for flexibility
  - 100% coverage of feature file steps

TypeScript Compilation: ✓ PASS
  - No errors
  - No warnings
  - All imports resolved
  - test.ts validates successfully

Test Configuration:
  - TEST_EMAIL: from env or default
  - TEST_PASSWORD: from env or default
  - Base URL: from env or application

Ready for Execution: YES
  Command: npx cucumber-js --tags @all
  or: npx cucumber-js features/test.feature
```

**Step 4.2: Create Step Definition Mapping Report**
```
File: test_step_mapping.txt

Content:
Step Text (from test.feature) | Step Implementation (in test.ts) | Status
---|---|---
I navigate to the application | Given('I navigate to the application', ...) | ✓
I am on the login page | Given('I am on the login page', ...) | ✓
I enter email {string} | When('I enter email {string}', ...) | ✓
I enter password {string} | When('I enter password {string}', ...) | ✓
I click the {string} button | When('I click the {string} button', ...) | ✓
... | ... | ...

Total Mappings: 28
Implemented: 28 (100%)
Undefined: 0
Consolidated File: src/tests/steps/test.ts
```

**Step 4.3: Create Code Quality Report**
```
File: test_code_quality_report.txt

Content:
## Code Quality Metrics

### TypeScript Compliance
- Compilation: ✓ PASS (0 errors)
- Type Checking: ✓ PASS (0 type errors)
- Linting: ⚠ Not checked (optional)

### Step Definition Quality
- Coverage: 28/28 steps implemented (100%)
- Undefined Steps: 0
- Duplicate Definitions: 0
- Generic Steps: 3 (reusable across features)

### Page Object Quality
- Total Page Objects: 4
- Average Methods per Page: 4.5
- Total Locators: 28
- Locators with Fallbacks: 10 (good practice)
- Average Locators per Page: 7

### Import Chain
- Circular Dependencies: 0 ✓
- Missing Imports: 0 ✓
- All Files Exported: Yes ✓

### Ready for Production: YES ✓
```

---

### PHASE 6: User Review & Approval

**Step 5.1: Display Summary**
```
Output to user:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Agent 3 Code Generation Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated:
  ✓ src/tests/steps/test.ts (consolidated - 28 step definitions)
  ✓ TypeScript compilation passed
  ✓ All steps from features/test.feature implemented
  ✓ No undefined steps
  ✓ No duplicate definitions

Files Created:
  src/tests/steps/test.ts

Reports Generated:
  - test_implementation_summary.txt
  - test_step_mapping.txt
  - test_code_quality_report.txt

Test Execution Command:
  npx cucumber-js features/test.feature
  or
  npx cucumber-js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ready for testing? (y/n)
```

**Step 5.2: Show Code Preview**
```
Display sample from generated test.ts:

Feature: test.feature (consolidated)
────────────────────────
@authentication @smoke
Scenario: User successfully logs in with valid credentials
  Given I navigate to the application
  When I enter email "manish123@gmail.com"
  And I enter password "Manish9@@"
  And I click the "Sign In" button
  Then I should be redirected to the dashboard
  [... more scenarios ...]


Step Definition: test.ts (consolidated)
────────────────────────
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

Given('I navigate to the application', async function (this: ICustomWorld) {
  const baseUrl = process.env.BASE_URL || 'https://eventhub.rahulshettyacademy.com';
  await this.page.goto(baseUrl);
  await this.page.waitForLoadState('networkidle');
});

When('I enter email {string}', async function (this: ICustomWorld, email: string) {
  const emailInput = this.page.locator('[data-testid="email-input"], input[type="email"]');
  await emailInput.fill(email);
});

Then('I should see the logout button', async function (this: ICustomWorld) {
  const logoutButton = this.page.locator('button:has-text("Logout")');
  await expect(logoutButton).toBeVisible();
});

// ... all 28 steps in ONE file
```

**Step 5.3: Handle User Response**
```
If user enters 'y' or 'approve':
  ✓ Lock generated files (backup created)
  ✓ TypeScript compilation: npx tsc --noEmit
  ✓ All files ready for test execution
  ✓ Print command: npx cucumber-js features/test.feature

If user enters 'n' or 'reject':
  ✓ Ask which parts to remove/edit
  ✓ Allow manual code review in test.ts
  ✓ Do NOT delete files automatically
  ✓ Ask if they want to regenerate after edits

If compilation fails:
  ✓ Show TypeScript errors
  ✓ Offer to fix common issues
  ✓ Ask user to review and retry
  ✓ Do NOT proceed until tsc --noEmit passes
```

---

## Validation Checklist

Before marking Agent 3 as complete, verify:

- [ ] Feature file (test.feature) loaded and parsed successfully
- [ ] All scenarios from test.feature analyzed
- [ ] All unique steps extracted and normalized
- [ ] Step definitions file created: src/tests/steps/test.ts (single file)
- [ ] ALL step definitions in one test.ts file (no scattered definitions)
- [ ] All Given steps implemented in test.ts
- [ ] All When steps implemented in test.ts
- [ ] All Then steps implemented in test.ts
- [ ] No undefined steps (matching test.feature)
- [ ] No duplicate step definitions in test.ts
- [ ] Direct locator usage (no page object dependency required)
- [ ] Semantic/fallback locators for flexibility
- [ ] TypeScript compilation: npx tsc --noEmit passes
- [ ] No import errors in test.ts
- [ ] No type errors in test.ts
- [ ] No circular dependencies
- [ ] All files properly exported
- [ ] Implementation summary report created (test_implementation_summary.txt)
- [ ] Step mapping report created (test_step_mapping.txt)
- [ ] Code quality report created (test_code_quality_report.txt)
- [ ] Code passes npx cucumber-js --dry-run features/test.feature
- [ ] User approval obtained before marking complete

---

## Error Handling & Fallback

**If feature file invalid:**
```
1. Parse error found in test.feature
2. Report specific line with issue
3. Ask user: "Manual fix or regenerate from Agent 2?"
4. STOP if user doesn't resolve
```

**If steps scatter across multiple files:**
```
1. Detect step definitions in multiple files
2. WARN: "Step definitions must be consolidated in test.ts"
3. Ask user: "Consolidate all steps into test.ts?"
4. If yes: Merge all step files into single test.ts
5. If no: STOP and ask user to consolidate manually
```

**If locators not available:**
```
1. Identify missing locators
2. Generate semantic/fallback selectors in test.ts
3. WARN: "Using semantic selectors, may need verification"
4. Add alternative selectors as fallback .catch()
5. RECORD: Which locators are inferred vs verified
```

**If TypeScript compilation fails:**
```
1. List all compilation errors
2. Identify root cause (import, type, syntax)
3. Attempt auto-fix (add imports, fix types, consolidate files)
4. Re-compile
5. If still failing: STOP and show user
6. Do NOT proceed without passing tsc --noEmit
```

**If step definition can't be implemented:**
```
1. Identify problematic step from test.feature
2. Flag as TODO in test.ts with comment
3. Add stub implementation with descriptive message
4. Ask user: "Manual implementation or remove from feature?"
5. Do NOT execute tests with stub implementations
```

**If all steps not in test.ts:**
```
1. Detect step definitions in multiple files
2. CONSOLIDATE all into src/tests/steps/test.ts
3. Delete any domain-specific step files
4. Update imports in feature file references
5. Re-validate with npx cucumber-js --dry-run
```

---

## Success Criteria

✅ Agent 3 is successful if:
1. Feature file (test.feature) parsed successfully
2. Step definitions file (test.ts) created in src/tests/steps/
3. ALL steps from test.feature implemented in SINGLE test.ts file
4. No scattered definitions across multiple files
5. Direct locators used (no page object dependency)
6. Semantic/fallback selectors for flexibility
7. All Gherkin steps matched with regex patterns
8. TypeScript compilation passes (npx tsc --noEmit)
9. No import or circular dependency errors
10. No undefined or duplicate steps
11. Implementation summary report generated
12. Step mapping report generated
13. Code quality report generated
14. All reports use "test" prefix (test_implementation_summary.txt, etc.)
15. User approves code before marking complete
16. Code can be executed: npx cucumber-js features/test.feature

❌ Agent 3 should STOP if:
1. Feature file cannot be parsed
2. >50% of steps cannot be implemented
3. TypeScript compilation fails with critical errors
4. Circular dependencies detected
5. More than 5 undefined steps remain
6. Step definitions scattered across multiple files
7. test.ts not created in correct location (src/tests/steps/)
8. User rejects code without providing fixes

---

## Key Design Patterns

### Consolidated Step Definition Pattern (ALL IN test.ts)
```typescript
// Single file: src/tests/steps/test.ts
import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// No separate domain files
// No page object imports needed
// All steps in one file for easy maintenance

Given('I navigate to the application', 
  async function (this: ICustomWorld) {
    const baseUrl = process.env.BASE_URL || 'https://example.com';
    await this.page.goto(baseUrl);
  }
);

When('I enter email {string}', 
  async function (this: ICustomWorld, email: string) {
    const emailInput = this.page.locator('[data-testid="email"]');
    await emailInput.fill(email);
  }
);

Then('I should see logout button', 
  async function (this: ICustomWorld) {
    const logoutButton = this.page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  }
);

// ... ALL 28 steps in ONE file
```

### Direct Locator Pattern (No Page Objects)
```typescript
// Direct locator usage in step definitions
When('I fill login form', async function (this: ICustomWorld) {
  // Use direct selectors
  await this.page.locator('[data-testid="email"]').fill('test@example.com');
  await this.page.locator('[data-testid="password"]').fill('password123');
  
  // Fallback selectors with .catch()
  await this.page.locator('[data-testid="submit"]').catch(async () => {
    await this.page.locator('button:has-text("Sign In")').click();
  }).click();
});
```

### Locator Selection Strategy
```typescript
// Priority order for locators:
// 1. Data-testid (most stable)
// 2. Role-based selectors
// 3. CSS selectors
// 4. Fallback selectors

const emailInput = this.page.locator(
  '[data-testid="email"], ' +                    // Priority 1
  'input[aria-label="email"], ' +                // Priority 2
  'input[type="email"], ' +                      // Priority 3
  '[placeholder*="email"]'                       // Priority 4 (fallback)
);
```

### Error Handling Pattern
```typescript
When('I perform action', async function (this: ICustomWorld) {
  try {
    const element = this.page.locator('[data-testid="action-button"]');
    await element.click();
    await this.page.waitForLoadState('networkidle');
  } catch (error) {
    console.log('Action failed, trying fallback:', error.message);
    const fallback = this.page.locator('button:has-text("Action")');
    await fallback.click();
  }
});
```

### World Context Pattern
```typescript
// ICustomWorld provides page access
// No POManager needed for direct locators
interface ICustomWorld extends World {
  page: Page;
  browser?: Browser;
  context?: BrowserContext;
}

// Use in steps:
Given('step', async function (this: ICustomWorld) {
  await this.page.goto('/login');  // Direct access to page
});
```

### Consolidated File Organization
```
src/tests/
├── steps/
│   └── test.ts                 ← ALL step definitions here
├── support/
│   └── world.ts                ← ICustomWorld interface
├── locators/
│   ├── test.locator.ts         ← Existing test locators
│   └── POManager.ts            ← Optional, if needed
└── hooks/
    └── hooks.ts                ← Before/After hooks
```

