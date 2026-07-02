const { chromium } = require('playwright');
(async ()=>{
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://eventhub.rahulshettyacademy.com/login');
  await page.fill('input[type="email"]', 'manish123@gmail.com');
  await page.fill('input[type="password"]', 'Manish9@@');
  await Promise.all([page.click('button:has-text("Sign In")'), page.waitForLoadState('networkidle')]);
  await page.goto('https://eventhub.rahulshettyacademy.com/');
  await page.waitForLoadState('networkidle');
  const anchor = page.locator('article[data-testid="event-card"] a:has-text("Book Now")').first();
  const count = await anchor.count();
  console.log('bookNowAnchors=' + count);
  if (count > 0) {
    const href = await anchor.getAttribute('href');
    const text = await anchor.textContent();
    console.log('firstBookNow=' + text + ' href=' + href);
    await anchor.click();
    await page.waitForLoadState('networkidle');
    console.log('after click url=' + page.url());
    const bookingSelector = 'form, [role="form"], [class*="booking"], [data-testid*="booking"], [class*="book"]';
    const bookingVisible = await page.locator(bookingSelector).first().isVisible().catch(() => false);
    console.log('bookingVisible=' + bookingVisible);
    const title = await page.locator('h1, h2, [role="heading"]').first().textContent().catch(() => '');
    console.log('title=' + title);
    const buttons = await page.locator('button, a').allTextContents();
    console.log('buttonTexts=' + JSON.stringify(buttons.filter(t => /book|register|confirm|ticket/i.test(t)).slice(0,30)));
  }
  await browser.close();
})();
