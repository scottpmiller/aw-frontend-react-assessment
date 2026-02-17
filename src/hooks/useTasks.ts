import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { Task, TaskContextType } from '../types';

export const useTasks = (): TaskContextType => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Updates storage
  useEffect(() => {
    if (!isFetching) taskService.saveTasks(tasks)
  }, [tasks, isFetching]);

  const loadTasks = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const loadedTasks = await taskService.loadTasks();
      setTasks(loadedTasks);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(async (taskText: string) => {
    try {
      setIsAdding(true);
      setError(null);
      const newTask = await taskService.addTask(taskText);
      setTasks(tasks => [...tasks, newTask]);
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setIsAdding(false);
    }
  }, []);

  const toggleTask = useCallback(async (taskId: number, completed: boolean) => {
    try {
      // Set isToggling to true for this specific task
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isToggling: true } : task
      ));
      setError(null);
      
      const updates = await taskService.updateTask(taskId, { completed });
      
      // Update the task and set isToggling to false
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates, isToggling: false } : task
      ));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
      // Reset isToggling on error
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isToggling: false } : task
      ));
    }
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      // Set isDeleting to true for this specific task
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isDeleting: true } : task
      ));
      setError(null);
      
      await taskService.deleteTask(taskId);
      
      // Remove the task from state after successful deletion
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
      // Reset isDeleting on error
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isDeleting: false } : task
      ));
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const refreshedTasks = await taskService.refreshTasks();
      setTasks(refreshedTasks);
    } catch (err) {
      setError('Failed to refresh tasks');
      console.error('Error refreshing tasks:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    tasks,
    isFetching,
    isAdding,
    isRefreshing,
    error,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks,
    loadTasks
  };
};
