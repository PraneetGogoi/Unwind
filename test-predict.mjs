import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3002/predict');
  
  console.log("Clicking Run Prediction...");
  const runBtn = page.locator('button:has-text("Run Prediction")');
  await runBtn.click();
  
  // Wait for result
  await page.waitForTimeout(2000);
  
  // Check if button is disabled
  const disabled = await runBtn.evaluate(b => b.disabled);
  console.log("Button is disabled:", disabled);
  
  const h2 = await page.locator('h2').allTextContents();
  console.log("H2s on page:", h2);
  
  await browser.close();
})();
