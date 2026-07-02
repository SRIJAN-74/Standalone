const { chromium } = require('playwright');
(async ()=>{
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://eventhub.rahulshettyacademy.com/login');
  await page.fill('input[type="email"]', 'manish123@gmail.com');
  await page.fill('input[type="password"]', 'Manish9@@');
  await Promise.all([page.click('button:has-text("Sign In")'), page.waitForLoadState('networkidle')]);
  await page.waitForURL('**/events', { timeout: 15000 }).catch(() => {});
  console.log('after login url=' + page.url());
  const cards = await page.locator('div[class*="event"], div[class*="card"], article, [data-testid*="event"], [data-testid*="card"], [data-testid*="event-card"]').all();
  console.log('cards=' + cards.length);
  for (let i = 0; i < Math.min(5,cards.length); ++i) {
    const el = cards[i];
    const outer = await el.evaluate(e => e.outerHTML.slice(0,1200).replace(/\n/g,' '));
    console.log('card' + i + '=' + outer);
  }
  const anchors = await page.evaluate(() => Array.from(document.querySelectorAll('a[href*="event"], a[href*="events"], a[href*="/event"], a[href*="/events"], a[href*="eventdetails"], a[href*="event-details"]')).map(a => ({href:a.href, text:a.textContent?.trim()})));
  console.log('anchors=' + JSON.stringify(anchors.slice(0,20)));
  const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button, a')).map(el => ({tag:el.tagName, text:el.textContent?.trim(), class:el.className, href:el.href||''})).slice(0,80));
  console.log('buttonCount=' + buttons.length);
  // print only interesting buttons with known labels
  const bookButtons = buttons.filter(b => /book|register|details|view/i.test(b.text));
  console.log('bookButtons=' + JSON.stringify(bookButtons));
  await browser.close();
})();
