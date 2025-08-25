import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Header, TaskForm, TaskList, LoadingIndicator } from './index';
import StorageModal from './StorageModal';

const TaskApp = () => {
  const {
    tasks,
    isLoading,
    error,
    storageError,
    addTask,
    toggleTask,
    deleteTask,
    deleteCompletedTasks,
    refreshTasks,
    clearStorageError,
    clearError
  } = useTaskContext();

  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleAddTask = async (taskText: string) => {
    await addTask(taskText);
  };

  const handleOpenStorageModal = () => {
    setIsStorageModalOpen(true);
  };

  const handleCloseStorageModal = () => {
    setIsStorageModalOpen(false);
  };

  const handleStorageCleared = () => {
    // Storage was cleared, clear the error and show success
    clearStorageError();
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // Calculate completed tasks count
  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="app">
      <Header 
        onRefresh={refreshTasks}
        onDeleteCompleted={deleteCompletedTasks}
        completedCount={completedCount}
        isLoading={isLoading}
      />
      
      {showSuccessMessage && (
        <div className="storage-success-alert">
          <div className="alert-content">
            <span className="alert-icon">✅</span>
            <span className="alert-message">
              Storage cleared successfully! You can now continue working.
            </span>
            <button 
              className="dismiss-button"
              onClick={() => setShowSuccessMessage(false)}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-alert">
          <div className="alert-content">
            <span className="alert-icon">❌</span>
            <span className="alert-message">
              {error}
            </span>
            {storageError && (
              <button 
                className="review-button"
                onClick={handleOpenStorageModal}
                aria-label="Review and delete storage items"
              >
                Review
              </button>
            )}
            <button 
              className="dismiss-button"
              onClick={clearError}
              aria-label="Dismiss error message"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <TaskForm 
        onAddTask={handleAddTask}
        isLoading={isLoading}
      />
      
      <TaskList
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
        isLoading={isLoading}
      />
      
      <LoadingIndicator 
        isLoading={isLoading}
        message="Processing..."
      />

      <StorageModal
        isOpen={isStorageModalOpen}
        onClose={handleCloseStorageModal}
        onStorageCleared={handleStorageCleared}
      />
    </div>
  );
};

export default TaskApp;