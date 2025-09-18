import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { TaskProvider, useTaskContext } from '../../context/TaskContext';

// Make async delays instant in tests
jest.mock('../../utils/delay', () => ({
  delayPatterns: {
    short: () => Promise.resolve(),
    medium: () => Promise.resolve(),
    long: () => Promise.resolve(),
    variable: () => Promise.resolve()
  }
}));

// Remove debounce by setting auto-save delay to 0 in tests
jest.mock('../../constants', () => ({
  APP_CONFIG: { AUTO_SAVE_DELAY: 0 },
  STORAGE_KEYS: { TASKS: 'tasks', USER_PREFERENCES: 'user-preferences', THEME: 'theme' }
}));

const wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <TaskProvider>{children}</TaskProvider>
);

const nextTick = () => new Promise(resolve => setTimeout(resolve, 0));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  // no-op
});

test('Add → no refresh → task present', async () => {
  const { result } = renderHook(() => useTaskContext(), { wrapper });
  await act(async () => {
    await result.current.loadTasks();
  });
  await act(async () => {
    await result.current.addTask('New Task');
  });
  // allow effect to run
  await act(async () => {
    await nextTick();
    await nextTick();
  });
  // debounce disabled via mock; no wait needed
  expect(result.current.tasks.some(t => t.text === 'New Task')).toBe(true);
});

test('Add → remount/refresh → task persists', async () => {
  const { result, unmount } = renderHook(() => useTaskContext(), { wrapper });
  await act(async () => {
    await result.current.loadTasks();
  });
  await act(async () => {
    await result.current.addTask('Persisted Task');
  });
  await act(async () => {
    await nextTick();
    await nextTick();
  });
  // debounce disabled via mock

  // simulate refresh by remounting provider
  unmount();
  const { result: result2 } = renderHook(() => useTaskContext(), { wrapper });
  await act(async () => {
    await result2.current.loadTasks();
  });
  expect(result2.current.tasks.some(t => t.text === 'Persisted Task')).toBe(true);
});

test('Toggle then Add quickly → storage matches latest after remount', async () => {
  const { result, unmount } = renderHook(() => useTaskContext(), { wrapper });
  await act(async () => {
    await result.current.loadTasks();
  });

  const firstId = result.current.tasks[0].id;

  await act(async () => {
    const p1 = result.current.toggleTask(firstId);
    const p2 = result.current.addTask('Fast Add');
    await Promise.all([p1, p2]);
  });
  await act(async () => {
    await nextTick();
    await nextTick();
  });

  // simulate refresh
  unmount();
  const { result: result2 } = renderHook(() => useTaskContext(), { wrapper });
  await act(async () => {
    await result2.current.loadTasks();
  });

  const toggled = result2.current.tasks.find(t => t.id === firstId);
  expect(toggled).toBeTruthy();
  expect(result2.current.tasks.some(t => t.text === 'Fast Add')).toBe(true);
});


