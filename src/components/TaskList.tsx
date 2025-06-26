import React from 'react';
import TaskItem from './TaskItem';
import { TaskListProps } from '../types';
import { useTaskContext } from '../context/TaskContext';

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask, onDeleteTask }) => {
  const { toggledTaskId, deletingTaskId } = useTaskContext();

  if (tasks.length === 0) {
    return (
      <div className="task-list">
        <div className="empty-state">
          <p>No tasks yet. Add one above to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          isToggling={toggledTaskId === task.id}
          isDeleting={deletingTaskId === task.id}
        />
      ))}
    </div>
  );
};

export default TaskList;