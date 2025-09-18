import { useState, useEffect, useCallback, useRef } from 'react';
import { APP_CONFIG } from '../constants';
import { taskService } from '../services/taskService';
import { Task, TaskContextType } from '../types';

export const useTasks = (): TaskContextType => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const hydratedRef = useRef<boolean>(false);

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
      hydratedRef.current = true;
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
      setTasks(prev => {
        const updatedTasks = [...prev, newTask];
        // Ensure immediate persistence for critical operations
        if (hydratedRef.current) {
          taskService.saveTasks(updatedTasks);
        }
        return updatedTasks;
      });
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleTask = useCallback(async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      setTasks(prev => {
        const taskToUpdate = prev.find(task => task.id === taskId);
        if (!taskToUpdate) return prev;
        const updatedTasks = prev.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        // Ensure immediate persistence for critical operations
        if (hydratedRef.current) {
          taskService.saveTasks(updatedTasks);
        }
        return updatedTasks;
      });
      // Update metadata asynchronously (e.g., updatedAt)
      await taskService.updateTask(taskId, {});
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await taskService.deleteTask(taskId);
      setTasks(prev => {
        const updatedTasks = prev.filter(task => task.id !== taskId);
        // Ensure immediate persistence for critical operations
        if (hydratedRef.current) {
          taskService.saveTasks(updatedTasks);
        }
        return updatedTasks;
      });
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const refreshedTasks = await taskService.refreshTasks();
      setTasks(refreshedTasks);
      hydratedRef.current = true;
    } catch (err) {
      setError('Failed to refresh tasks');
      console.error('Error refreshing tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist tasks when state changes after hydration (debounced)
  useEffect(() => {
    if (!hydratedRef.current) return;
    const handle = setTimeout(() => {
      taskService.saveTasks(tasks);
    }, APP_CONFIG.AUTO_SAVE_DELAY);
    return () => clearTimeout(handle);
  }, [tasks]);

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