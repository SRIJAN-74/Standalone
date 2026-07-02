import { Page, Locator } from '@playwright/test';
export {
  EventHubLoginPage,
  EventHubEventListPage,
  EventHubEventDetailsPage,
  EventHubBookingPage,
  EventHubUserProfilePage
} from './eventhub.locator';

export class TestPage {
  readonly page: Page;
  readonly userEmailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
 
  constructor(page: Page) {
    this.page = page;
    this.userEmailInput = page.getByPlaceholder('you@email.com');
    this.passwordInput = page.getByPlaceholder('••••••');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.locator('.error-message');
  }
}