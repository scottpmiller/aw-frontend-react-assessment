# Root Cause Analysis & Fix Plan

## Bug Report Summary
Users report tasks "randomly disappearing and reappearing" when working quickly. Completing a task then immediately adding a new one causes the completed task to revert. Tasks may also duplicate or vanish.

## Root Cause: Stale Closures + Race Conditions in `useTasks.ts`

### The Mechanism

Every mutation (`addTask`, `toggleTask`, `deleteTask`) in `useTasks.ts` follows this pattern:

```ts
const addTask = useCallback(async (taskText: string) => {
  const newTask = await taskService.addTask(taskText);   // async delay (50-350ms)
  const updatedTasks = [...tasks, newTask];               // uses CLOSURE `tasks`
  setTasks(updatedTasks);                                 // overwrites state
  taskService.saveTasks(updatedTasks);                    // fire-and-forget save
}, [tasks]);
```

**Problem 1 -- Stale closure reads:** Each callback closes over the `tasks` array at creation time. When two operations overlap (e.g., toggle then add), the second operation reads the **pre-toggle** snapshot of `tasks`, so when it calls `setTasks`, it **overwrites** the toggle.

**Race timeline:**
```
t=0ms    User toggles task 3       → toggleTask captures tasks=[1,2,3,4,5]
t=5ms    User adds "New task"      → addTask captures SAME tasks=[1,2,3,4,5]
t=200ms  toggleTask resolves       → setTasks([1,2,3toggled,4,5]) ✓
t=300ms  addTask resolves          → setTasks([1,2,3NOT-toggled,4,5,6]) ← OVERWRITES toggle
```

**Problem 2 -- Fire-and-forget saves:** `taskService.saveTasks()` is called without `await`. The save has its own async delay, so localStorage may be written out-of-order. A subsequent `refreshTasks()` reads stale data from localStorage.

**Problem 3 -- State/storage divergence:** Because saves are not awaited and reads come from closure snapshots, the React state and localStorage can diverge. A refresh after a race reads stale localStorage, compounding the problem.

### Affected Functions (all in `src/hooks/useTasks.ts`)
- `addTask` (lines 29-45) -- reads stale `tasks` from closure
- `toggleTask` (lines 47-72) -- reads stale `tasks` from closure
- `deleteTask` (lines 74-90) -- reads stale `tasks` from closure

## Fix Plan

### Fix 1: Use functional state updaters
Replace direct `tasks` closure reads with `setTasks(prev => ...)` so each operation works against the **latest** state:

```ts
// BEFORE (broken):
const updatedTasks = [...tasks, newTask];
setTasks(updatedTasks);

// AFTER (fixed):
setTasks(prev => {
  const updatedTasks = [...prev, newTask];
  taskService.saveTasks(updatedTasks);
  return updatedTasks;
});
```

### Fix 2: Synchronize saves inside the updater
Move `saveTasks` into the functional updater callback so it always saves the exact state that React will render. Remove `await` from `saveTasks` or make it synchronous for localStorage (no network).

### Fix 3: Remove `tasks` from `useCallback` dependency arrays
After switching to functional updaters, the callbacks no longer close over `tasks`, so remove it from the dependency arrays to prevent unnecessary re-creation.

### Fix 4: Make `saveTasks` synchronous in the storage layer
Since we're writing to localStorage (not a real API), the artificial delay in `saveTasks` serves no purpose and creates a window for inconsistency. Make the save path synchronous while keeping the read/create delays for realism.

### Files to Modify
1. `src/hooks/useTasks.ts` -- main fixes (functional updaters, sync saves, dependency arrays)
2. `src/services/taskService.ts` -- make `saveTasks` synchronous (remove artificial delay)
