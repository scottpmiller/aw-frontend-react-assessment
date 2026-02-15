import { useState, useEffect, useCallback } from "react";
import { taskService } from "../services/taskService";
import { Task, TaskContextType } from "../types";

export const useTasks = (): TaskContextType => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<number>>(
    () => new Set()
  );
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
      setError("Failed to load tasks");
      console.error("Error loading tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(
    async (taskText: string) => {
      try {
        setIsLoading(true);
        setIsAdding(true);
        setError(null);

        const newTask = await taskService.addTask(taskText);
        let updatedTasks: Task[] = [];

        setTasks((prevTasks) => {
          updatedTasks = [...prevTasks, newTask];
          return updatedTasks;
        });
        taskService.saveTasks(updatedTasks);
      } catch (err) {
        setError("Failed to add task");
        console.error("Error adding task:", err);
      } finally {
        setIsAdding(false);
        setIsLoading(false);
      }
    },
    [tasks]
  );

  const toggleTask = useCallback(
    async (taskId: number) => {
      try {
        setError(null);
        setUpdatingTaskIds((prevIds) => {
          const nextIds = new Set(prevIds);
          nextIds.add(taskId);
          return nextIds;
        });

        const taskToUpdate = tasks.find((task) => task.id === taskId);
        if (!taskToUpdate) return;

        const updates = await taskService.updateTask(taskId, {
          ...taskToUpdate,
          completed: !taskToUpdate.completed,
        });

        let updatedTasks: Task[] = [];

        setTasks((prevTasks) => {
          updatedTasks = prevTasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          );
          return updatedTasks;
        });
        taskService.saveTasks(updatedTasks);
      } catch (err) {
        setError("Failed to update task");
        console.error("Error updating task:", err);
      } finally {
        setUpdatingTaskIds((prevIds) => {
          const nextIds = new Set(prevIds);
          nextIds.delete(taskId);
          return nextIds;
        });
      }
    },
    [tasks]
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      try {
        setError(null);
        setUpdatingTaskIds((prevIds) => {
          const nextIds = new Set(prevIds);
          nextIds.add(taskId);
          return nextIds;
        });

        await taskService.deleteTask(taskId);
        let updatedTasks: Task[] = [];

        setTasks((prevTasks) => {
          updatedTasks = prevTasks.filter((task) => task.id !== taskId);
          return updatedTasks;
        });
        taskService.saveTasks(updatedTasks);
      } catch (err) {
        setError("Failed to delete task");
        console.error("Error deleting task:", err);
      } finally {
        setUpdatingTaskIds((prevIds) => {
          const nextIds = new Set(prevIds);
          nextIds.delete(taskId);
          return nextIds;
        });
      }
    },
    [tasks]
  );

  const refreshTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const refreshedTasks = await taskService.refreshTasks();
      setTasks(refreshedTasks);
    } catch (err) {
      setError("Failed to refresh tasks");
      console.error("Error refreshing tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tasks,
    isLoading,
    isAdding,
    updatingTaskIds,
    error,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks,
    loadTasks,
  };
};
