import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { Task, TaskContextType } from '../types';

export const useTasks = (): TaskContextType => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [toggledTaskId, setToggledTaskId] = useState<number | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
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
      setIsAdding(true);
      setError(null);

      // Add the task and get the new task object
      const newTask = await taskService.addTask(taskText);

      // Get the latest tasks after the add operation
      const latestTasks = await taskService.loadTasks();
      setTasks(latestTasks);
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setIsAdding(false);
    }
  }, []);

  const toggleTask = useCallback(async (taskId: number) => {
    try {
      setToggledTaskId(taskId);
      setError(null);

      // Get the current task to determine its new state
      const currentTasks = await taskService.loadTasks();
      const taskToUpdate = currentTasks.find(task => task.id === taskId);
      
      if (!taskToUpdate) {
        throw new Error('Task not found');
      }

      // Update the task and get the latest tasks
      const updatedTask = await taskService.updateTask(taskId, {
        completed: !taskToUpdate.completed
      });

      // Get the latest tasks after the update and apply our change
      const latestTasks = await taskService.loadTasks();
      setTasks(latestTasks.map(task =>
        task.id === taskId ? updatedTask : task
      ));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setToggledTaskId(null);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      setDeletingTaskId(taskId);
      setError(null);

      // Get the current tasks to verify the task exists
      const currentTasks = await taskService.loadTasks();
      const taskToDelete = currentTasks.find(task => task.id === taskId);
      
      if (!taskToDelete) {
        throw new Error('Task not found');
      }

      // Delete the task
      await taskService.deleteTask(taskId);
      
      // Get the latest tasks after the delete operation
      const latestTasks = await taskService.loadTasks();
      setTasks(latestTasks);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setDeletingTaskId(null);
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
    isAdding,
    toggledTaskId,
    deletingTaskId,
    error,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks,
    loadTasks
  };
};
