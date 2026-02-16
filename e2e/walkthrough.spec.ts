import { test, expect, Page } from '@playwright/test';

/* ------------------------------------------------------------------ */
/*  Helper: caption overlay                                            */
/* ------------------------------------------------------------------ */
async function showCaption(page: Page, text: string, hold = 10_000) {
  await page.evaluate(
    ({ text, hold }) => {
      // Remove any existing caption
      document.getElementById('pw-caption')?.remove();

      const el = document.createElement('div');
      el.id = 'pw-caption';
      Object.assign(el.style, {
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100%',
        background: 'rgba(0,0,0,0.82)',
        color: '#fff',
        fontSize: '22px',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px 40px',
        zIndex: '999999',
        textAlign: 'center',
        lineHeight: '1.5',
        letterSpacing: '0.3px',
        transition: 'opacity 0.4s',
      });
      el.textContent = text;
      document.body.appendChild(el);
    },
    { text, hold },
  );
  await page.waitForTimeout(hold);
}

/* ------------------------------------------------------------------ */
/*  Helper: title card                                                 */
/* ------------------------------------------------------------------ */
async function showTitleCard(page: Page, title: string, subtitle: string, hold = 5000) {
  await page.evaluate(
    ({ title, subtitle }) => {
      const el = document.createElement('div');
      el.id = 'pw-title-card';
      Object.assign(el.style, {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        zIndex: '999999',
        transition: 'opacity 0.6s',
      });

      const h1 = document.createElement('h1');
      Object.assign(h1.style, {
        color: '#fff',
        fontSize: '56px',
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '700',
        margin: '0 0 16px 0',
        letterSpacing: '1px',
      });
      h1.textContent = title;

      const p = document.createElement('p');
      Object.assign(p.style, {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '24px',
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '400',
        margin: '0',
      });
      p.textContent = subtitle;

      el.appendChild(h1);
      el.appendChild(p);
      document.body.appendChild(el);
    },
    { title, subtitle },
  );
  await page.waitForTimeout(hold);
}

async function removeTitleCard(page: Page) {
  await page.evaluate(() => {
    const el = document.getElementById('pw-title-card');
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 600);
    }
  });
  await page.waitForTimeout(800);
}

/* ------------------------------------------------------------------ */
/*  Walkthrough                                                        */
/* ------------------------------------------------------------------ */
test('Intro to TaskManager -- narrated walkthrough', async ({ page }) => {
  // Clear any prior localStorage so we start fresh with defaults
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  /* ---- TITLE CARD ---- */
  await showTitleCard(page, 'Intro to TaskManager', 'A guided tour of features -- and one critical bug');
  await removeTitleCard(page);

  /* ---- FEATURE: view tasks ---- */
  await page.waitForSelector('.task-item');
  await showCaption(page, 'Welcome! The app loads with 5 default tasks from localStorage.');

  /* ---- FEATURE: add a task ---- */
  await showCaption(page, 'Let\'s add a new task. Type into the input and click "Add Task".');
  const input = page.locator('.task-input');
  await input.fill('Prepare quarterly report');
  await page.waitForTimeout(1500);
  await page.locator('.add-button').click();
  await page.waitForTimeout(2000);
  await showCaption(page, 'New task added! It appears at the bottom of the list.');

  /* ---- FEATURE: mark complete ---- */
  await showCaption(page, 'Now let\'s mark a task as complete by clicking its checkbox.');
  const firstCheckbox = page.locator('.task-checkbox').first();
  await firstCheckbox.click();
  await page.waitForTimeout(2000);
  await showCaption(page, 'The task text gets a strikethrough, indicating it\'s done.');

  /* ---- FEATURE: delete a task ---- */
  await showCaption(page, 'We can also delete tasks with the "Delete" button.');
  // Delete the last task (the one we added)
  const deleteButtons = page.locator('.delete-button');
  const count = await deleteButtons.count();
  await deleteButtons.nth(count - 1).click();
  await page.waitForTimeout(2000);
  await showCaption(page, 'Task removed from the list.');

  /* ---- FEATURE: refresh ---- */
  await showCaption(page, 'The "Refresh" button reloads tasks from localStorage.');
  await page.locator('.refresh-button').click();
  await page.waitForTimeout(2000);
  await showCaption(page, 'Tasks refreshed! The list is back in sync with storage.');

  /* ---- THE TURN ---- */
  // Reset to clean state for the race condition demo
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.task-item');
  await page.waitForTimeout(1000);

  await showCaption(
    page,
    '"But what happens when a user works quickly?"',
  );

  await showCaption(
    page,
    'Let\'s reproduce the race condition from the bug report. ' +
    'We\'ll toggle a task and immediately add a new one -- before the toggle finishes saving.',
  );

  // Record initial state
  const tasksBefore = await page.locator('.task-item').count();
  const firstTaskText = await page.locator('.task-text').first().textContent();

  // Check if first task is initially uncompleted
  const wasCompleted = await page.locator('.task-text.task-completed').first().count() > 0;

  await showCaption(
    page,
    `Watch the first task: "${firstTaskText}". ` +
    `We\'ll mark it complete, then IMMEDIATELY add a new task.`,
  );

  // Toggle first task (don't await the save to finish -- work fast!)
  await page.locator('.task-checkbox').first().click();
  // Immediately type and add a new task
  await page.locator('.task-input').fill('Urgent follow-up');
  await page.locator('.add-button').click();

  // Wait for both operations to settle
  await page.waitForTimeout(3000);

  // Check what happened
  const firstTaskCompleted = await page.locator('.task-text').first().evaluate(
    el => el.classList.contains('task-completed'),
  );

  const tasksAfter = await page.locator('.task-item').count();

  if (!firstTaskCompleted) {
    await showCaption(
      page,
      'BUG REPRODUCED! The first task reverted to uncompleted. ' +
      'The add operation used a stale snapshot of state and overwrote the toggle.',
    );
  } else {
    await showCaption(
      page,
      'The toggle appears to have stuck this time -- the race is timing-dependent. ' +
      'Let\'s try again with faster actions.',
    );

    // Try again more aggressively
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.task-item');
    await page.waitForTimeout(500);

    // Rapid-fire: toggle multiple tasks and add simultaneously
    for (let i = 0; i < 3; i++) {
      await page.locator('.task-checkbox').nth(i).click({ delay: 0 });
    }
    await page.locator('.task-input').fill('Another rapid task');
    await page.locator('.add-button').click();
    await page.waitForTimeout(3000);

    await showCaption(
      page,
      'With rapid clicks, the stale-closure race condition causes earlier toggles to be overwritten. ' +
      'The root cause: each async operation captures a snapshot of state at call time.',
    );
  }

  await showCaption(
    page,
    'ROOT CAUSE: useCallback closures in useTasks.ts capture a stale "tasks" array. ' +
    'When operations overlap, the last one to resolve overwrites all previous changes.',
  );

  await showCaption(
    page,
    'The fix: use functional state updaters -- setTasks(prev => ...) -- ' +
    'so each operation builds on the latest state, not a stale snapshot.',
  );

  await showCaption(
    page,
    'End of walkthrough. Next up: automated tests that prove the bug exists.',
    8000,
  );
});
