import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3002/dashboard');
  
  const textColor = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return window.getComputedStyle(el).color;
  });
  console.log("H1 text color (default light):", textColor);
  
  // Toggle dark mode (clicking the moon icon)
  // But wait, the default might be light or dark based on system.
  // Let's check the HTML class.
  const htmlClass = await page.evaluate(() => document.documentElement.className);
  console.log("HTML class:", htmlClass);
  
  // Force dark mode
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  
  const darkTextColor = await page.evaluate(() => {
    const el = document.querySelector('h1');
    return window.getComputedStyle(el).color;
  });
  console.log("H1 text color (forced dark):", darkTextColor);

  // Check the background color of the brutal-card which had bg-paper
  const cardBg = await page.evaluate(() => {
    const el = document.querySelector('.brutal-card.bg-paper');
    return el ? window.getComputedStyle(el).backgroundColor : null;
  });
  console.log("Card bg (forced dark):", cardBg);

  await browser.close();
})();
