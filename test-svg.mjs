import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3002/dashboard');
  await page.waitForTimeout(2000);
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(1000);
  
  const textFills = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('.js-plotly-plot text'));
    return texts.map(t => t.getAttribute('fill')).filter(Boolean);
  });
  
  console.log("SVG Text fills (first 10):", textFills.slice(0, 10));

  await browser.close();
})();
