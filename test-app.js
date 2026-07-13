const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  
  console.log('Logging in...');
  await page.fill('input[type="email"]', 'alice@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(3000);
  console.log('Current URL:', page.url());
  
  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);
  console.log('Current URL:', page.url());
  
  await browser.close();
})();
