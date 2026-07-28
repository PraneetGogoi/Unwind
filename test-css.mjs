import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3002/dashboard');
  
  const rules = await page.evaluate(() => {
    let result = '';
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.selectorText.includes('.bg-paper')) {
            result += rule.cssText + '\n';
          }
          if (rule.selectorText && rule.selectorText.includes('.text-ink')) {
            result += rule.cssText + '\n';
          }
        }
      } catch(e) {}
    }
    return result;
  });
  console.log("CSS Rules:\n", rules);

  await browser.close();
})();
