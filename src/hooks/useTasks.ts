import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { Task, TaskContextType } from '../types';

export const useTasks = (): TaskContextType => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(async (taskText: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const newTask = await taskService.addTask(taskText);

      setTasks(prev => {
        const updatedTasks = [...prev, newTask];
        taskService.saveTasks(updatedTasks);
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
          task.id === taskId
            ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
            : task
        );
        taskService.saveTasks(updatedTasks);
        return updatedTasks;
      });
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
        taskService.saveTasks(updatedTasks);
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
