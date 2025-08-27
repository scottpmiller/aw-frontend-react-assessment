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
      
      setTasks(currentTasks => {
        const updatedTasks = [...currentTasks, newTask];
        
        // Save to storage with the fresh task list
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
      
      setTasks(currentTasks => {
        const taskToUpdate = currentTasks.find(task => task.id === taskId);
        if (!taskToUpdate) {
          return currentTasks;
        }

        // Create updated task with new completion state
        const updatedTask = {
          ...taskToUpdate,
          completed: !taskToUpdate.completed,
          updatedAt: new Date().toISOString()
        };

        const updatedTasks = currentTasks.map(task =>
          task.id === taskId ? updatedTask : task
        );
        
        // Save to storage with fresh task list
        taskService.saveTasks(updatedTasks);
        
        // Async update service call (for any server sync later)
        taskService.updateTask(taskId, updatedTask).catch(err => {
          console.error('Error in background task update:', err);
        });
        
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
      
      setTasks(currentTasks => {
        const taskExists = currentTasks.find(task => task.id === taskId);
        if (!taskExists) {
          return currentTasks;
        }

        const updatedTasks = currentTasks.filter(task => task.id !== taskId);
        
        // Save to storage with fresh task list
        taskService.saveTasks(updatedTasks);
        
        // Async delete service call (for any server sync later)
        taskService.deleteTask(taskId).catch(err => {
          console.error('Error in background task deletion:', err);
        });
        
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