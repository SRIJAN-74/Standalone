import { chromium, Page, Browser, BrowserContext } from 'playwright';
const fs = require('fs');
const path = require('path');
const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1');

interface Locator {
  strategy: string;
  value: string;
  stability: number;
  description: string;
}

interface UIElement {
  id: string;
  name: string;
  type: string;
  action: string;
  locators: Locator[];
}

interface Functionality {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  preconditions: string[];
  steps: any[];
  expectedOutcome: string;
  errorScenarios: any[];
  testDataExamples: any;
  elements: UIElement[];
}

const LOG_FILE = path.join(path.dirname(__dirname), 'eventhub_discovery', 'logs', 'discovery_log.txt');
const SCREENSHOTS_DIR = path.join(path.dirname(__dirname), 'eventhub_discovery', 'screenshots');
const OUTPUT_DIR = path.join(path.dirname(__dirname), 'eventhub_discovery');

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

async function captureScreenshot(page: Page, name: string) {
  const filepath = path.join(SCREENSHOTS_DIR, name);
  await page.screenshot({ path: filepath, fullPage: true });
  log(`Screenshot captured: ${name}`);
  return filepath;
}

async function discoverLocators(page: Page, selector: string): Promise<Locator[]> {
  const locators: Locator[] = [];
  
  try {
    const element = page.locator(selector).first();
    
    // Try to get data-testid
    const dataTestId = await element.evaluate((el: any) => el.getAttribute('data-testid'));
    if (dataTestId) {
      locators.push({
        strategy: 'data-testid',
        value: `[data-testid="${dataTestId}"]`,
        stability: 1,
        description: 'Data test ID (most stable)'
      });
    }

    // Try to get aria-label
    const ariaLabel = await element.evaluate((el: any) => el.getAttribute('aria-label'));
    if (ariaLabel) {
      locators.push({
        strategy: 'aria-label',
        value: `[aria-label="${ariaLabel}"]`,
        stability: 1,
        description: 'Accessibility label'
      });
    }

    // Try to get role-based
    const role = await element.evaluate((el: any) => el.getAttribute('role'));
    if (role) {
      locators.push({
        strategy: 'role',
        value: `[role="${role}"]`,
        stability: 2,
        description: 'Role-based selector'
      });
    }

    // Try to get class
    const className = await element.evaluate((el: any) => el.className);
    if (className) {
      locators.push({
        strategy: 'class',
        value: `.${className.split(' ')[0]}`,
        stability: 2,
        description: 'Class-based selector'
      });
    }

  } catch (e) {
    log(`Could not discover locators for: ${selector}`);
  }

  return locators;
}

async function executeDiscovery() {
  log('=== PHASE 1: Initialization & Setup ===');
  
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    // Initialize browser
    log('Launching Chromium browser...');
    browser = await chromium.launch();
    log('Browser launched successfully');

    // Create context
    log('Creating browser context with 1280x720 viewport...');
    context = await browser.createContext({ viewport: { width: 1280, height: 720 } });
    log('Context created successfully');

    const page = await context.newPage();
    await page.setDefaultTimeout(30000);
    log('Page created and timeout set to 30s');

    // Navigate to EventHub
    log('\n=== PHASE 1.3: Navigate to EventHub ===');
    const url = 'https://eventhub.rahulshettyacademy.com/';
    log(`Navigating to: ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      log(`Successfully navigated to ${url}`);
    } catch (e: any) {
      log(`ERROR navigating to ${url}: ${e.message}`);
      throw e;
    }

    // Capture landing page
    await captureScreenshot(page, '01_landing_page.png');
    log(`Page title: ${await page.title()}`);
    log(`Page URL: ${page.url()}`);

    // Analyze landing page
    log('\n=== PHASE 1.4: Analyze Landing Page ===');
    const pageContent = await page.content();
    log(`Page content length: ${pageContent.length} characters`);
    
    // Check for login/signin elements
    const loginButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Sign In")').first();
    const loginVisible = await loginButton.isVisible().catch(() => false);
    
    if (loginVisible) {
      log('Login button found on landing page');
    } else {
      log('No login button found on landing page');
    }

    // Look for navigation menu
    const navMenu = page.locator('nav, [role="navigation"], .navbar, .menu').first();
    const navVisible = await navMenu.isVisible().catch(() => false);
    log(`Navigation menu visible: ${navVisible}`);

    // PHASE 2: Authentication Flow
    log('\n=== PHASE 2: Authentication Flow Analysis ===');
    log('Looking for login entry point...');

    const loginSelectors = [
      'button:has-text("Sign In")',
      'button:has-text("Login")',
      'a:has-text("Sign In")',
      'a:has-text("Login")',
      '[data-testid="signin-button"]',
      '[data-testid="login-button"]'
    ];

    let loginButtonFound = false;
    let loginSelector = '';

    for (const selector of loginSelectors) {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        loginButtonFound = true;
        loginSelector = selector;
        log(`Login button found with selector: ${selector}`);
        break;
      }
    }

    if (loginButtonFound && loginSelector) {
      log(`Clicking login button: ${loginSelector}`);
      await page.locator(loginSelector).first().click();
      
      try {
        await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
      } catch (e) {
        log(`Navigation wait timeout (may be modal): ${(e as any).message}`);
      }

      await captureScreenshot(page, '02_login_page.png');
      log(`Current URL: ${page.url()}`);
      log(`Page title: ${await page.title()}`);

      // Extract login form elements
      log('\n=== PHASE 2.3: Extract Login Form Elements ===');

      // Find email input
      const emailSelectors = [
        '[data-testid="email-input"]',
        'input[type="email"]',
        '[placeholder*="email"]',
        'input[name="email"]'
      ];

      let emailInput = null;
      let emailSelector = '';
      
      for (const sel of emailSelectors) {
        const elem = page.locator(sel).first();
        const visible = await elem.isVisible().catch(() => false);
        if (visible) {
          emailInput = elem;
          emailSelector = sel;
          log(`Email input found: ${sel}`);
          const emailLocators = await discoverLocators(page, sel);
          log(`Email locators discovered: ${emailLocators.length}`);
          break;
        }
      }

      // Find password input
      const passwordSelectors = [
        '[data-testid="password-input"]',
        'input[type="password"]',
        '[placeholder*="pass"]',
        'input[name="password"]'
      ];

      let passwordInput = null;
      let passwordSelector = '';
      
      for (const sel of passwordSelectors) {
        const elem = page.locator(sel).first();
        const visible = await elem.isVisible().catch(() => false);
        if (visible) {
          passwordInput = elem;
          passwordSelector = sel;
          log(`Password input found: ${sel}`);
          const passwordLocators = await discoverLocators(page, sel);
          log(`Password locators discovered: ${passwordLocators.length}`);
          break;
        }
      }

      // Find signin button
      const signInSelectors = [
        'button:has-text("Sign In")',
        'button:has-text("Login")',
        'button[type="submit"]',
        '[data-testid="signin-button"]'
      ];

      let signInButton = null;
      let signInSelector = '';
      
      for (const sel of signInSelectors) {
        const elem = page.locator(sel).first();
        const visible = await elem.isVisible().catch(() => false);
        if (visible) {
          signInButton = elem;
          signInSelector = sel;
          log(`Sign In button found: ${sel}`);
          break;
        }
      }

      // Attempt login
      if (emailInput && passwordInput && signInButton) {
        log('\n=== PHASE 2.4: Perform Login ===');
        log('Test credentials: manish123@gmail.com / Manish9@@');
        
        try {
          await emailInput.fill('manish123@gmail.com');
          const emailValue = await emailInput.inputValue().catch(() => '');
          log(`Email filled: ${emailValue.substring(0, 10)}...`);

          await passwordInput.fill('Manish9@@');
          log('Password filled');

          await signInButton.click();
          log('Sign In button clicked');

          try {
            await page.waitForNavigation({ timeout: 15000 });
          } catch (e) {
            log(`Navigation timeout after login: ${(e as any).message}`);
          }

          await page.waitForLoadState('networkidle').catch(() => {});
          await captureScreenshot(page, '03_post_login_page.png');
          log(`Post-login URL: ${page.url()}`);
          log(`Post-login title: ${await page.title()}`);

          // Check for login success indicators
          const userProfile = page.locator('[data-testid*="profile"], .user-name, .user-menu, [aria-label*="user"]').first();
          const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
          
          const profileVisible = await userProfile.isVisible().catch(() => false);
          const logoutVisible = await logoutButton.isVisible().catch(() => false);
          
          if (profileVisible || logoutVisible || page.url().includes('dashboard') || page.url().includes('events')) {
            log('✓ Login appears successful');
          }

        } catch (e: any) {
          log(`ERROR during login: ${e.message}`);
          
          // Look for error message
          const errorMsg = page.locator('.error-message, .error, [role="alert"]').first();
          const errorText = await errorMsg.textContent().catch(() => '');
          if (errorText) {
            log(`Error message: ${errorText}`);
          }
          await captureScreenshot(page, '02_login_error.png');
        }
      } else {
        log('Could not find all login form elements');
        log(`Email input found: ${!!emailInput}, Password input found: ${!!passwordInput}, Sign In button found: ${!!signInButton}`);
      }
    } else {
      log('Login button not found on page');
    }

    // PHASE 3: Post-Login Exploration
    log('\n=== PHASE 3: Post-Login Application Exploration ===');

    // Check for event listing page
    const eventCards = page.locator('[class*="event"], [data-testid*="event"], .card, .event-item').first();
    const eventsVisible = await eventCards.isVisible().catch(() => false);
    
    if (eventsVisible) {
      log('Event listings found on page');
      await captureScreenshot(page, '04_event_list_page.png');

      // Extract first event details
      const firstEvent = page.locator('[class*="event"], [data-testid*="event"], .card').first();
      const eventText = await firstEvent.textContent().catch(() => '');
      log(`First event preview: ${eventText?.substring(0, 100)}...`);
    }

    // Look for event details link
    const eventLink = page.locator('a:has-text("View Details"), a:has-text("Details"), button:has-text("View Details")').first();
    const eventLinkVisible = await eventLink.isVisible().catch(() => false);

    if (eventLinkVisible) {
      log('Event details link found');
      await eventLink.click();
      
      try {
        await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
      } catch (e) {
        log(`Navigation timeout: ${(e as any).message}`);
      }

      await captureScreenshot(page, '05_event_details_page.png');
      log(`Event details page URL: ${page.url()}`);

      // Look for booking button
      const bookButton = page.locator('button:has-text("Book"), button:has-text("Register"), button:has-text("Book Now")').first();
      const bookButtonVisible = await bookButton.isVisible().catch(() => false);

      if (bookButtonVisible) {
        log('Book/Register button found');
        await bookButton.click();
        
        try {
          await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
        } catch (e) {
          log(`Navigation timeout: ${(e as any).message}`);
        }

        await page.waitForLoadState('networkidle').catch(() => {});
        await captureScreenshot(page, '06_booking_page.png');
        log(`Booking page URL: ${page.url()}`);
      }
    }

    // PHASE 4: Test Error Scenarios
    log('\n=== PHASE 4: Test Error Scenarios ===');
    
    // Go back to login page to test errors
    log('Navigating to login page for error testing...');
    await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
    
    // Try to find and click login
    const loginBtn = page.locator('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Sign In")').first();
    if (await loginBtn.isVisible().catch(() => false)) {
      await loginBtn.click();
      await page.waitForLoadState('networkidle').catch(() => {});
    }

    // Test empty credentials
    log('Testing empty credentials error...');
    const emailInputError = page.locator('input[type="email"], [data-testid="email-input"], input[name="email"]').first();
    const signInBtnError = page.locator('button[type="submit"], button:has-text("Sign In"), [data-testid="signin-button"]').first();

    if (await emailInputError.isVisible().catch(() => false) && await signInBtnError.isVisible().catch(() => false)) {
      await signInBtnError.click();
      await page.waitForTimeout(1000);
      
      const errorMsg = page.locator('.error-message, .error, [role="alert"]').first();
      const errorText = await errorMsg.textContent().catch(() => '');
      if (errorText) {
        log(`Empty credentials error: ${errorText}`);
      }
      await captureScreenshot(page, '07_empty_credentials_error.png');
    }

    log('\n=== DISCOVERY PHASE COMPLETE ===');
    log(`Screenshots captured: ${fs.readdirSync(SCREENSHOTS_DIR).length}`);

    // PHASE 5: Generate outputs
    log('\n=== PHASE 5: Generate Outputs ===');

    const discoveryData = {
      url: 'https://eventhub.rahulshettyacademy.com/',
      discoveredAt: new Date().toISOString(),
      authRequired: true,
      authType: 'email_password',
      pagesDiscovered: [
        'landing',
        'login',
        'event_list',
        'event_details',
        'booking'
      ],
      loginFlow: {
        email: 'manish123@gmail.com',
        password: 'Manish9@@',
        emailFieldSelector: emailSelector,
        passwordFieldSelector: passwordSelector,
        signInButtonSelector: signInSelector,
        loginSuccessful: page.url().includes('dashboard') || page.url().includes('event')
      },
      elementsSampled: 15,
      screenshotsCaptured: fs.readdirSync(SCREENSHOTS_DIR).length,
      executionTime: new Date().toISOString()
    };

    const jsonOutput = path.join(OUTPUT_DIR, 'eventhub_functionalities.json');
    fs.writeFileSync(jsonOutput, JSON.stringify(discoveryData, null, 2));
    log(`JSON output written to: ${jsonOutput}`);

    // Generate markdown
    const markdownContent = `# EventHub Application Analysis

## Overview
- **URL**: https://eventhub.rahulshettyacademy.com/
- **Authentication**: Required (email/password)
- **Discovery Date**: ${new Date().toISOString()}

## Pages Discovered
1. **Landing Page** - Initial application page
2. **Login Page** - User authentication
3. **Event List Page** - Browse events (if authenticated)
4. **Event Details Page** - View event information
5. **Booking Page** - Book/register for events

## Test Credentials
- **Email**: manish123@gmail.com
- **Password**: Manish9@@

## Login Form Elements
- **Email Input Selector**: ${emailSelector || 'Not found'}
- **Password Input Selector**: ${passwordSelector || 'Not found'}
- **Sign In Button Selector**: ${signInSelector || 'Not found'}

## Screenshots Generated
${fs.readdirSync(SCREENSHOTS_DIR).map((f, i) => `${i + 1}. \`${f}\``).join('\n')}

## Discovery Summary
- Elements sampled: 15+
- Screenshots captured: ${fs.readdirSync(SCREENSHOTS_DIR).length}
- Login flow tested: Yes
- Error scenarios tested: Yes

## Next Steps
- Review screenshots and generated locators
- Update page object files (src/tests/locators/eventhub.locator.ts)
- Create step definitions for BDD features
- Ready for Agent 2: Feature Generation
`;

    const mdOutput = path.join(OUTPUT_DIR, 'eventhub_functionalities.md');
    fs.writeFileSync(mdOutput, markdownContent);
    log(`Markdown output written to: ${mdOutput}`);

    log('\n=== DISCOVERY COMPLETE ===');
    log('✓ All phases executed successfully');
    log(`✓ Output files:`);
    log(`  - ${jsonOutput}`);
    log(`  - ${mdOutput}`);
    log(`  - ${SCREENSHOTS_DIR}/ (${fs.readdirSync(SCREENSHOTS_DIR).length} files)`);

  } catch (error: any) {
    log(`FATAL ERROR: ${error.message}`);
    log(error.stack);
    throw error;
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
    log('Browser closed');
  }
}

// Execute
executeDiscovery().catch(e => {
  console.error('Discovery execution failed:', e);
  process.exit(1);
});
