import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi, type TaskDto } from '../services/api';

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await tasksApi.getMyTasks();
        setTasks(res.data || []);
      } catch (err) {
        console.error('Failed to load tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-md text-on-surface-variant">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="font-body-sm text-body-sm">Loading your tasks...</span>
        </div>
      </div>
    );
  }

  const renderTaskCard = (task: TaskDto) => (
    <Link
      key={task.id}
      to={`/app/tasks/${task.id}`}
      className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex flex-col gap-sm hover:shadow-sm transition-shadow group"
    >
      <div className="flex items-start justify-between gap-md">
        <h4 className="font-button text-button text-on-background group-hover:text-primary transition-colors flex-1 break-words">
          {task.title}
        </h4>
      </div>
      {task.description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between gap-md pt-sm border-t border-outline-variant">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          {task.projectName || 'Unassigned Project'}
        </span>
        {task.dueDate && (
          <span className="font-label-caps text-label-caps text-outline">
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </Link>
  );

  const renderColumn = (title: string, taskList: TaskDto[]) => (
    <div className="flex-1 flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <h3 className="font-h3 text-h3 text-on-background">
          {title} <span className="font-body-md text-body-md text-on-surface-variant">({taskList.length})</span>
        </h3>
      </div>
      <div className="flex flex-col gap-sm">
        {taskList.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xl text-center">
            <span className="material-symbols-outlined text-[32px] text-outline opacity-30 block mb-sm">inbox</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">No tasks in this status</p>
          </div>
        ) : (
          taskList.map(renderTaskCard)
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-end mb-md">
        <div>
          <h1 className="font-h1 text-h1 text-on-background mb-1">My Tasks</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </header>

      {/* Board View */}
      {tasks.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-outline opacity-30 block mb-md">inbox</span>
          <p className="font-body-md text-body-md text-on-surface-variant">No tasks assigned to you yet.</p>
          <p className="font-body-sm text-body-sm text-outline mt-sm">Ask your admin to assign you some tasks!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {renderColumn('To Do', todoTasks)}
          {renderColumn('In Progress', inProgressTasks)}
          {renderColumn('Done', doneTasks)}
        </div>
      )}
    </>
  );
};

export default TaskBoard;

