import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3002');
  
  const exploreBtn = page.locator('text=Explore Dashboard');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
    exploreBtn.click()
  ]);
  
  console.log("URL after click:", page.url());
  
  await browser.close();
})();
