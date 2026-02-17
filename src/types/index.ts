export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  isToggling?: boolean;  // Track if this task is being toggled
  isDeleting?: boolean;  // Track if this task is being deleted
}

export interface TaskContextType {
  tasks: Task[];
  isFetching: boolean;
  isAdding: boolean;
  isRefreshing: boolean;
  error: string | null;
  addTask: (taskText: string) => Promise<void>;
  toggleTask: (taskId: number, completed: boolean) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  refreshTasks: () => Promise<void>;
  loadTasks: () => Promise<void>;
}

export interface TaskFormProps {
  onAddTask: (taskText: string) => Promise<void>;
  isLoading: boolean;
}

export interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number, completed: boolean) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: number, completed: boolean) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
}

export interface HeaderProps {
  onRefresh: () => Promise<void>;
}

export interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}
