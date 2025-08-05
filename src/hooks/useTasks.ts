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
      setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      taskService.saveTasks(updatedTasks);
      return updatedTasks;
    });
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
      
      setTasks(prevTasks => {
      const taskToUpdate = prevTasks.find(task => task.id === taskId);
      if (!taskToUpdate) return prevTasks;

      taskService.updateTask(taskId, {
        ...taskToUpdate,
        completed: !taskToUpdate.completed
      }).then(updates => {
        setTasks(currentTasks =>
          currentTasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        );
        taskService.saveTasks(
          prevTasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        );
      });

      // Optimistically update UI
      return prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
    });
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
      
      await taskService.deleteTask(taskId);
      
      setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== taskId);
      taskService.saveTasks(updatedTasks);
      return updatedTasks;
    });
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
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