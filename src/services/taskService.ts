import { storageService } from '../utils/storage';
import { delayPatterns } from '../utils/delay';
import { logger } from '../utils/logger';
import { validateTaskText, sanitizeTaskText } from '../utils/validation';
import { Task } from '../types';
import { STORAGE_KEYS } from '../constants';

const STORAGE_KEY = STORAGE_KEYS.TASKS;

// Default tasks for initial app state
const getDefaultTasks = (): Task[] => [
  { id: 1, text: 'Review marketing campaign proposal', completed: false },
  { id: 2, text: 'Schedule team meeting for next week', completed: false },
  { id: 3, text: 'Update project timeline document', completed: true },
  { id: 4, text: 'Send follow-up email to client', completed: false },
  { id: 5, text: 'Prepare presentation slides', completed: false }
];

export const taskService = {
  // Load tasks from storage
  async loadTasks(): Promise<Task[]> {
    await delayPatterns.short();
    
    let tasks = storageService.load(STORAGE_KEY);
    
    if (!tasks) {
      // Check for legacy tasks without timezone key
      tasks = storageService.loadLegacy(STORAGE_KEY);
      
      if (!tasks) {
        tasks = getDefaultTasks();
        storageService.save(STORAGE_KEY, tasks);
      }
    }
    
    return tasks;
  },

  // Save tasks to storage
  async saveTasks(tasks: Task[]): Promise<boolean> {
    await delayPatterns.short();
    return storageService.save(STORAGE_KEY, tasks);
  },

  // Add a new task
  async addTask(taskText: string): Promise<Task> {
    // Validate the task text first
    const validation = validateTaskText(taskText);
    if (!validation.isValid) {
      logger.warn('Task validation failed', { taskText, error: validation.error });
      throw new Error(validation.error);
    }

    // Load current tasks before we start
    const currentTasks = await this.loadTasks();

    // Apply artificial delay
    await delayPatterns.medium();
    
    // After the delay, reload tasks to get any changes that happened during the delay
    const latestTasks = await this.loadTasks();
    
    // Create the new task
    const sanitizedText = sanitizeTaskText(taskText);
    const newTask = {
      id: Date.now(),
      text: sanitizedText,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add the new task to the latest task list
    const updatedTasks = [...latestTasks, newTask];
    
    // Save the updated tasks
    await this.saveTasks(updatedTasks);
    
    logger.info('Task created', { taskId: newTask.id, text: sanitizedText });
    return newTask;
  },

  // Update an existing task
  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task> {
    // Load current tasks to get the task to update
    const currentTasks = await this.loadTasks();
    const taskToUpdate = currentTasks.find(task => task.id === taskId);

    if (!taskToUpdate) {
      throw new Error('Task not found');
    }

    // Apply artificial delay
    await delayPatterns.medium();

    // After the delay, reload tasks to get any changes that happened during the delay
    const latestTasks = await this.loadTasks();
    
    // Create the updated task
    const updatedTask = {
      ...taskToUpdate,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Update the task in the latest task list
    const updatedTasks = latestTasks.map(task =>
      task.id === taskId ? updatedTask : task
    );

    // Save the updated tasks
    await this.saveTasks(updatedTasks);

    return updatedTask;
  },

  // Delete a task
  async deleteTask(taskId: number): Promise<void> {
    // Load current tasks to verify the task exists
    const currentTasks = await this.loadTasks();
    const taskToDelete = currentTasks.find(task => task.id === taskId);

    if (!taskToDelete) {
      throw new Error('Task not found');
    }

    // Apply artificial delay
    await delayPatterns.short();

    // After the delay, reload tasks to get any changes that happened during the delay
    const latestTasks = await this.loadTasks();
    
    // Remove the task from the latest task list
    const updatedTasks = latestTasks.filter(task => task.id !== taskId);

    // Save the updated tasks
    await this.saveTasks(updatedTasks);
    logger.info('Task deleted', { taskId });
  },

  // Refresh tasks from storage
  async refreshTasks(): Promise<Task[]> {
    await delayPatterns.short();
    return storageService.load(STORAGE_KEY) || [];
  }
};