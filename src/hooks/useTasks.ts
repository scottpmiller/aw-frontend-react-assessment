import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { Task, TaskContextType } from '../types';
import { storageAnalyzer } from '../utils/storageAnalyzer';

export const useTasks = (): TaskContextType => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<boolean>(false);

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
      setStorageError(false);
      
      const newTask = await taskService.addTask(taskText);
      const updatedTasks = [...tasks, newTask];
      
      // Try to save - check if it succeeds
      const saveSuccess = await taskService.saveTasks(updatedTasks);
      
      if (saveSuccess) {
        setTasks(updatedTasks);
      } else {
        // Storage failed - assume it's a storage issue
        setStorageError(true);
        setError('Unable to save task - storage may be full');
      }
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  const toggleTask = useCallback(async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setStorageError(false);
      
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;

      const updates = await taskService.updateTask(taskId, {
        ...taskToUpdate,
        completed: !taskToUpdate.completed
      });

      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      
      // Try to save - check if it succeeds
      const saveSuccess = await taskService.saveTasks(updatedTasks);
      
      if (saveSuccess) {
        setTasks(updatedTasks);
      } else {
        // Storage failed - assume it's a storage issue
        setStorageError(true);
        setError('Unable to save changes - storage may be full');
      }
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setStorageError(false);
      
      await taskService.deleteTask(taskId);
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      
      // Try to save - check if it succeeds
      const saveSuccess = await taskService.saveTasks(updatedTasks);
      
      if (saveSuccess) {
        setTasks(updatedTasks);
      } else {
        // This is less likely to fail since we're deleting, but just in case
        setStorageError(true);
        setError('Unable to save changes');
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  const deleteCompletedTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStorageError(false);
      
      const updatedTasks = tasks.filter(task => !task.completed);
      
      // Try to save - this should free up space
      const saveSuccess = await taskService.saveTasks(updatedTasks);
      
      if (saveSuccess) {
        setTasks(updatedTasks);
      } else {
        setError('Unable to delete completed tasks');
      }
    } catch (err) {
      setError('Failed to delete completed tasks');
      console.error('Error deleting completed tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

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

  const clearStorageError = useCallback(() => {
    setStorageError(false);
    setError(null); // Clear any existing error messages
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tasks,
    isLoading,
    error,
    storageError,
    addTask,
    toggleTask,
    deleteTask,
    deleteCompletedTasks,
    refreshTasks,
    loadTasks,
    clearStorageError,
    clearError
  };
};