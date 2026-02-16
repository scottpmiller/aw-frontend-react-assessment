# Task Management App - Architectural Analysis

## Overview
A React 18 + TypeScript single-page app for managing a to-do list. Data persists in localStorage via a service layer that simulates async API latency with artificial delays.

## Architecture

### Layer Diagram
```
App.tsx
  └─ ErrorBoundary
      └─ TaskProvider (Context)
            └─ TaskApp
                 ├─ Header (refresh button)
                 ├─ TaskForm (input + add button)
                 ├─ TaskList
                 │    └─ TaskItem[] (checkbox + delete)
                 └─ LoadingIndicator
```

### Data Flow
```
Component → useTaskContext() → useTasks hook
                                  ├─ React state (tasks, isLoading, error)
                                  └─ taskService (async ops with artificial delays)
                                        └─ storageService (localStorage wrapper)
```

### Key Files
| File | Purpose |
|------|---------|
| `src/hooks/useTasks.ts` | Core state management hook. All CRUD operations live here. **Bug epicenter.** |
| `src/services/taskService.ts` | Async service layer with artificial delays (simulates network latency). |
| `src/utils/storage.ts` | Synchronous localStorage wrapper. |
| `src/utils/delay.ts` | Random delay generators that create the race condition window. |
| `src/context/TaskContext.tsx` | React Context that exposes `useTasks` to the component tree. |
| `src/types/index.ts` | TypeScript interfaces for Task, context, and component props. |
| `src/constants/index.ts` | App config, storage keys, error messages. |

### Technology Stack
- React 18.2 with StrictMode
- TypeScript 4.7
- Create React App (react-scripts 5.0.1)
- Playwright (dev dependency for e2e testing)
- No state management library (custom hook + Context)
- No backend (localStorage only)

## Critical Design Decisions
1. **Artificial async delays** in `taskService` simulate network latency, which exposes race conditions in the state management layer.
2. **Single `isLoading` flag** gates all UI interactions -- any in-flight operation disables all inputs/buttons, but this doesn't prevent programmatic races.
3. **`useCallback` with `tasks` dependency** creates stale closures when multiple operations overlap.
