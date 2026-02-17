import React from 'react';
import { TaskItemProps } from '../types';

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, isLoading }) => {
  const handleToggle = () => {
    onToggle(task.id, !task.completed);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  return (
    <div className="task-item">
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={handleToggle}
        disabled={isLoading}
        aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />
      <span className={`task-text ${task.completed ? 'task-completed' : ''}`}>
        {task.text}
      </span>
      <div className="task-actions">
        <button
          className="delete-button"
          onClick={handleDelete}
          disabled={isLoading}
          aria-label={`Delete task "${task.text}"`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
