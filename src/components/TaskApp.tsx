import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Header, TaskForm, TaskList, LoadingIndicator } from './index';

const TaskApp = () => {
  const {
    tasks,
    isFetching,
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
        isLoading={isAdding}
      />

      <TaskList
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />

      <LoadingIndicator
        isLoading={isFetching || isAdding || tasks.some(task => task.isToggling || task.isDeleting)}
        message="Loading..."
      />
    </div>
  );
};

export default TaskApp;
