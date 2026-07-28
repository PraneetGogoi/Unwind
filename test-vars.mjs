import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3002/dashboard');
  
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  
  const vars = await page.evaluate(() => {
    const html = document.documentElement;
    const card = document.querySelector('.brutal-card');
    
    return {
      html_theme_paper: getComputedStyle(html).getPropertyValue('--theme-paper').trim(),
      html_color_paper: getComputedStyle(html).getPropertyValue('--color-paper').trim(),
      card_theme_paper: getComputedStyle(card).getPropertyValue('--theme-paper').trim(),
      card_color_paper: getComputedStyle(card).getPropertyValue('--color-paper').trim(),
      card_bg: getComputedStyle(card).backgroundColor
    };
  });
  console.log(vars);

  await browser.close();
})();
