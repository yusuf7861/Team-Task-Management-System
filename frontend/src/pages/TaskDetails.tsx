import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tasksApi, subtasksApi, type TaskDto, type SubtaskDto, type TaskStatus } from '../services/api';

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
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
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
    <>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-slate-500 mb-6 font-body-sm">
        <Link className="hover:text-primary transition-colors" to="/app/projects">Projects</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="hover:text-primary transition-colors cursor-pointer">{task.projectName || 'Project'}</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-background font-medium">ETH-{String(task.id).padStart(3, '0')}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Main Task Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-label-caps text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">ETH-{String(task.id).padStart(3, '0')}</span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-slate-50 transition-colors"><span className="material-symbols-outlined text-[20px]">share</span></button>
                <button className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-slate-50 transition-colors"><span className="material-symbols-outlined text-[20px]">more_horiz</span></button>
              </div>
            </div>
            <h1 className="font-h1 text-on-background mb-4">{task.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              {/* Status Dropdown */}
              <div className="relative group cursor-pointer">
                <div className={`flex items-center gap-2 ${status.bg} ${status.text} px-3 py-1.5 rounded-lg border font-button`}>
                  <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
                  {status.label}
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[160px]">
                  {(Object.keys(statusConfig) as TaskStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={s === 'DONE' && !canMarkTaskDone}
                      className={`w-full text-left px-3 py-2 font-body-sm text-body-sm hover:bg-slate-50 flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${task.status === s ? 'bg-slate-50 font-medium' : ''} ${s === 'DONE' && !canMarkTaskDone ? 'opacity-40 cursor-not-allowed hover:bg-white' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${statusConfig[s].dot}`}></div>
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {!canMarkTaskDone && task.subtasks && task.subtasks.length > 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                Complete all subtasks before marking this task as done.
              </p>
            )}
            {taskStatusError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
                {taskStatusError}
              </p>
            )}
            {subtaskStatusError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
                {subtaskStatusError}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <h3 className="font-h3 text-on-background mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">subject</span>
              Description
            </h3>
            <div className="prose prose-sm max-w-none text-slate-600 font-body-md">
                {task.description ? (
                  <p>{task.description}</p>
                ) : (
                  <p className="text-slate-400 italic">No description provided.</p>
                )}
                {/* Subtasks (embedded in task response) */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <h4 className="font-h3 text-on-background mb-4">Subtasks ({task.subtasks.length})</h4>
                    <div className="space-y-3">
                      {task.subtasks.map((sub) => {
                        const subStatus = statusConfig[sub.status];
                        return (
                          <div key={sub.id} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                            {/* Subtask Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h5 className="font-button text-on-background">
                                  ETH-{String(sub.id).padStart(3, '0')}: {sub.title}
                                </h5>
                              </div>
                              <div className={`flex items-center gap-1 ${subStatus.bg} ${subStatus.text} px-2 py-1 rounded text-[12px] font-label-caps whitespace-nowrap ml-2`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${subStatus.dot}`}></div>
                                {subStatus.label}
                              </div>
                            </div>
                            
                            {/* Description */}
                            {sub.description && (
                              <p className="text-slate-600 font-body-sm mb-3">{sub.description}</p>
                            )}
                            
                            {/* Subtask Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {/* Assigned To */}
                              <div>
                                <span className="font-label-caps text-slate-500 text-[11px] uppercase block mb-1">Assigned To</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[11px] font-bold">
                                    {(sub.assignedToName || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-body-sm text-slate-700">{sub.assignedToName || 'Unassigned'}</span>
                                </div>
                              </div>
                              
                              {/* Due Date */}
                              <div>
                                <span className="font-label-caps text-slate-500 text-[11px] uppercase block mb-1">Due Date</span>
                                <div className="flex items-center gap-1 font-body-sm text-slate-700">
                                  <span className="material-symbols-outlined text-[14px] text-slate-400">calendar_today</span>
                                  {sub.dueDate ? new Date(sub.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                </div>
                              </div>
                              
                              {/* Created By */}
                              <div>
                                <span className="font-label-caps text-slate-500 text-[11px] uppercase block mb-1">Created By</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center text-[11px] font-bold">
                                    {(sub.createdByName || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-body-sm text-slate-700">{sub.createdByName || 'Unknown'}</span>
                                </div>
                              </div>
                              
                              {/* Created At */}
                              <div>
                                <span className="font-label-caps text-slate-500 text-[11px] uppercase block mb-1">Created</span>
                                <div className="flex items-center gap-1 font-body-sm text-slate-700">
                                  <span className="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
                                  {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                </div>
                              </div>
                            </div>

                            {/* Subtask Status Editor */}
                            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                              <span className="font-label-caps text-slate-500 text-[11px] uppercase">Update Status</span>
                              <select
                                value={sub.status}
                                onChange={(e) => handleSubtaskStatusChange(sub.id, e.target.value as TaskStatus)}
                                className="border border-slate-200 rounded-lg bg-white px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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
          </div>
        </div>

        {/* Meta/Sidebar Column */}
        <div className="space-y-6">
          {/* Attributes Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="space-y-5">
              {/* Assignee */}
              <div>
                <label className="font-label-caps text-slate-500 uppercase tracking-wider block mb-2">Assignee</label>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                    {(task.assignedToName || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-button text-on-background">{task.assignedToName || 'Unassigned'}</span>
                </div>
              </div>
              {/* Reporter */}
              <div>
                <label className="font-label-caps text-slate-500 uppercase tracking-wider block mb-2">Reporter</label>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-sm">
                    {(task.createdByName || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-body-sm text-slate-700">{task.createdByName || 'Unknown'}</span>
                </div>
              </div>
              <hr className="border-slate-100"/>
              {/* Due Date */}
              <div>
                <label className="font-label-caps text-slate-500 uppercase tracking-wider block mb-2">Due Date</label>
                <div className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-white">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                  <span className="font-button text-on-background flex-1">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                  </span>
                </div>
              </div>
              {/* Project */}
              <div>
                <label className="font-label-caps text-slate-500 uppercase tracking-wider block mb-2">Project</label>
                <div className="flex items-center gap-3 p-2">
                  <div className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
                  </div>
                  <span className="font-body-sm text-slate-700 hover:text-primary cursor-pointer hover:underline">{task.projectName || '—'}</span>
                </div>
              </div>
              {/* Created */}
              <div>
                <label className="font-label-caps text-slate-500 uppercase tracking-wider block mb-2">Created</label>
                <div className="flex items-center gap-3 p-2">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">schedule</span>
                  <span className="font-body-sm text-slate-700">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetails;
