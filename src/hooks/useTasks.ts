import { useState, useEffect, useCallback, useRef } from 'react';
import { taskService } from '../services/taskService';
import { Task, TaskContextType } from '../types';

export const useTasks = (): TaskContextType => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const operationQueue = useRef<Promise<void>>(Promise.resolve());

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
    // Queue this operation to prevent race conditions
    operationQueue.current = operationQueue.current.then(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const newTask = await taskService.addTask(taskText);

        // Use functional update to get latest state
        setTasks(currentTasks => {
          const updatedTasks = [...currentTasks, newTask];
          // Save tasks asynchronously but don't block UI
          taskService.saveTasks(updatedTasks).catch(err => {
            console.error('Error saving tasks:', err);
            setError('Failed to save task');
          });
          return updatedTasks;
        });
      } catch (err) {
        setError('Failed to add task');
        console.error('Error adding task:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return operationQueue.current;
  }, []);

  const toggleTask = useCallback(async (taskId: number) => {
    // Queue this operation to prevent race conditions
    operationQueue.current = operationQueue.current.then(async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use functional update to get latest state
        setTasks(currentTasks => {
          const taskToUpdate = currentTasks.find(task => task.id === taskId);
          if (!taskToUpdate) return currentTasks;

          const updatedTasks = currentTasks.map(task =>
            task.id === taskId ? { ...task, completed: !taskToUpdate.completed } : task
          );

          // Update task service and save asynchronously
          taskService.updateTask(taskId, {
            ...taskToUpdate,
            completed: !taskToUpdate.completed
          }).then(updates => {
            // Apply service updates and save
            setTasks(latestTasks => {
              const finalTasks = latestTasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
              );
              taskService.saveTasks(finalTasks).catch(err => {
                console.error('Error saving tasks:', err);
                setError('Failed to save task');
              });
              return finalTasks;
            });
          }).catch(err => {
            console.error('Error updating task:', err);
            setError('Failed to update task');
          });

          return updatedTasks;
        });
      } catch (err) {
        setError('Failed to update task');
        console.error('Error updating task:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return operationQueue.current;
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    // Queue this operation to prevent race conditions
    operationQueue.current = operationQueue.current.then(async () => {
      try {
        setIsLoading(true);
        setError(null);

        await taskService.deleteTask(taskId);

        // Use functional update to get latest state
        setTasks(currentTasks => {
          const updatedTasks = currentTasks.filter(task => task.id !== taskId);
          // Save tasks asynchronously but don't block UI
          taskService.saveTasks(updatedTasks).catch(err => {
            console.error('Error saving tasks:', err);
            setError('Failed to save task');
          });
          return updatedTasks;
        });
      } catch (err) {
        setError('Failed to delete task');
        console.error('Error deleting task:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return operationQueue.current;
  }, []);

  const refreshTasks = useCallback(async () => {
    // Queue this operation to prevent race conditions
    operationQueue.current = operationQueue.current.then(async () => {
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
    });

    return operationQueue.current;
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