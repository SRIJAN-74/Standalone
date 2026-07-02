import { Page, Locator } from '@playwright/test';

/**
 * EventHub Login Page Object
 * Handles user authentication and login form interactions
 */
export class EventHubLoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    // Rank 1 locators (most stable - data-testid, role-based, type-based)
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.signInButton = page.locator('button:has-text("Sign In")');
    this.errorMessage = page.locator('.error-message, .error, [role="alert"]');
    this.pageHeading = page.locator('h1, h2, [role="heading"]');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.page.goto('https://eventhub.rahulshettyacademy.com/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Perform login with email and password
   * @param email - User email address
   * @param password - User password
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    
    // Wait for navigation after login
    try {
      await this.page.waitForNavigation({ timeout: 15000 });
    } catch {
      // Page might not navigate if JavaScript-driven
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Get login error message if present
   */
  async getErrorMessage(): Promise<string> {
    try {
      return await this.errorMessage.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Check if login was successful
   */
  async isLoginSuccessful(): Promise<boolean> {
    // Check if we're on dashboard/events page and logout button exists
    const logoutButton = this.page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
    return await logoutButton.isVisible().catch(() => false);
  }

  /**
   * Verify email field is visible
   */
  async isEmailFieldVisible(): Promise<boolean> {
    return await this.emailInput.isVisible().catch(() => false);
  }

  /**
   * Verify password field is visible
   */
  async isPasswordFieldVisible(): Promise<boolean> {
    return await this.passwordInput.isVisible().catch(() => false);
  }

  /**
   * Verify sign in button is visible
   */
  async isSignInButtonVisible(): Promise<boolean> {
    return await this.signInButton.isVisible().catch(() => false);
  }
}

/**
 * EventHub Event List Page Object
 * Handles event browsing, searching, and filtering
 */
export class EventHubEventListPage {
  readonly page: Page;
  readonly eventCards: Locator;
  readonly searchInput: Locator;
  readonly filterButton: Locator;
  readonly eventTitle: Locator;
  readonly eventDate: Locator;
  readonly eventPrice: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventCards = page.locator('[class*="event"], [data-testid*="event"], .card');
    this.searchInput = page.locator('input[type="search"], [placeholder*="search"]').first();
    this.filterButton = page.locator('button:has-text("Filter"), [data-testid*="filter"]').first();
    this.eventTitle = page.locator('[class*="event-title"], [class*="event-name"], h2, h3').first();
    this.eventDate = page.locator('[class*="event-date"], [class*="date"]').first();
    this.eventPrice = page.locator('[class*="event-price"], [class*="price"]').first();
  }

  /**
   * Navigate to event list page
   */
  async navigateToEventList() {
    await this.page.goto('https://eventhub.rahulshettyacademy.com/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get count of visible event cards
   */
  async getEventCount(): Promise<number> {
    return await this.eventCards.count();
  }

  /**
   * Check if event listings are displayed
   */
  async hasEvents(): Promise<boolean> {
    const count = await this.getEventCount();
    return count > 0;
  }

  /**
   * Search for events by keyword
   * @param keyword - Search keyword
   */
  async searchEvents(keyword: string) {
    const isVisible = await this.searchInput.isVisible().catch(() => false);
    if (isVisible) {
      await this.searchInput.fill(keyword);
      await this.searchInput.press('Enter');
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Click on first event to view details
   */
  async clickFirstEvent() {
    const firstEvent = this.eventCards.first();
    const isVisible = await firstEvent.isVisible().catch(() => false);
    if (isVisible) {
      await firstEvent.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Get first event title
   */
  async getFirstEventTitle(): Promise<string> {
    try {
      return await this.eventCards.first().locator('[class*="title"], h2, h3').first().textContent() || '';
    } catch {
      return '';
    }
  }
}

/**
 * EventHub Event Details Page Object
 * Handles event details viewing and booking interactions
 */
export class EventHubEventDetailsPage {
  readonly page: Page;
  readonly eventTitle: Locator;
  readonly eventDescription: Locator;
  readonly eventDate: Locator;
  readonly eventTime: Locator;
  readonly eventLocation: Locator;
  readonly eventPrice: Locator;
  readonly bookButton: Locator;
  readonly backButton: Locator;
  readonly shareButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventTitle = page.locator('h1, h2, [role="heading"]').first();
    this.eventDescription = page.locator('[class*="description"], p').first();
    this.eventDate = page.locator('[class*="date"], [data-testid*="date"]').first();
    this.eventTime = page.locator('[class*="time"], [data-testid*="time"]').first();
    this.eventLocation = page.locator('[class*="location"], [data-testid*="location"]').first();
    this.eventPrice = page.locator('[class*="price"], [data-testid*="price"]').first();
    this.bookButton = page.locator('button:has-text("Book"), button:has-text("Register"), button:has-text("Book Now")').first();
    this.backButton = page.locator('button:has-text("Back"), a:has-text("Back")').first();
    this.shareButton = page.locator('button:has-text("Share"), [data-testid*="share"]').first();
  }

  /**
   * Get event title text
   */
  async getEventTitle(): Promise<string> {
    try {
      return await this.eventTitle.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Get event description
   */
  async getEventDescription(): Promise<string> {
    try {
      return await this.eventDescription.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Get event date
   */
  async getEventDate(): Promise<string> {
    try {
      return await this.eventDate.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Get event price
   */
  async getEventPrice(): Promise<string> {
    try {
      return await this.eventPrice.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Check if book button is visible
   */
  async isBookButtonVisible(): Promise<boolean> {
    return await this.bookButton.isVisible().catch(() => false);
  }

  /**
   * Click book button to proceed to booking
   */
  async clickBookButton() {
    const isVisible = await this.isBookButtonVisible();
    if (isVisible) {
      await this.bookButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Go back to event list
   */
  async goBack() {
    const isVisible = await this.backButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.backButton.click();
      await this.page.waitForLoadState('networkidle');
    } else {
      await this.page.goBack();
      await this.page.waitForLoadState('networkidle');
    }
  }
}

/**
 * EventHub Booking Page Object
 * Handles event booking/registration form interactions
 */
export class EventHubBookingPage {
  readonly page: Page;
  readonly eventNameField: Locator;
  readonly ticketCountInput: Locator;
  readonly attendeeNameInput: Locator;
  readonly attendeeEmailInput: Locator;
  readonly attendeePhoneInput: Locator;
  readonly promoCodeInput: Locator;
  readonly totalPriceDisplay: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventNameField = page.locator('input[readonly], [disabled], [class*="event-name"]').first();
    this.ticketCountInput = page.locator('input[type="number"], select[name*="ticket"], select[name*="quantity"]').first();
    this.attendeeNameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
    this.attendeeEmailInput = page.locator('input[type="email"]:visible').first();
    this.attendeePhoneInput = page.locator('input[type="tel"], input[name*="phone"]').first();
    this.promoCodeInput = page.locator('input[placeholder*="promo"], input[name*="promo"]').first();
    this.totalPriceDisplay = page.locator('[class*="total"], [class*="price"]').first();
    this.confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Book"), button:has-text("Complete")').first();
    this.cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
  }

  /**
   * Check if booking form is displayed
   */
  async isBookingFormVisible(): Promise<boolean> {
    return await this.page.locator('form, [role="form"]').first().isVisible().catch(() => false);
  }

  /**
   * Select ticket quantity
   * @param quantity - Number of tickets
   */
  async selectTicketQuantity(quantity: number) {
    const isVisible = await this.ticketCountInput.isVisible().catch(() => false);
    if (isVisible) {
      await this.ticketCountInput.selectOption(quantity.toString()).catch(() => {
        // If selectOption fails, try fill for number input
        this.ticketCountInput.fill(quantity.toString());
      });
    }
  }

  /**
   * Fill attendee details
   */
  async fillAttendeeDetails(name: string, email: string, phone: string) {
    const nameVisible = await this.attendeeNameInput.isVisible().catch(() => false);
    const emailVisible = await this.attendeeEmailInput.isVisible().catch(() => false);
    const phoneVisible = await this.attendeePhoneInput.isVisible().catch(() => false);

    if (nameVisible) await this.attendeeNameInput.fill(name);
    if (emailVisible) await this.attendeeEmailInput.fill(email);
    if (phoneVisible) await this.attendeePhoneInput.fill(phone);
  }

  /**
   * Apply promo code
   * @param code - Promo code
   */
  async applyPromoCode(code: string) {
    const isVisible = await this.promoCodeInput.isVisible().catch(() => false);
    if (isVisible) {
      await this.promoCodeInput.fill(code);
      // Look for apply button
      const applyButton = this.page.locator('button:has-text("Apply"), button:has-text("Validate")').first();
      const applyVisible = await applyButton.isVisible().catch(() => false);
      if (applyVisible) {
        await applyButton.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  /**
   * Get total price
   */
  async getTotalPrice(): Promise<string> {
    try {
      return await this.totalPriceDisplay.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Complete booking
   */
  async completeBooking() {
    const isVisible = await this.confirmButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.confirmButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking() {
    const isVisible = await this.cancelButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.cancelButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }
}

/**
 * EventHub User Profile Page Object
 * Handles user account and profile interactions
 */
export class EventHubUserProfilePage {
  readonly page: Page;
  readonly userNameDisplay: Locator;
  readonly userEmailDisplay: Locator;
  readonly editProfileButton: Locator;
  readonly changePasswordButton: Locator;
  readonly myBookingsButton: Locator;
  readonly logoutButton: Locator;
  readonly deleteAccountButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userNameDisplay = page.locator('[class*="user-name"], [data-testid*="profile-name"]').first();
    this.userEmailDisplay = page.locator('[class*="user-email"], [data-testid*="profile-email"]').first();
    this.editProfileButton = page.locator('button:has-text("Edit Profile"), a:has-text("Edit")').first();
    this.changePasswordButton = page.locator('button:has-text("Change Password"), a:has-text("Password")').first();
    this.myBookingsButton = page.locator('button:has-text("My Bookings"), a:has-text("Bookings")').first();
    this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
    this.deleteAccountButton = page.locator('button:has-text("Delete Account")').first();
  }

  /**
   * Navigate to user profile page
   */
  async navigateToProfile() {
    await this.page.goto('https://eventhub.rahulshettyacademy.com/profile');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get user name from profile
   */
  async getUserName(): Promise<string> {
    try {
      return await this.userNameDisplay.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Get user email from profile
   */
  async getUserEmail(): Promise<string> {
    try {
      return await this.userEmailDisplay.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Click edit profile button
   */
  async editProfile() {
    const isVisible = await this.editProfileButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.editProfileButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Click change password button
   */
  async changePassword() {
    const isVisible = await this.changePasswordButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.changePasswordButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * View my bookings
   */
  async viewMyBookings() {
    const isVisible = await this.myBookingsButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.myBookingsButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Logout user
   */
  async logout() {
    const isVisible = await this.logoutButton.isVisible().catch(() => false);
    if (isVisible) {
      await this.logoutButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }
}
