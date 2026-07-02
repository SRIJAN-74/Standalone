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
  const first = page.locator('a[href*=\"event\"], div[class*=\"event-card\"], [data-testid*=\"event-item\"], [class*=\"card\"]').first();
  const count = await first.count();
  console.log('eventCount=' + count);
  if (count > 0) {
    await first.click();
    await page.waitForLoadState('networkidle');
    console.log('url=' + page.url());
    const btns = await page.locator('button, a').allTextContents();
    console.log('buttons=' + JSON.stringify(btns.slice(0,50)));
    const book = await page.locator('button:has-text("Book"), button:has-text("Book Now"), button:has-text("Register"), a:has-text("Book"), a:has-text("Book Now"), a:has-text("Register")').allTextContents();
    console.log('bookCandidates=' + JSON.stringify(book));
    const html = await page.content();
    console.log('htmlSnippet=' + html.slice(0,1200).replace(/\n/g,' '));
  }
  await browser.close();
})();
