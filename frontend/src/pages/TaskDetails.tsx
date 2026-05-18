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
    <div className="w-full h-full px-6 py-6 animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-outline mb-4 text-sm">
        <Link className="hover:text-primary transition-colors flex items-center gap-1" to="/app/projects">
          Projects
        </Link>
        <span className="material-symbols-outlined text-[16px] opacity-50">chevron_right</span>
        <span className="hover:text-primary transition-colors cursor-pointer">{task.projectName || 'Unassigned Project'}</span>
        <span className="material-symbols-outlined text-[16px] opacity-50">chevron_right</span>
        <span className="text-on-background font-medium">#{task.id}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-on-background leading-tight">
              {task.title}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-outline">
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">attachment</span>
                Attach
              </button>
              <span className="opacity-30">|</span>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                Create Subtask
              </button>
              <span className="opacity-30">|</span>
              <button className="flex items-center gap-1 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">link</span>
                Link issue
              </button>
            </div>
          </div>

          {taskStatusError && (
            <div className="p-3 bg-error-container text-on-error-container rounded-md flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <p>{taskStatusError}</p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-medium text-on-background text-base">Description</h3>
            <div className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
              {task.description ? (
                <p>{task.description}</p>
              ) : (
                <p className="text-outline italic">No description provided. Click to add one...</p>
              )}
            </div>
          </div>

          {/* Subtasks Section */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="font-medium text-on-background text-base flex items-center gap-2">
                Subtasks
                <span className="bg-surface-container text-on-surface text-xs px-2 py-0.5 rounded-full">{task.subtasks.length}</span>
              </h3>
              
              {subtaskStatusError && (
                <div className="p-2 bg-error-container text-on-error-container rounded-md text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {subtaskStatusError}
                </div>
              )}
              
              <div className="border border-outline-variant rounded-md divide-y divide-outline-variant">
                {task.subtasks.map((sub) => {
                  const subStatus = statusConfig[sub.status];
                  return (
                    <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-surface-container/30 transition-colors gap-3">
                      <div className="min-w-0">
                        <h5 className="font-medium text-sm text-on-background truncate">
                          {sub.title}
                        </h5>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <select
                          value={sub.status}
                          onChange={(e) => handleSubtaskStatusChange(sub.id, e.target.value as TaskStatus)}
                          className={`text-xs font-medium rounded-md px-2 py-1 border-none cursor-pointer focus:ring-2 focus:ring-primary/20 ${subStatus.bg} ${subStatus.text}`}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 space-y-6">
          {/* Status Dropdown */}
          <div className="space-y-1">
            <div className="relative group">
              <button className={`w-full flex items-center justify-between gap-2 ${status.bg} ${status.text} px-3 py-1.5 rounded-md text-sm font-medium border border-current/10 hover:shadow-sm transition-all`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
                  {status.label}
                </div>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-outline-variant rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 py-1">
                {(Object.keys(statusConfig) as TaskStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={s === 'DONE' && !canMarkTaskDone}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-surface-container flex items-center gap-2 transition-colors ${task.status === s ? 'bg-primary/5 font-medium text-primary' : 'text-on-surface'} ${s === 'DONE' && !canMarkTaskDone ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${statusConfig[s].dot}`}></div>
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-outline-variant rounded-md overflow-hidden">
            <div className="px-4 py-3 bg-surface-container-lowest border-b border-outline-variant">
              <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wider">Details</h4>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Assignee */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-outline w-24">Assignee</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-medium shrink-0">
                    {(task.assignedToName || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-on-background truncate">
                    {task.assignedToName || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Reporter */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-outline w-24">Reporter</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-medium shrink-0">
                    {(task.createdByName || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-on-background truncate">
                    {task.createdByName || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Project */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-outline w-24">Project</span>
                <span className="text-sm text-primary hover:underline cursor-pointer truncate flex-1 text-left">
                  {task.projectName || '—'}
                </span>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-outline w-24">Due Date</span>
                <span className="text-sm text-on-background truncate flex-1 text-left">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-outline space-y-1 pt-2">
            <div>Created {task.createdAt ? new Date(task.createdAt).toLocaleString() : '—'}</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TaskDetails;
