import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tasksApi, subtasksApi, type TaskDto, type TaskStatus } from '../services/api';

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  TODO: { label: 'To Do', bg: 'bg-surface-container', text: 'text-on-surface-variant', dot: 'bg-outline' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  DONE: { label: 'Done', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
};

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskStatusError, setTaskStatusError] = useState('');
  const [subtaskStatusError, setSubtaskStatusError] = useState('');
  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (!id) {
          setError('Task id missing');
          return;
        }
        const { data } = await tasksApi.getById(Number(id));
        setTask(data);
      } catch (err) {
        console.error('Failed to load task', err);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task?.id) return;

    if (newStatus === 'DONE' && task.subtasks?.some((subtask) => subtask.status !== 'DONE')) {
      setTaskStatusError('Complete all subtasks before marking the task as done.');
      return;
    }

    try {
      const { data } = await tasksApi.updateStatus(task.id, newStatus);
      setTask(data);
      setTaskStatusError('');
    } catch (err) {
      console.error('Failed to update status', err);
      setTaskStatusError('Unable to update task status right now.');
    }
  };

  const handleSubtaskStatusChange = async (subtaskId: number, newStatus: TaskStatus) => {
    try {
      const { data } = await subtasksApi.updateStatus(subtaskId, newStatus);
      setTask((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtasks: prev.subtasks?.map((subtask) => (subtask.id === subtaskId ? data : subtask)),
        };
      });
      setSubtaskStatusError('');
    } catch (err) {
      console.error('Failed to update subtask status', err);
      setSubtaskStatusError('You can only update subtasks assigned to you or created by you.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-md text-on-surface-variant">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-body-sm text-body-sm">Loading task...</span>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-md text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] opacity-40">error_outline</span>
        <p className="font-body-md text-body-md">{error || 'Task not found'}</p>
        <button onClick={() => navigate('/app/tasks')} className="text-primary font-button text-button hover:underline">
          Back to Tasks
        </button>
      </div>
    );
  }

  const status = statusConfig[task.status];
  const canMarkTaskDone = !task.subtasks || task.subtasks.every((subtask) => subtask.status === 'DONE');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-outline mb-8 font-body-sm overflow-x-auto whitespace-nowrap pb-2">
        <Link className="hover:text-primary transition-colors flex items-center gap-1" to="/app/projects">
          <span className="material-symbols-outlined text-[18px]">folder</span>
          Projects
        </Link>
        <span className="material-symbols-outlined text-[16px] opacity-40">chevron_right</span>
        <span className="hover:text-primary transition-colors cursor-pointer">{task.projectName || 'Project'}</span>
        <span className="material-symbols-outlined text-[16px] opacity-40">chevron_right</span>
        <span className="text-on-background font-medium">ETH-{String(task.id).padStart(3, '0')}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Task Title & Header */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="font-label-caps text-label-caps bg-secondary-container text-secondary px-3 py-1 rounded-full font-bold">
                  ETH-{String(task.id).padStart(3, '0')}
                </span>
                <span className="text-outline font-body-sm">•</span>
                <span className="text-outline font-body-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 flex items-center justify-center text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
                <button className="w-9 h-9 flex items-center justify-center text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            </div>

            <h1 className="font-h1 text-h2 sm:text-h1 text-on-background leading-tight mb-8">
              {task.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-outline-variant">
              <div className="space-y-1.5">
                <label className="font-label-caps text-label-caps text-outline block">Status</label>
                <div className="relative group">
                  <div className={`flex items-center gap-2 ${status.bg} ${status.text} px-4 py-2 rounded-xl border border-current/10 font-button cursor-pointer hover:shadow-md transition-all`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`}></div>
                    {status.label}
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </div>
                  <div className="absolute top-full left-0 mt-2 bg-white border border-outline-variant rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[180px] p-1">
                    {(Object.keys(statusConfig) as TaskStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={s === 'DONE' && !canMarkTaskDone}
                        className={`w-full text-left px-3 py-2.5 font-body-sm rounded-lg hover:bg-surface-container flex items-center gap-3 transition-colors ${task.status === s ? 'bg-primary/5 font-bold text-primary' : ''} ${s === 'DONE' && !canMarkTaskDone ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[s].dot}`}></div>
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {taskStatusError && (
              <div className="mt-4 p-3 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <p className="text-sm">{taskStatusError}</p>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-h3 text-h3 text-on-background mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">description</span>
              Description
            </h3>
            <div className="prose prose-blue max-w-none text-on-surface-variant font-body-md leading-relaxed">
              {task.description ? (
                <p>{task.description}</p>
              ) : (
                <p className="text-outline italic">No description provided.</p>
              )}
            </div>

            {/* Subtasks Section */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-12 pt-8 border-t border-outline-variant">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-h3 text-h3 text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">checklist</span>
                    Subtasks
                    <span className="text-outline font-body-sm bg-surface-container px-2 py-0.5 rounded-full">{task.subtasks.length}</span>
                  </h4>
                </div>
                {subtaskStatusError && (
                  <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {subtaskStatusError}
                  </div>
                )}
                <div className="space-y-4">
                  {task.subtasks.map((sub) => {
                    const subStatus = statusConfig[sub.status];
                    return (
                      <div key={sub.id} className="bg-background border border-outline-variant rounded-xl p-5 hover:border-primary/30 transition-all group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h5 className="font-button text-on-background group-hover:text-primary transition-colors">
                              {sub.title}
                            </h5>
                            {sub.description && (
                              <p className="text-on-surface-variant text-sm line-clamp-1">{sub.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <div className={`flex items-center gap-1.5 ${subStatus.bg} ${subStatus.text} px-2.5 py-1 rounded-full text-[11px] font-label-caps border border-current/10`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${subStatus.dot}`}></div>
                              {subStatus.label}
                            </div>
                            <select
                              value={sub.status}
                              onChange={(e) => handleSubtaskStatusChange(sub.id, e.target.value as TaskStatus)}
                              className="bg-surface-container border-none rounded-lg px-2 py-1 text-[12px] font-medium text-on-surface focus:ring-2 focus:ring-primary/20 cursor-pointer"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Metadata */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm sticky top-8">
            <h4 className="font-label-caps text-label-caps text-outline mb-6 uppercase tracking-widest">Properties</h4>

            <div className="space-y-6">
              {/* Assignee */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Assignee</label>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-container/50">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                    {(task.assignedToName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-button text-on-background truncate">{task.assignedToName || 'Unassigned'}</div>
                    <div className="text-[10px] text-outline truncate">{task.assignedToId ? 'Member' : 'No assignee'}</div>
                  </div>
                </div>
              </div>

              {/* Reporter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Reporter</label>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-container/30">
                  <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
                    {(task.createdByName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-button text-on-background truncate">{task.createdByName || 'Unknown'}</div>
                    <div className="text-[10px] text-outline truncate">Reporter</div>
                  </div>
                </div>
              </div>

              <hr className="border-outline-variant opacity-50" />

              {/* Details List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-outline flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    Due Date
                  </span>
                  <span className="font-button text-on-background text-[13px]">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-outline flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                    Project
                  </span>
                  <span className="font-button text-primary text-[13px] hover:underline cursor-pointer">
                    {task.projectName || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-outline flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">history</span>
                    Last Updated
                  </span>
                  <span className="font-button text-on-background text-[13px]">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TaskDetails;
