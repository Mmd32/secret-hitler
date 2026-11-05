import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: true,
    hasTouch: true,
  });
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(600);
  await page.getByText(/بازی دورهمی با یک گوشی/).click();
  await page.waitForTimeout(300);
  await page.getByText(/آغاز بازی دورهمی/).click();
  await page.waitForTimeout(400);

  // Advance all 5 players through secret dossier reveal
  for (let i = 0; i < 5; i++) {
    const hold = page.locator('text=برای باز کردن پاکت لمس کنید و نگه دارید');
    if (await hold.count() > 0) {
      const b = await hold.boundingBox();
      if (b) {
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
        await page.mouse.down();
        await page.waitForTimeout(600);
        await page.mouse.up();
        await page.waitForTimeout(300);
      }
    }
    const nextBtn = page.locator('button:has-text("متوجه شدم"), button:has-text("همه دیدند")');
    if (await nextBtn.count() > 0) {
      await nextBtn.first().click();
      await page.waitForTimeout(300);
    }
  }

  // Now on nomination phase!
  await page.waitForTimeout(600);
  const candidateButtons = page.locator('div:has-text("مرحله اول: نامزدی صدراعظم") button');
  if (await candidateButtons.count() > 0) {
    await candidateButtons.first().click();
    await page.waitForTimeout(400);
    // Click secret voting mode
    await page.getByText(/رأی‌گیری محرمانه با گوشی/).click();
    await page.waitForTimeout(400);
    // Click open document
    await page.getByText(/آماده‌ام — باز کردن صفحه/).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.resolve('screenshots/mobile_06_voting_ballots.png'), fullPage: true });
    console.log('mobile_06_voting_ballots.png captured successfully!');
  }
  await browser.close();
})();
