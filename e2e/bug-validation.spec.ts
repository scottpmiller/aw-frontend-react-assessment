import { test, expect, Page } from '@playwright/test';

/* ------------------------------------------------------------------ */
/*  Helper: caption overlay                                            */
/* ------------------------------------------------------------------ */
async function showCaption(page: Page, text: string, hold = 10_000) {
  await page.evaluate(
    ({ text }) => {
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
    { text },
  );
  await page.waitForTimeout(hold);
}

async function resetApp(page: Page) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.task-item');
  await page.waitForTimeout(500);
}

/* ================================================================== */
/*  FIX TEST 1: Toggle + Add no longer race                            */
/*                                                                      */
/*  With functional state updaters, both operations build on the       */
/*  latest state. The toggle AND the new task should both persist.     */
/* ================================================================== */
test('FIX: toggling a task then adding a new task preserves both changes', async ({ page }) => {
  await page.goto('/');
  await resetApp(page);

  await showCaption(
    page,
    'TEST 1 (FIXED): Toggle a task, then immediately add a new task. ' +
    'Both changes should now persist thanks to functional state updaters.',
  );

  const firstText = page.locator('.task-text').first();
  await expect(firstText).not.toHaveClass(/task-completed/);

  await showCaption(
    page,
    'Step 1: The first task starts as uncompleted. We pre-fill the input, ' +
    'click the checkbox, and force-submit the form concurrently.',
  );

  // Pre-fill the input
  await page.locator('.task-input').fill('Race condition task');

  // Click toggle
  await page.locator('.task-checkbox').first().click();

  // Force-enable and click the add button concurrently
  await page.evaluate(() => {
    const btn = document.querySelector('.add-button') as HTMLButtonElement;
    if (btn) {
      btn.disabled = false;
      btn.click();
    }
  });

  await showCaption(
    page,
    'Step 2: Both operations fired concurrently. Waiting for them to settle...',
  );

  await page.waitForTimeout(3000);

  const storageState = await page.evaluate(() => {
    const raw = localStorage.getItem('task-app_tasks');
    return raw ? JSON.parse(raw) : null;
  });

  const hasNewTask = storageState?.some((t: any) => t.text === 'Race condition task');
  const firstTaskToggled = storageState?.[0]?.completed === true;

  await showCaption(
    page,
    `Step 3: Checking localStorage -- new task present: ${hasNewTask}, ` +
    `first task toggled: ${firstTaskToggled}.`,
  );

  // ASSERT THE FIX: BOTH the toggle AND the new task should persist
  expect(hasNewTask).toBe(true);
  expect(firstTaskToggled).toBe(true);

  await showCaption(
    page,
    'PASSED: Both the toggle and the new task persisted. ' +
    'Functional state updaters ensure each operation builds on the latest state.',
  );
});

/* ================================================================== */
/*  FIX TEST 2: Rapid toggles all persist                              */
/*                                                                      */
/*  With functional updaters, each toggle builds on the result of the  */
/*  previous one. All 3 toggles should be reflected in storage.        */
/* ================================================================== */
test('FIX: rapid toggles on different tasks all persist correctly', async ({ page }) => {
  await page.goto('/');
  await resetApp(page);

  await showCaption(
    page,
    'TEST 2 (FIXED): Rapidly toggle 3 tasks. ' +
    'All 3 toggles should now persist thanks to functional state updaters.',
  );

  const checkboxes = page.locator('.task-checkbox');
  const initialCount = await checkboxes.count();

  await showCaption(
    page,
    `Step 1: We have ${initialCount} tasks. Firing 3 checkbox clicks simultaneously.`,
  );

  // Fire all 3 clicks in a single synchronous block
  await page.evaluate(() => {
    const boxes = document.querySelectorAll('.task-checkbox') as NodeListOf<HTMLInputElement>;
    boxes[0]?.click();
    boxes[1]?.click();
    boxes[2]?.click();
  });

  await showCaption(
    page,
    'Step 2: All 3 checkboxes clicked simultaneously. Waiting for operations to settle...',
  );

  await page.waitForTimeout(3000);

  const storageState = await page.evaluate(() => {
    const raw = localStorage.getItem('task-app_tasks');
    return raw ? JSON.parse(raw) : null;
  });

  // Default state: [false, false, true, false, false]
  // After 3 toggles: [true, true, false, false, false]
  const firstThree = storageState?.slice(0, 3);
  const toggledCount = firstThree?.filter((t: any, i: number) => {
    const defaultCompleted = i === 2;
    return t.completed !== defaultCompleted;
  }).length;

  await showCaption(
    page,
    `Step 3: Of 3 rapid toggles, ${toggledCount} persisted in localStorage.`,
  );

  // ASSERT THE FIX: all 3 toggles should persist
  expect(toggledCount).toBe(3);

  await showCaption(
    page,
    'PASSED: All 3 rapid toggles persisted. ' +
    'Each functional updater builds on the previous state, so nothing is lost.',
  );
});

/* ================================================================== */
/*  FIX TEST 3: saveTasks is now synchronous — localStorage matches   */
/*  UI the instant the state updates                                   */
/* ================================================================== */
test('FIX: saveTasks is synchronous so localStorage matches UI immediately', async ({ page }) => {
  await page.goto('/');
  await resetApp(page);

  await showCaption(
    page,
    'TEST 3 (FIXED): saveTasks is now synchronous. ' +
    'The instant the UI updates, localStorage should already match.',
  );

  await showCaption(
    page,
    'Step 1: Setting up a MutationObserver to check localStorage ' +
    'the instant the toggle is applied to the DOM.',
  );

  // Use MutationObserver to read localStorage at the exact moment the UI updates
  const storageMatchesUI = await page.evaluate(() => {
    return new Promise<boolean>((resolve) => {
      const firstText = document.querySelector('.task-text');
      if (!firstText) { resolve(false); return; }

      const observer = new MutationObserver(() => {
        observer.disconnect();
        const raw = localStorage.getItem('task-app_tasks');
        const tasks = raw ? JSON.parse(raw) : [];
        // With synchronous save, storage should already show completed=true
        resolve(tasks[0]?.completed === true);
      });

      observer.observe(firstText, { attributes: true, attributeFilter: ['class'] });
      (document.querySelector('.task-checkbox') as HTMLElement)?.click();
      setTimeout(() => { observer.disconnect(); resolve(false); }, 10000);
    });
  });

  await showCaption(
    page,
    storageMatchesUI
      ? 'Step 2: MutationObserver fired -- localStorage immediately shows completed=true. ' +
        'No delay, no stale data!'
      : 'Step 2: Unexpected -- localStorage did not match.',
  );

  // ASSERT THE FIX: localStorage matches UI the instant it updates
  expect(storageMatchesUI).toBe(true);

  await showCaption(
    page,
    'PASSED: localStorage is updated synchronously with state. ' +
    'No fire-and-forget delay means refresh always reads current data.',
  );
});
