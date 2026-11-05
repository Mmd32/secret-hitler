import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  console.log('--- 1. Desktop 1440x900: Welcome Screen ---');
  const deskContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const deskPage = await deskContext.newPage();
  await deskPage.goto('http://localhost:3001');
  await deskPage.waitForTimeout(1000);
  await deskPage.screenshot({ path: path.join(outDir, 'desktop_01_welcome.png'), fullPage: true });

  console.log('--- 2. Desktop: Rules Assistant Modal ---');
  // Click on Rules button
  const rulesBtn = await deskPage.$('button[aria-label="راهنمای قوانین"]');
  if (rulesBtn) {
    await rulesBtn.click();
    await deskPage.waitForTimeout(500);
    await deskPage.screenshot({ path: path.join(outDir, 'desktop_02_rules_assistant.png') });
    // Close modal
    const closeBtn = await deskPage.$('button[aria-label="Close rules assistant"]');
    if (closeBtn) await closeBtn.click();
    await deskPage.waitForTimeout(300);
  }

  console.log('--- 3. Mobile 390x844: Welcome Screen ---');
  const mobContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: true,
    hasTouch: true,
  });
  const mobPage = await mobContext.newPage();
  await mobPage.goto('http://localhost:3001');
  await mobPage.waitForTimeout(1000);
  await mobPage.screenshot({ path: path.join(outDir, 'mobile_01_welcome.png'), fullPage: true });

  console.log('--- 4. Mobile: Enter Pass & Play Mode ---');
  // Find Pass & Play button
  const passPlayBtn = await mobPage.getByText(/بازی دورهمی با یک گوشی/);
  await passPlayBtn.click();
  await mobPage.waitForTimeout(500);
  await mobPage.screenshot({ path: path.join(outDir, 'mobile_02_pass_and_play_setup.png'), fullPage: true });

  console.log('--- 5. Mobile: Start Pass & Play -> Confidential Envelope ---');
  const startBtn = await mobPage.getByText(/آغاز بازی دورهمی/);
  await startBtn.click();
  await mobPage.waitForTimeout(500);
  await mobPage.screenshot({ path: path.join(outDir, 'mobile_03_confidential_envelope.png'), fullPage: true });

  console.log('--- 6. Mobile: Hold Envelope to reveal Secret Dossier ---');
  // Hold the envelope button
  const holdBtn = await mobPage.getByText(/برای باز کردن پاکت لمس کنید و نگه دارید/);
  const box = await holdBtn.boundingBox();
  if (box) {
    await mobPage.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await mobPage.mouse.down();
    await mobPage.waitForTimeout(600); // 280ms duration
    await mobPage.mouse.up();
  }
  await mobPage.waitForTimeout(500);
  await mobPage.screenshot({ path: path.join(outDir, 'mobile_04_secret_dossier.png'), fullPage: true });

  console.log('--- 7. Advance all players through role reveal to Main Tabletop Board ---');
  // Player 1 understood
  for (let i = 0; i < 5; i++) {
    const nextBtn = await mobPage.$('button:has-text("تحویل به نفر بعدی"), button:has-text("آغاز بازی!")');
    if (nextBtn) {
      await nextBtn.click();
      await mobPage.waitForTimeout(400);

      if (i < 4) {
        // Next player envelope
        const nextHold = await mobPage.$('text=برای باز کردن پاکت لمس کنید و نگه دارید');
        if (nextHold) {
          const b = await nextHold.boundingBox();
          if (b) {
            await mobPage.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
            await mobPage.mouse.down();
            await mobPage.waitForTimeout(600);
            await mobPage.mouse.up();
            await mobPage.waitForTimeout(400);
          }
        }
      }
    }
  }

  await mobPage.waitForTimeout(800);
  console.log('--- 8. Mobile & Desktop: Main Tabletop Board ---');
  await mobPage.screenshot({ path: path.join(outDir, 'mobile_05_main_board.png'), fullPage: true });

  // Capture on Desktop as well
  const deskBoardContext = await browser.newContext({
    viewport: { width: 1440, height: 950 },
  });
  const deskBoardPage = await deskBoardContext.newPage();
  await deskBoardPage.goto('http://localhost:3001');
  await deskBoardPage.waitForTimeout(500);
  await deskBoardPage.getByText(/بازی دورهمی با یک گوشی/).click();
  await deskBoardPage.waitForTimeout(300);
  await deskBoardPage.getByText(/آغاز بازی دورهمی/).click();
  await deskBoardPage.waitForTimeout(300);

  // Fast forward role reveals
  for (let i = 0; i < 5; i++) {
    const hold = await deskBoardPage.$('text=برای باز کردن پاکت لمس کنید و نگه دارید');
    if (hold) {
      const b = await hold.boundingBox();
      if (b) {
        await deskBoardPage.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
        await deskBoardPage.mouse.down();
        await deskBoardPage.waitForTimeout(600);
        await deskBoardPage.mouse.up();
        await deskBoardPage.waitForTimeout(300);
      }
    }
    const nBtn = await deskBoardPage.$('button:has-text("تحویل به نفر بعدی"), button:has-text("آغاز بازی!")');
    if (nBtn) {
      await nBtn.click();
      await deskBoardPage.waitForTimeout(300);
    }
  }
  await deskBoardPage.waitForTimeout(600);
  await deskBoardPage.screenshot({ path: path.join(outDir, 'desktop_03_main_board.png'), fullPage: true });

  console.log('--- 9. Mobile: Chancellor Nomination & Voting Modal ---');
  // In nomination, select chancellor candidate
  const firstEligible = await mobPage.$('div:has-text("مرحله اول: نامزدی صدراعظم") button');
  if (firstEligible) {
    await firstEligible.click();
    await mobPage.waitForTimeout(500);

    // Click secret voting mode
    const secretVoteBtn = await mobPage.getByText(/رأی‌گیری محرمانه با گوشی/);
    if (secretVoteBtn) {
      await secretVoteBtn.click();
      await mobPage.waitForTimeout(400);

      // Open ballot envelope
      const openDocBtn = await mobPage.getByText(/آماده‌ام — باز کردن صفحه/);
      if (openDocBtn) {
        await openDocBtn.click();
        await mobPage.waitForTimeout(400);
        await mobPage.screenshot({ path: path.join(outDir, 'mobile_06_voting_ballots.png'), fullPage: true });
      }
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully in /screenshots!');
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
