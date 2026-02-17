import { renderHook, waitFor, act } from '@testing-library/react';
import { useTasks } from '../useTasks';
import { taskService } from '../../services/taskService';
import { storageService } from '../../utils/storage';
import { Task } from '../../types';

jest.mock('../../services/taskService');
jest.mock('../../utils/storage');

describe('useTasks race conditions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (storageService.load as jest.Mock).mockReturnValue([]);
    (storageService.save as jest.Mock).mockReturnValue(true);

    (taskService.loadTasks as jest.Mock).mockResolvedValue([]);
    (taskService.saveTasks as jest.Mock).mockResolvedValue(true);
  });

  it('should add a new task', async () => {
    let addTaskCallCount = 0;

    (taskService.addTask as jest.Mock).mockImplementation(async (taskText: string) => {
      addTaskCallCount++;
      const taskId = 2000 + addTaskCallCount;

      await new Promise(resolve => setTimeout(resolve, 50));

      return {
        id: taskId,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    await act(async () => {
      await result.current.addTask('Task 1');
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].text).toContain('Task 1');
  });

  it('should add two tasks simultaneously', async () => {
    let addTaskCallCount = 0;

    (taskService.addTask as jest.Mock).mockImplementation(async (taskText: string) => {
      addTaskCallCount++;
      const taskId = 1000 + addTaskCallCount;

      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));

      const newTask: Task = {
        id: taskId,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return newTask;
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.tasks).toHaveLength(0);

    await act(async () => {
      await Promise.all([
        result.current.addTask('Task 1'),
        result.current.addTask('Task 2'),
      ]);
    });

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks.map(t => t.text)).toContain('Task 1');
    expect(result.current.tasks.map(t => t.text)).toContain('Task 2');
  });

  it('should complete/incomplete a task', async () => {
    const initialTasks: Task[] = [
      { id: 1, text: 'Task to toggle', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, text: 'Another task', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    (taskService.loadTasks as jest.Mock).mockImplementation(async () => initialTasks);

    (taskService.updateTask as jest.Mock).mockImplementation(async (taskId: number, updates: Partial<Task>) => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
    });

    expect(result.current.tasks[0].completed).toBe(false);

    await act(async () => {
      await result.current.toggleTask(1, true);
    });

    expect(result.current.tasks[0].completed).toBe(true);
    expect(result.current.tasks[1].completed).toBe(false);

    await act(async () => {
      await result.current.toggleTask(1, false);
    });

    expect(result.current.tasks[0].completed).toBe(false);
    expect(result.current.tasks[1].completed).toBe(false);
  });

  it('should complete/incomplete two tasks simultaneously', async () => {
    const initialTasks: Task[] = [
      { id: 1, text: 'First task to toggle', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, text: 'Second task to toggle', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    (taskService.loadTasks as jest.Mock).mockImplementation(async () => initialTasks);

    (taskService.updateTask as jest.Mock).mockImplementation(async (taskId: number, updates: Partial<Task>) => {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      return {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
    });

    expect(result.current.tasks[0].completed).toBe(false);
    expect(result.current.tasks[1].completed).toBe(false);

    await act(async () => {
      await Promise.all([
        result.current.toggleTask(1, true),
        result.current.toggleTask(2, true),
      ]);
    });

    expect(result.current.tasks[0].completed).toBe(true);
    expect(result.current.tasks[1].completed).toBe(true);
  });

  it('should delete a task', async () => {
    const initialTasks: Task[] = [
      { id: 1, text: 'Task to delete', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, text: 'Task to keep', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 3, text: 'Another task to keep', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    (taskService.loadTasks as jest.Mock).mockImplementation(async () => initialTasks);

    (taskService.deleteTask as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 1;
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(3);
    });

    await act(async () => {
      await result.current.deleteTask(1);
    });

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks.map(t => t.id)).toContain(2);
    expect(result.current.tasks.map(t => t.id)).toContain(3);
    expect(result.current.tasks.map(t => t.id)).not.toContain(1);
  });

  it('should delete two tasks simultaneously', async () => {
    const initialTasks: Task[] = [
      { id: 1, text: 'First task to delete', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, text: 'Second task to delete', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 3, text: 'Task to keep', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    (taskService.loadTasks as jest.Mock).mockImplementation(async () => initialTasks);

    (taskService.deleteTask as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      return 1;
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(3);
    });

    await act(async () => {
      await Promise.all([
        result.current.deleteTask(1),
        result.current.deleteTask(2),
      ]);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe(3);
  });

  it('should handle simultaneous add and complete operations', async () => {
    const initialTasks: Task[] = [
      { id: 1, text: 'Existing task', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    let addTaskCallCount = 0;

    (taskService.loadTasks as jest.Mock).mockResolvedValue(initialTasks);

    (taskService.addTask as jest.Mock).mockImplementation(async (taskText: string) => {
      addTaskCallCount++;
      const taskId = 2000 + addTaskCallCount;

      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));

      return {
        id: taskId,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    (taskService.updateTask as jest.Mock).mockImplementation(async (taskId: number, updates: Partial<Task>) => {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    await act(async () => {
      await Promise.all([
        result.current.addTask('New task'),
        result.current.toggleTask(1, true),
      ]);
    });

    expect(result.current.tasks).toHaveLength(2);

    const existingTask = result.current.tasks.find(t => t.id === 1);
    expect(existingTask).toBeDefined();
    expect(existingTask?.completed).toBe(true);

    const newTask = result.current.tasks.find(t => t.text === 'New task');
    expect(newTask).toBeDefined();
    expect(newTask?.completed).toBe(false);
  });

  it('should handle simultaneous delete and add operations', async () => {
    const initialTasks: Task[] = [
      { id: 1, text: 'Task 1', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, text: 'Task 2', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    let addTaskCallCount = 0;

    (taskService.loadTasks as jest.Mock).mockResolvedValue(initialTasks);

    (taskService.deleteTask as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return 1;
    });

    (taskService.addTask as jest.Mock).mockImplementation(async (taskText: string) => {
      addTaskCallCount++;
      const taskId = 3000 + addTaskCallCount;

      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));

      return {
        id: taskId,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
    });

    await act(async () => {
      await Promise.all([
        result.current.deleteTask(1),
        result.current.addTask('Replacement task'),
      ]);
    });

    expect(result.current.tasks).toHaveLength(2);

    expect(result.current.tasks.map(t => t.id)).toContain(2);

    expect(result.current.tasks.map(t => t.text)).toContain('Replacement task');

    expect(result.current.tasks.map(t => t.id)).not.toContain(1);
  });

  it('should handle simultaneous delete and complete operations', async () => {
    const initialTasks: Task[] = [
      { id: 1, text: 'Task to delete', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, text: 'Task to complete', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    (taskService.loadTasks as jest.Mock).mockImplementation(async () => initialTasks);

    (taskService.deleteTask as jest.Mock).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return 1;
    });

    (taskService.updateTask as jest.Mock).mockImplementation(async (taskId: number, updates: Partial<Task>) => {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
    });

    await act(async () => {
      await Promise.all([
        result.current.deleteTask(1),
        result.current.toggleTask(2, true),
      ]);
    });

    expect(result.current.tasks).toHaveLength(1);

    const remainingTask = result.current.tasks[0];
    expect(remainingTask.id).toBe(2);
    expect(remainingTask.completed).toBe(true);
    expect(result.current.tasks.map(t => t.id)).not.toContain(1);
  });

  it('should handle simultaneous add and refresh operations', async () => {
    const initialTasks: Task[] = [
      { id: 1, text: 'Existing', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    const refreshedTasks: Task[] = [
      { id: 1, text: 'Existing', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 999, text: 'Server task', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    let loadCallCount = 0;
    (taskService.loadTasks as jest.Mock).mockImplementation(async () => {
      loadCallCount++;
      if (loadCallCount === 1) {
        return initialTasks;
      }
      return refreshedTasks;
    });

    (taskService.addTask as jest.Mock).mockImplementation(async (taskText: string) => {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return {
        id: 5000,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    (taskService.refreshTasks as jest.Mock).mockImplementation(async () => refreshedTasks);

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    await act(async () => {
      await Promise.all([
        result.current.addTask('New task'),
        result.current.refreshTasks(),
      ]);
    });

    expect(result.current.tasks.length).toBeGreaterThanOrEqual(2);
    expect(result.current.tasks.length).toBeLessThanOrEqual(3);

    expect(result.current.tasks.map(t => t.id)).toContain(1);

    const hasNewTask = result.current.tasks.some(t => t.id === 5000 || t.id === 999);
    expect(hasNewTask).toBe(true);
  });
});
