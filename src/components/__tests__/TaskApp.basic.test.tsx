import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskApp from '../TaskApp';
import { TaskProvider } from '../../context/TaskContext';

// Mock all complex dependencies
jest.mock('../../hooks/useTasks', () => ({
  __esModule: true,
  default: () => ({
    tasks: [],
    error: null,
    loadingStates: { loadingInitial: false, toggling: new Set(), deleting: new Set(), addingTask: false },
    addTask: jest.fn(),
    toggleTask: jest.fn(),
    deleteTask: jest.fn(),
    refreshTasks: jest.fn()
  })
}));

jest.mock('../TaskForm', () => {
  return function MockTaskForm() {
    return <div data-testid="task-form">Task Form</div>;
  };
});

jest.mock('../TaskList', () => {
  return function MockTaskList() {
    return <div data-testid="task-list">Task List</div>;
  };
});

describe('TaskApp', () => {
  const renderTaskApp = () => {
    return render(
      <TaskProvider>
        <TaskApp />
      </TaskProvider>
    );
  };

  it('should render the main structure', () => {
    renderTaskApp();

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
  });

  it('should render TaskForm and TaskList components', () => {
    renderTaskApp();

    expect(screen.getByTestId('task-form')).toBeInTheDocument();
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
  });

  it('should render refresh button', () => {
    renderTaskApp();

    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });
});
