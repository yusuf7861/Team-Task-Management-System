import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi, subtasksApi, type TaskDto, type TaskStatus, type SubtaskDto } from '../services/api';

const Kanban: React.FC = () => {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await tasksApi.getMyTasks();
        // Attempt to load subtasks for each task in parallel, but tolerate failures
        const taskList: TaskDto[] = data;
        const subtaskCalls = taskList.map((t) =>
          subtasksApi.getByTask(t.id!).then((res) => ({ id: t.id, subtasks: res.data }))
        );
        const settled = await Promise.allSettled(subtaskCalls);
        const withSubtasks = taskList.map((t) => {
          const found = settled.find((s) => s.status === 'fulfilled' && (s as PromiseFulfilledResult<any>).value.id === t.id);
          const subtasks: SubtaskDto[] = found ? (found as PromiseFulfilledResult<any>).value.subtasks : [];
          return { ...t, subtasks } as TaskDto;
        });
        setTasks(withSubtasks);
      } catch (err) {
        console.error('Failed to load tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

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
          <span className="font-body-sm text-body-sm">Loading tasks...</span>
        </div>
      </div>
    );
  }

  const renderCard = (task: TaskDto) => {
    const isDone = task.status === 'DONE';
    return (
      <div key={task.id} className={`bg-on-tertiary border border-outline-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-lg p-md flex flex-col gap-3 cursor-pointer hover:border-primary/50 transition-colors group ${isDone ? 'opacity-70' : ''}`}>
        <div className="flex justify-between items-start">
          <span className={`font-label-caps text-label-caps text-outline ${isDone ? 'line-through' : ''}`}>ETH-{String(task.id).padStart(3, '0')}</span>
          {/* Move actions */}
          <div className="flex items-center gap-1">
            {task.status !== 'TODO' && (
              <button
                onClick={() => handleStatusChange(task.id!, task.status === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
                className="text-outline hover:text-primary transition-colors"
                title="Move left"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
            )}
            {task.status !== 'DONE' && (
              <button
                onClick={() => handleStatusChange(task.id!, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                className="text-outline hover:text-primary transition-colors"
                title="Move right"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            )}
          </div>
        </div>
        <Link to={`/app/tasks/${task.id}`}>
          <h4 className={`font-body-md text-body-md font-medium text-on-surface leading-tight group-hover:text-primary transition-colors ${isDone ? 'line-through text-on-surface-variant' : ''}`}>
            {task.title}
          </h4>
        </Link>
        {task.description && !isDone && (
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{task.description}</p>
        )}
        {/* Subtask summary */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-1">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="font-label-caps text-label-caps">Subtasks:</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-variant">{task.subtasks.length}</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-variant">{task.subtasks.filter(s => s.status !== 'DONE').length} open</span>
            </div>
            <div className="mt-2 space-y-1">
              {task.subtasks.slice(0,2).map((s) => (
                <div key={s.id} className="text-[12px] text-on-surface-variant truncate">• {s.title} <span className="text-[11px] text-outline">({s.status})</span></div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mt-2 pt-3 border-t border-surface-container-high">
          <div className={`flex items-center gap-xs font-label-caps text-label-caps ${isDone ? 'text-outline' : 'text-outline'}`}>
            <span className="material-symbols-outlined text-[14px]">{isDone ? 'done_all' : 'calendar_today'}</span>
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
          </div>
          {task.assignedToName && (
            <span className="font-label-caps text-label-caps text-outline">{task.assignedToName.split(' ').map(n => n[0]).join('')}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full overflow-hidden">
      {/* Board Header */}
      <div className="py-md flex justify-between items-center flex-shrink-0 border-b border-outline-variant">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Sprint Backlog</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Manage your current sprint tasks and priorities.</p>
        </div>
        <div className="flex items-center gap-md">
          <span className="font-body-sm text-body-sm text-on-surface-variant">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto py-gutter flex gap-gutter items-start bg-background min-h-0">
        {/* TODO Column */}
        <div className="flex-shrink-0 w-[320px] flex flex-col max-h-full">
          <div className="flex justify-between items-center mb-sm px-1">
            <div className="flex items-center gap-xs">
              <h3 className="font-button text-button text-on-surface uppercase tracking-wider text-xs font-semibold">TODO</h3>
              <span className="bg-surface-variant text-on-surface-variant font-label-caps text-label-caps px-1.5 py-0.5 rounded-sm">{todoTasks.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto kanban-scroll flex flex-col gap-sm pb-md border-t border-dashed border-outline-variant pt-sm min-h-0">
            {todoTasks.map(renderCard)}
            {todoTasks.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant font-body-sm opacity-50">
                <span className="material-symbols-outlined text-[24px] block mb-1">check_box</span>
                No tasks in TODO
              </div>
            )}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="flex-shrink-0 w-[320px] flex flex-col max-h-full">
          <div className="flex justify-between items-center mb-sm px-1">
            <div className="flex items-center gap-xs">
              <h3 className="font-button text-button text-secondary-container uppercase tracking-wider text-xs font-semibold flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-secondary-container"></div>
                IN PROGRESS
              </h3>
              <span className="bg-surface-variant text-on-surface-variant font-label-caps text-label-caps px-1.5 py-0.5 rounded-sm">{inProgressTasks.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto kanban-scroll flex flex-col gap-sm pb-md border-t border-dashed border-outline-variant pt-sm min-h-0">
            {inProgressTasks.map(renderCard)}
            {inProgressTasks.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant font-body-sm opacity-50">
                <span className="material-symbols-outlined text-[24px] block mb-1">hourglass_empty</span>
                No tasks in progress
              </div>
            )}
          </div>
        </div>

        {/* DONE Column */}
        <div className="flex-shrink-0 w-[320px] flex flex-col max-h-full opacity-80">
          <div className="flex justify-between items-center mb-sm px-1">
            <div className="flex items-center gap-xs">
              <h3 className="font-button text-button text-outline uppercase tracking-wider text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                DONE
              </h3>
              <span className="bg-surface-variant text-on-surface-variant font-label-caps text-label-caps px-1.5 py-0.5 rounded-sm">{doneTasks.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto kanban-scroll flex flex-col gap-sm pb-md border-t border-dashed border-outline-variant pt-sm min-h-0">
            {doneTasks.map(renderCard)}
            {doneTasks.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant font-body-sm opacity-50">
                <span className="material-symbols-outlined text-[24px] block mb-1">task_alt</span>
                No completed tasks
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kanban;
