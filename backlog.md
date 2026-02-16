# Backlog - Bugs Unrelated to the Race Condition

Each should be addressed in a separate PR.

## 1. Silent data loss: `saveTasks` return value ignored
**File:** `src/hooks/useTasks.ts:38, 63, 83`
**Severity:** High
**Bug:** `taskService.saveTasks()` returns `false` on localStorage quota errors or write failures. The return value is discarded in all three mutation callbacks (`addTask`, `toggleTask`, `deleteTask`). The user sees the change in the UI, but on next page load it's gone with no warning.

## 2. Any error replaces the entire app with a dead-end screen
**File:** `src/components/TaskApp.tsx:20-30`
**Severity:** High
**Bug:** When `error` is truthy (e.g., a failed refresh), the entire task list is replaced with a full-page error screen. The only recovery is `window.location.reload()`. The user cannot interact with the app to clear the error -- `addTask`/`toggleTask`/`deleteTask` all call `setError(null)` at the start, but the UI to trigger those operations is hidden behind the error screen.

## 3. `TaskForm` clears input before `onAddTask` resolves
**File:** `src/components/TaskForm.tsx:7-13`
**Severity:** Medium
**Bug:** `handleSubmit` calls `onAddTask(newTask.trim())` without `await`, then immediately calls `setNewTask('')`. If the add fails (e.g., validation rejects it), the user's typed text is already gone. The input should only clear on success.

## 4. Validation error messages swallowed by generic catch
**File:** `src/hooks/useTasks.ts:41-43`
**Severity:** Medium
**Bug:** `taskService.addTask()` throws with a specific validation message (e.g., "Task description cannot be empty."). The catch block in `useTasks.addTask` replaces it with the generic string `'Failed to add task'`. The `ERROR_MESSAGES` constants for validation are effectively dead code.

## 5. Legacy storage migration never re-saves under the new key
**File:** `src/services/taskService.ts:26-34`
**Severity:** Medium
**Bug:** When `storageService.load(STORAGE_KEY)` returns `null` and `storageService.loadLegacy(STORAGE_KEY)` finds data, the legacy data is returned but never re-saved under the prefixed key (`task-app_tasks`). Every subsequent app load re-traverses the legacy path. If the user modifies tasks (saved under the new key) and those changes are later lost, the app falls back to stale legacy data.

## 6. `ErrorBoundary.getDerivedStateFromError` doesn't set the `error` field
**File:** `src/components/ErrorBoundary.tsx:19-21`
**Severity:** Medium
**Bug:** `getDerivedStateFromError` returns `{ hasError: true }` but does not include the `error` object. The `error` is only set later in `componentDidCatch` via `setState`. This causes the first render of the error UI to have `this.state.error === null`, so the error details pane renders blank. A second render follows when `componentDidCatch` sets the error, which is wasteful.

## 7. Logger suppresses `ERROR`-level logs in production
**File:** `src/utils/logger.ts:18-20`
**Severity:** Medium
**Bug:** `shouldLog()` returns `this.isDevelopment && level >= this.level`. In production, `isDevelopment` is `false`, so the `&&` short-circuits and no logs are emitted -- not even `ERROR`. The entire Logger class is a no-op outside of development.

## 8. `Date.now()` used for task IDs can produce duplicates
**File:** `src/services/taskService.ts:57`
**Severity:** Medium
**Bug:** `Date.now()` returns the same value if two tasks are created within the same millisecond. This produces duplicate IDs, which breaks `toggleTask` (toggles both) and `deleteTask` (deletes both). A UUID or max-ID+1 counter would be safer.

## 9. `isValidId` is dead code; invalid IDs silently no-op
**File:** `src/utils/validation.ts:32-34`, `src/hooks/useTasks.ts:49-92`
**Severity:** Medium
**Bug:** `isValidId` is exported but never imported or called anywhere. If `NaN`, `0`, `-1`, or a non-number is passed to `toggleTask`, `.find()` returns `undefined` and the function returns `prev` unchanged -- silently doing nothing while the loading spinner flashes. For `deleteTask`, `.filter(t => t.id !== NaN)` keeps all tasks (since `NaN !== NaN`), so nothing is deleted.

## 10. `taskService.updateTask` is now dead code
**File:** `src/services/taskService.ts:68-76`
**Severity:** Low
**Bug:** After the race-condition fix, `toggleTask` computes the toggle inline via the functional updater. `taskService.updateTask()` is no longer called anywhere in the codebase. It should be removed or `toggleTask` should call it for consistency with the service layer.

## 11. Storage test mock has incorrect `getItem` for falsy values
**File:** `src/utils/__tests__/storage.test.ts:7-9`
**Severity:** Low
**Bug:** The mock uses `store[key] || null`. The `||` operator returns `null` for falsy stored values (e.g., empty string `""`). The real `localStorage.getItem` only returns `null` when the key doesn't exist. Should use `store.hasOwnProperty(key) ? store[key] : null`.
