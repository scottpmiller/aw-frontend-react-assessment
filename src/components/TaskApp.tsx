import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Header, TaskForm, TaskList, LoadingIndicator } from './index';

const TaskApp = () => {
  const {
    tasks,
    isLoading,
    isAdding,
    error,
    addTask,
    toggleTask,
    deleteTask,
    refreshTasks
  } = useTaskContext();

  const handleAddTask = async (taskText: string) => {
    await addTask(taskText);
  };

  /* Determine which processing message to show based on current action */
  let processingMessage = isAdding 
    ? 'Adding task...'
    : isLoading 
      ? 'Loading tasks...' 
      : '';

  if (error) {
    return (
      <div className="app">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onRefresh={refreshTasks} />
      
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
      
      {(isLoading || isAdding) && (
        <LoadingIndicator 
          isLoading={true}
          message={processingMessage}
        />
      )}
    </div>
  );
};

export default TaskApp;