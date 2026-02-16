# Pre-Recording Setup

Steps to get a clean, ready-to-go environment before starting the assessment recording.

> **Note:** Read this file fully before running Step 1 — `git clean -fd` will delete untracked files, including this file if it's not committed.

## 1. Reset the project to clean state

Run from the project root:

```bash
git reset --hard origin/main && git clean -fd
```

## 2. Add .gitignore

The original repo doesn't include a `.gitignore`, so VS Code will show 10k+ changes from `node_modules`. Create one right after the reset, before installing anything:

```bash
printf "node_modules/\ntest-results/\nbuild/\n" > .gitignore
```

Verify VS Code shows only 2 changes (`.gitignore` and `setup.md`).

## 3. Clean install dependencies

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

Deleting `node_modules` and `package-lock.json` first avoids the npm "Exit handler never called" bug (cache clean alone isn't enough).

## 4. Verify the app runs

```bash
npm start
```

Confirm it opens at http://localhost:3000 and the task list loads. Then stop the dev server (Ctrl+C).

## 5. Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

If browser install fails, try:

```bash
npx playwright install --with-deps
```

The `@playwright/test` package must be a local dependency — the config and test files import from it. `npx playwright install` alone only installs browsers, not the npm package.

## 6. Validate Playwright works

```bash
npx playwright --version
```

Confirm it prints a version number (e.g. `1.x.x`). This verifies the CLI and browsers are installed without needing test files.

## 7. Final state check

- [ ] `git status` shows clean working tree (no untracked files except node_modules, which is gitignored)
- [ ] App runs on localhost:3000
- [ ] Playwright is installed and functional
- [ ] VS Code shows 0 source changes

## Quick Reset (if you need to start over)

Run from the project root:

```bash
git reset --hard origin/main && git clean -fd
printf "node_modules/\ntest-results/\nbuild/\n" > .gitignore
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm install --save-dev @playwright/test
npx playwright install
```
