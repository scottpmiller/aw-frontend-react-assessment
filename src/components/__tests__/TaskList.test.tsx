import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskList from '../TaskList';
import { Task } from '../../types';

// Mock TaskItem component
jest.mock('../TaskItem', () => {
  return function MockTaskItem({ task }: { task: Task }) {
    return <div data-testid={`task-${task.id}`}>{task.text}</div>;
  };
});

const mockTasks: Task[] = [
  { id: 1, text: 'Test task 1', completed: false, timestamp: new Date().toISOString() },
  { id: 2, text: 'Test task 2', completed: true, timestamp: new Date().toISOString() }
];

const mockProps = {
  tasks: mockTasks,
  onToggleTask: jest.fn(),
  onDeleteTask: jest.fn(),
  loadingStates: { toggling: new Set(), deleting: new Set() }
};

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all tasks', () => {
    render(<TaskList {...mockProps} />);

    expect(screen.getByTestId('task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-2')).toBeInTheDocument();
    expect(screen.getByText('Test task 1')).toBeInTheDocument();
    expect(screen.getByText('Test task 2')).toBeInTheDocument();
  });

  it('should render empty list when no tasks', () => {
    render(<TaskList {...mockProps} tasks={[]} />);

    // Should not render any task items
    expect(screen.queryByTestId('task-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('task-2')).not.toBeInTheDocument();
  });

  it('should pass correct props to TaskItem components', () => {
    render(<TaskList {...mockProps} />);

    // Both tasks should be rendered as TaskItem components
    expect(screen.getByTestId('task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-2')).toBeInTheDocument();
  });
});
