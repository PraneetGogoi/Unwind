import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3002/dashboard');
  
  // Wait for Plotly to render
  await page.waitForTimeout(2000);
  
  // Force dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  
  // Wait a bit for transition
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: '/Users/praneetgogoi/.gemini/antigravity-ide/brain/8ba02606-8b8e-462a-99ac-b9a4392472e4/scratch/dashboard-dark.png' });

  await browser.close();
})();
