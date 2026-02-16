# Backlog - Unrelated Issues

Issues discovered during analysis that are not directly related to the race condition bug. Each should be addressed in a separate PR.

## 1. `loadTasks` missing from `useEffect` dependency array
**File:** `src/hooks/useTasks.ts:12-13`
**Severity:** Low (lint warning)
**Description:** The `useEffect` that loads tasks on mount references `loadTasks` but doesn't list it in the dependency array. React's exhaustive-deps lint rule would flag this. It works in practice because `loadTasks` is stable (no dependencies that change), but it's technically incorrect.

## 2. `Date.now()` used for task IDs
**File:** `src/services/taskService.ts:57`
**Severity:** Low
**Description:** `Date.now()` can produce duplicate IDs if two tasks are created within the same millisecond. A UUID or auto-incrementing counter based on existing max ID would be safer.

## 3. `TaskForm` does not `await` `onAddTask`
**File:** `src/components/TaskForm.tsx:10`
**Severity:** Low
**Description:** `handleSubmit` calls `onAddTask(newTask.trim())` without `await`, then immediately clears the input. If `onAddTask` throws, the input has already been cleared. Should `await` the call and only clear on success, or wrap in try/catch.

## 4. Global `isLoading` blocks all interactions
**File:** `src/hooks/useTasks.ts`
**Severity:** Medium (UX)
**Description:** A single `isLoading` boolean gates all UI inputs. While one task is being toggled, the user can't type in the input or interact with other tasks. Per-task loading states would provide a better UX.

## 5. No optimistic UI updates
**Severity:** Medium (UX)
**Description:** Every operation waits for the full async delay before updating the UI. Optimistic updates (update UI immediately, roll back on failure) would make the app feel instant.

## 6. Error state renders full-page error, no recovery
**File:** `src/components/TaskApp.tsx:20-30`
**Severity:** Medium
**Description:** Any error (even a single failed toggle) replaces the entire task list with a full-page error message. The error should be shown as a dismissible toast/banner while preserving the task list.
