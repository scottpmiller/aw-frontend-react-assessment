export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  storageError: boolean;
  addTask: (taskText: string) => Promise<void>;
  toggleTask: (taskId: number) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  deleteCompletedTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  loadTasks: () => Promise<void>;
  clearStorageError: () => void;
}

export interface TaskFormProps {
  onAddTask: (taskText: string) => Promise<void>;
  isLoading: boolean;
}

export interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  isLoading: boolean;
}

export interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: number) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  isLoading: boolean;
}

export interface HeaderProps {
  onRefresh: () => Promise<void>;
  onDeleteCompleted: () => Promise<void>;
  completedCount: number;
  isLoading: boolean;
}

export interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}

export interface StorageItem {
  key: string;
  size: number;
  sizeFormatted: string;
}

export interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStorageCleared: () => void;
}

export interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  storageError: boolean;
  addTask: (taskText: string) => Promise<void>;
  toggleTask: (taskId: number) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  deleteCompletedTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  loadTasks: () => Promise<void>;
  clearStorageError: () => void;
  clearError: () => void;  // ← Add this line
}