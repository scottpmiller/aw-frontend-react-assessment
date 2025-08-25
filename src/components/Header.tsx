import React from 'react';
import { HeaderProps } from '../types';

const Header: React.FC<HeaderProps> = ({ 
  onRefresh, 
  onDeleteCompleted, 
  completedCount, 
  isLoading 
}) => {
  const handleDeleteCompleted = () => {
    if (completedCount === 0) return;
    
    const confirmMessage = `Are you sure you want to delete all ${completedCount} completed task${completedCount === 1 ? '' : 's'}?`;
    
    if (window.confirm(confirmMessage)) {
      onDeleteCompleted();
    }
  };

  return (
    <div className="header">
      <h1>Task Management App</h1>
      <p>Manage your daily tasks efficiently</p>
      <div className="header-actions">
        <button 
          onClick={onRefresh} 
          className="refresh-button"
          disabled={isLoading}
          aria-label="Refresh tasks from storage"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
          onClick={handleDeleteCompleted}
          className="delete-completed-button"
          disabled={isLoading || completedCount === 0}
          aria-label={`Delete ${completedCount} completed tasks`}
        >
          Delete All Completed ({completedCount})
        </button>
      </div>
    </div>
  );
};

export default Header;