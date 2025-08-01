import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { Task, TaskContextType } from '../types';

let taskQueue = Promise.resolve();

export const useTasks = (): TaskContextType => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

	const [isQueueBusy, setIsQueueBusy] = useState(false);
	const isBusy = isLoading || isQueueBusy;

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

	const addTask = useCallback((taskText: string) => {
		taskQueue = taskQueue.then(async () => {
			setIsQueueBusy(true);
			setIsLoading(true);
			setError(null);
			try {
				const newTask = await taskService.addTask(taskText);
				setTasks(prev => {
					const updatedTasks = [...prev, newTask];
					taskService.saveTasks(updatedTasks);
					return updatedTasks;
				});
			} catch (err) {
				console.error('Error adding task:', err);
				setError('Failed to add task');
			} finally {
				setIsLoading(false);
				setIsQueueBusy(false);
			}
		});

		return taskQueue;
	}, []);

	const toggleTask = useCallback((taskId: number) => {
		taskQueue = taskQueue.then(async () => {
			setIsQueueBusy(true);
			setIsLoading(true);
			setError(null);
			try {
				setTasks(prev => {
					const taskToUpdate = prev.find(t => t.id === taskId);
					if (!taskToUpdate) return prev;

					const updatedTask = {
						...taskToUpdate,
						completed: !taskToUpdate.completed,
						updatedAt: new Date().toISOString()
					};

					const updatedTasks = prev.map(t => t.id === taskId ? updatedTask : t);
					taskService.saveTasks(updatedTasks);
					return updatedTasks;
				});
			} catch (err) {
				console.error('Error toggling task:', err);
				setError('Failed to update task');
			} finally {
				setIsLoading(false);
				setIsQueueBusy(false);
			}
		});

		return taskQueue;
	}, []);

	const deleteTask = useCallback((taskId: number) => {
		taskQueue = taskQueue.then(async () => {
			setIsQueueBusy(true);
			setIsLoading(true);
			setError(null);
			try {
				await taskService.deleteTask(taskId);
				setTasks(prev => {
					const updatedTasks = prev.filter(t => t.id !== taskId);
					taskService.saveTasks(updatedTasks);
					return updatedTasks;
				});
			} catch (err) {
				console.error('Error deleting task:', err);
				setError('Failed to delete task');
			} finally {
				setIsLoading(false);
				setIsQueueBusy(false);
			}
		});

		return taskQueue;
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
    loadTasks,
	isBusy
  };
};