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
      const loadedTasks = await taskService.loadTasks();
      setTasks(loadedTasks);
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

      // Use functional update to avoid stale state and get the updated tasks
      let updatedTasks: Task[];
      setTasks(currentTasks => {
        updatedTasks = [...currentTasks, newTask];
        return updatedTasks;
      });

      // Save to backend with the updated state (async but doesn't affect UI state)
      await taskService.saveTasks(updatedTasks!);
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove tasks dependency

  const toggleTask = useCallback(async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use functional update to get current state and avoid race conditions
      let updatedTasks: Task[];
      setTasks(currentTasks => {
        const taskToUpdate = currentTasks.find(task => task.id === taskId);
        if (!taskToUpdate) return currentTasks;

        // Perform the toggle operation
        updatedTasks = currentTasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } : task
        );

        return updatedTasks;
      });

      // Save to backend with the updated state (async but doesn't affect UI state)
      if (updatedTasks!) {
        await taskService.saveTasks(updatedTasks);
      }

      // Call the service for any additional processing (logging/validation)
      await taskService.updateTask(taskId, { completed: true });
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove tasks dependency

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use functional update to avoid stale state
      let updatedTasks: Task[];
      setTasks(currentTasks => {
        updatedTasks = currentTasks.filter(task => task.id !== taskId);
        return updatedTasks;
      });

      // Save to backend with the updated state (async but doesn't affect UI state)
      await taskService.saveTasks(updatedTasks!);

      // Call the service for any additional processing
      await taskService.deleteTask(taskId);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove tasks dependency

  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const refreshedTasks = await taskService.refreshTasks();
      setTasks(refreshedTasks);
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