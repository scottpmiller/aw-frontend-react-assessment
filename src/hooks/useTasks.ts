import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { Task, TaskContextType } from '../types';

export const useTasks = (): TaskContextType => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loaded = await taskService.loadTasks();
      setTasks(Array.isArray(loaded) ? loaded : []);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(async (taskText: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const newTask = await taskService.addTask(taskText);

      // Functional update to avoid stale-closure races
      let next: Task[] = [];
      setTasks(prev => {
        next = [...prev, newTask];
        return next;
      });

      // Persist exactly what we rendered (ordered under the hood)
      await taskService.saveTasks(next);
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // no [tasks]

  const toggleTask = useCallback(async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Service can provide server-ish updates (e.g., updatedAt)
      const updates = await taskService.updateTask(taskId, {});

      let next: Task[] = [];
      setTasks(prev => {
        next = prev.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed, ...updates } : t
        );
        return next;
      });

      await taskService.saveTasks(next);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // no [tasks]

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      await taskService.deleteTask(taskId);

      let next: Task[] = [];
      setTasks(prev => {
        next = prev.filter(t => t.id !== taskId);
        return next;
      });

      await taskService.saveTasks(next);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // no [tasks]

  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fromStore = await taskService.refreshTasks();
      // Preserve current UX: refresh hard-replaces the list
      setTasks(Array.isArray(fromStore) ? fromStore : []);
    } catch (err) {
      setError('Failed to refresh tasks');
      console.error('Error refreshing tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks,
    loadTasks
  };
};