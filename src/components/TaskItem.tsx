import React from 'react';
import { TaskItemProps } from '../types';
import LoadingIndicator from './LoadingIndicator';

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onDelete, 
  isToggling,
  isDeleting 
}) => {
  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  return (
    <div className={`task-item ${isDeleting ? 'task-item-deleting' : ''}`}>
      {isToggling ? (
        <div className="task-checkbox-loading">
          <LoadingIndicator size="small" />
        </div>
      ) : (
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={handleToggle}
          disabled={isToggling || isDeleting}
          aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      )}
      <span className={`task-text ${task.completed ? 'task-completed' : ''}`}>
        {task.text}
      </span>
      <div className="task-actions">
        {isDeleting ? (
          <div className="delete-button-loading">
            <LoadingIndicator size="small" />
          </div>
        ) : (
          <button
            className="delete-button"
            onClick={handleDelete}
            disabled={isToggling || isDeleting}
            aria-label={`Delete task "${task.text}"`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;