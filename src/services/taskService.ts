import { storageService } from '../utils/storage';
import { delayPatterns } from '../utils/delay';
import { logger } from '../utils/logger';
import { validateTaskText, sanitizeTaskText } from '../utils/validation';
import { Task } from '../types';
import { STORAGE_KEYS } from '../constants';

const STORAGE_KEY = STORAGE_KEYS.TASKS;

/**
 * Default tasks for initial app state (unchanged).
 */
const getDefaultTasks = (): Task[] => [
  { id: 1, text: 'Review marketing campaign proposal', completed: false },
  { id: 2, text: 'Schedule team meeting for next week', completed: false },
  { id: 3, text: 'Update project timeline document', completed: true },
  { id: 4, text: 'Send follow-up email to client', completed: false },
  { id: 5, text: 'Prepare presentation slides', completed: false }
];

/**
 * Monotonic numeric id — avoids same-ms collisions while keeping number type.
 */
let lastId = Date.now();
const nextId = (): number => (lastId = Math.max(lastId + 1, Date.now()));

/**
 * Serialize storage writes so commits happen in trigger order.
 * This prevents older snapshots from overwriting newer ones.
 */
let writeQ: Promise<void> = Promise.resolve();
async function saveOrdered(tasks: Task[]): Promise<void> {
  writeQ = writeQ.then(async () => {
    await delayPatterns.short(); // keep simulated latency behavior
    storageService.save(STORAGE_KEY, tasks);
  });
  return writeQ;
}

export const taskService = {
  // Load current tasks (or defaults)
  async loadTasks(): Promise<Task[]> {
    await delayPatterns.short();
    const tasks = storageService.load(STORAGE_KEY);
    if (!tasks) return getDefaultTasks();
    return tasks;
  },

  // Create a task (id + timestamps generated here)
  async addTask(rawText: string): Promise<Task> {
    await delayPatterns.short();
    const text = sanitizeTaskText(rawText);
    const validation = validateTaskText(text);
    if (!validation.isValid) {
      logger.error('Task validation failed', { error: validation.error });
      throw new Error(validation.error);
    }
    const now = new Date().toISOString();
    const task: Task = { id: nextId(), text, completed: false, createdAt: now, updatedAt: now };
    logger.info('Task created', { taskId: task.id, text: task.text });
    return task;
  },

  // Return server-ish updates that callers merge optimistically
  async updateTask(_taskId: number, _partial: Partial<Task>): Promise<Partial<Task>> {
    await delayPatterns.short();
    return { updatedAt: new Date().toISOString() };
  },

  // Delete a task
  async deleteTask(taskId: number): Promise<number> {
    await delayPatterns.short();
    return taskId;
  },

  // Refresh tasks from storage
  async refreshTasks(): Promise<Task[]> {
    await delayPatterns.short();
    return storageService.load(STORAGE_KEY) || [];
  },

  // Ordered save used by the hook
  async saveTasks(tasks: Task[]): Promise<void> {
    return saveOrdered(tasks);
  }
};