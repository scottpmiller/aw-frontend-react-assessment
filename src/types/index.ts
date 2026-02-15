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
  isAdding: boolean;
  updatingTaskIds: Set<number>;
  error: string | null;
  addTask: (taskText: string) => Promise<void>;
  toggleTask: (taskId: number) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  refreshTasks: () => Promise<void>;
  loadTasks: () => Promise<void>;
}

export interface TaskFormProps {
  onAddTask: (taskText: string) => Promise<void>;
  isAdding: boolean;
}

export interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  isUpdating: boolean;
}

export interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: number) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  updatingTaskIds: Set<number>;
}

export interface HeaderProps {
  onRefresh: () => Promise<void>;
}

export interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}
