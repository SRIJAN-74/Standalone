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
  const cards = await page.locator('[class*="event"], [data-testid*="event"], .card, [data-testid*="card"]').all();
  console.log('cards=' + cards.length);
  const firstCard = cards[0];
  if (firstCard) {
    console.log('outer=' + await firstCard.evaluate(el => el.outerHTML.slice(0,2000).replace(/\n/g,' ')));
    const anchors = await firstCard.evaluate(el => Array.from(el.querySelectorAll('a')).map(a => ({href:a.href,text:a.textContent?.trim()})));
    console.log('anchors=' + JSON.stringify(anchors));
    const buttons = await firstCard.evaluate(el => Array.from(el.querySelectorAll('button')).map(b => ({text:b.textContent?.trim(), classes:b.className})));
    console.log('buttons=' + JSON.stringify(buttons));
  }
  await browser.close();
})();
