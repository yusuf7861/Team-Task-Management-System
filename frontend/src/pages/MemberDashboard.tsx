import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, tasksApi, subtasksApi, usersApi, type DashboardStats, type TaskDto, type SubtaskDto, type TaskStatus, type UserDto } from '../services/api';



const MemberDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myTasks, setMyTasks] = useState<TaskDto[]>([]);
  const [mySubtasks, setMySubtasks] = useState<SubtaskDto[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes, subtasksRes, usersRes] = await Promise.allSettled([
        dashboardApi.getStats(),
        tasksApi.getMyTasks(),
        subtasksApi.getMySubtasks(),
        usersApi.getAll(),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }

      if (tasksRes.status === 'fulfilled') {
        setMyTasks(tasksRes.value.data);
      }

      if (subtasksRes.status === 'fulfilled') {
        setMySubtasks(subtasksRes.value.data);
      }

      if (usersRes.status === 'fulfilled') {
        setTeamMembers(usersRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleQuickStatus = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateStatus(taskId, newStatus);
      setMyTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      // Refresh stats
      const { data } = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to update status', err);
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
          <span className="font-body-sm text-body-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const completionRate = stats && stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const todoTasks = myTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = myTasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = myTasks.filter((t) => t.status === 'DONE');
  const todoSubtasks = mySubtasks.filter((t) => t.status === 'TODO');
  const inProgressSubtasks = mySubtasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneSubtasks = mySubtasks.filter((t) => t.status === 'DONE');

  const overdueTasks = myTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  );
  const overdueSubtasks = mySubtasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  );
  const totalOverdueCount = (stats?.overdueTasks || 0);

  return (
    <>
      {/* Welcome Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-h1 text-h1 text-on-background mb-1">My Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Welcome back, {user.name}. Here are your assigned tasks.
          </p>
        </div>
        <div className="hidden md:flex gap-3">
          <div className="flex items-center gap-2 bg-surface-container text-on-surface-variant font-label-caps text-label-caps px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[14px]">person</span>
            MEMBER
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
            {(user.name || 'M').charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-button text-button text-on-surface-variant">My Tasks</span>
            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
            </div>
          </div>
          <span className="font-h1 text-h1 text-on-background">{stats?.totalTasks ?? 0}</span>
          <span className="font-label-caps text-label-caps text-outline">Assigned to you</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-button text-button text-on-surface-variant">In Progress</span>
            <div className="w-8 h-8 rounded bg-secondary-container text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">pending</span>
          </div>
        </div>
        <span className="font-h1 text-h1 text-on-background">{stats?.pendingTasks || 0}</span>
        <span className="font-label-caps text-label-caps text-outline">Currently working on</span>
      </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-button text-button text-on-surface-variant">Completed</span>
            <div className="w-8 h-8 rounded bg-tertiary-fixed text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <span className="font-h1 text-h1 text-on-background">{stats?.completedTasks || 0}</span>
          <span className="font-label-caps text-label-caps text-outline">{completionRate}% done</span>
        </div>

        <div className={`${(stats?.overdueTasks || 0) > 0 ? 'bg-error-container border-error-container' : 'bg-surface-container-lowest border-outline-variant'} border rounded-lg p-md shadow-sm flex flex-col gap-2 relative overflow-hidden`}>
          {(stats?.overdueTasks || 0) > 0 && <div className="absolute top-0 right-0 w-24 h-24 bg-on-error-container opacity-5 rounded-full -mr-8 -mt-8"></div>}
          <div className="flex justify-between items-start relative z-10">
            <span className={`font-button text-button ${(stats?.overdueTasks || 0) > 0 ? 'text-on-error-container' : 'text-on-surface-variant'}`}>Overdue</span>
            <div className={`w-8 h-8 rounded ${(stats?.overdueTasks || 0) > 0 ? 'bg-surface-container-lowest text-error' : 'bg-surface-container text-outline'} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[18px]">{(stats?.overdueTasks || 0) > 0 ? 'warning' : 'done_all'}</span>
            </div>
          </div>
          <span className={`font-h1 text-h1 relative z-10 ${(stats?.overdueTasks || 0) > 0 ? 'text-on-error-container' : 'text-on-background'}`}>{stats?.overdueTasks || 0}</span>
          <span className={`font-label-caps text-label-caps relative z-10 ${(stats?.overdueTasks || 0) > 0 ? 'text-on-error-container opacity-80' : 'text-outline'}`}>
            {(stats?.overdueTasks || 0) > 0 ? 'Needs your attention!' : 'All caught up!'}
          </span>
        </div>
      </div>

      {/* Overdue Alert */}
      {totalOverdueCount > 0 && (
        <div className="bg-error-container border border-error-container rounded-xl p-md flex items-start gap-md">
          <div className="w-10 h-10 rounded-full bg-surface-container-lowest text-error flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined">priority_high</span>
          </div>
          <div>
            <h4 className="font-button text-button text-on-error-container mb-1">You have {totalOverdueCount} overdue item{totalOverdueCount > 1 ? 's' : ''}</h4>
            <div className="flex flex-wrap gap-sm">
              {overdueTasks.map((task) => (
                <Link key={task.id} to={`/app/tasks/${task.id}`} className="font-body-sm text-body-sm text-on-error-container underline hover:opacity-80">
                  {task.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Status Update Section */}
      <section className="flex flex-col gap-md">
        <div className="flex justify-between items-center border-b border-outline-variant pb-2">
          <h3 className="font-h3 text-h3 text-on-background">My Tasks</h3>
          <Link to="/app/tasks" className="font-button text-button text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1">
            Kanban View <span className="material-symbols-outlined text-[16px]">view_kanban</span>
          </Link>
        </div>

        {myTasks.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-outline opacity-30 block mb-md">inbox</span>
            <p className="font-body-md text-body-md text-on-surface-variant">No tasks assigned to you yet.</p>
            <p className="font-body-sm text-body-sm text-outline mt-sm">Ask your admin to assign you some tasks!</p>
          </div>
        ) : (
          <div className="space-y-sm">
            {/* To Do */}
            {todoTasks.length > 0 && (
              <div>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-sm flex items-center gap-xs">
                  <div className="w-2 h-2 rounded-full bg-outline"></div>
                  To Do ({todoTasks.length})
                </h4>
                <div className="space-y-1">
                  {todoTasks.map((task) => (
                    <div key={task.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex items-center justify-between gap-md hover:shadow-sm transition-shadow group">
                      <div className="flex items-center gap-md min-w-0">
                        <button
                          onClick={() => handleQuickStatus(task.id!, 'IN_PROGRESS')}
                          className="w-5 h-5 rounded border-2 border-outline hover:border-primary flex-shrink-0 transition-colors"
                          title="Start working"
                        />
                        <div className="min-w-0">
                          <Link to={`/app/tasks/${task.id}`} className="font-button text-button text-on-background group-hover:text-primary transition-colors block truncate">{task.title}</Link>
                          <span className="font-label-caps text-label-caps text-outline">{task.projectName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-md flex-shrink-0">
                        {task.dueDate && (
                          <span className="font-label-caps text-label-caps text-outline hidden sm:block">
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <button
                          onClick={() => handleQuickStatus(task.id!, 'IN_PROGRESS')}
                          className="text-primary font-label-caps text-label-caps hover:underline"
                        >
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In Progress */}
            {inProgressTasks.length > 0 && (
              <div>
                <h4 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-sm flex items-center gap-xs mt-md">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  In Progress ({inProgressTasks.length})
                </h4>
                <div className="space-y-1">
                  {inProgressTasks.map((task) => (
                    <div key={task.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex items-center justify-between gap-md hover:shadow-sm transition-shadow group">
                      <div className="flex items-center gap-md min-w-0">
                        <button
                          onClick={() => handleQuickStatus(task.id!, 'DONE')}
                          className="w-5 h-5 rounded border-2 border-secondary bg-secondary/10 flex-shrink-0 hover:bg-secondary hover:border-secondary transition-colors flex items-center justify-center"
                          title="Mark done"
                        >
                          <span className="material-symbols-outlined text-[12px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity">check</span>
                        </button>
                        <div className="min-w-0">
                          <Link to={`/app/tasks/${task.id}`} className="font-button text-button text-on-background group-hover:text-primary transition-colors block truncate">{task.title}</Link>
                          <span className="font-label-caps text-label-caps text-outline">{task.projectName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-md flex-shrink-0">
                        {task.dueDate && (
                          <span className={`font-label-caps text-label-caps hidden sm:block ${new Date(task.dueDate) < new Date() ? 'text-error' : 'text-outline'}`}>
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <button
                          onClick={() => handleQuickStatus(task.id!, 'DONE')}
                          className="text-tertiary font-label-caps text-label-caps hover:underline"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Done */}
            {doneTasks.length > 0 && (
              <div>
                <h4 className="font-label-caps text-label-caps text-outline uppercase tracking-wider mb-sm flex items-center gap-xs mt-md">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Done ({doneTasks.length})
                </h4>
                <div className="space-y-1">
                  {doneTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex items-center justify-between gap-md opacity-60 hover:opacity-80 transition-opacity">
                      <div className="flex items-center gap-md min-w-0">
                        <div className="w-5 h-5 rounded border-2 border-tertiary bg-tertiary/20 flex-shrink-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px] text-tertiary">check</span>
                        </div>
                        <span className="font-button text-button text-on-surface-variant line-through truncate">{task.title}</span>
                      </div>
                    </div>
                  ))}
                  {doneTasks.length > 3 && (
                    <p className="font-body-sm text-body-sm text-outline text-center py-1">
                      +{doneTasks.length - 3} more completed
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* My Subtasks */}
      <section className="flex flex-col gap-md">
        <div className="flex justify-between items-center border-b border-outline-variant pb-2">
          <h3 className="font-h3 text-h3 text-on-background">My Subtasks</h3>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{mySubtasks.length} total</span>
        </div>

        {mySubtasks.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-outline opacity-30 block mb-md">playlist_add_check</span>
            <p className="font-body-md text-body-md text-on-surface-variant">No subtasks assigned to you yet.</p>
            <p className="font-body-sm text-body-sm text-outline mt-sm">They will appear here when your tasks are broken down further.</p>
          </div>
        ) : (
          <div className="space-y-sm">
            {todoSubtasks.length > 0 && (
              <div>
                <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-sm flex items-center gap-xs">
                  <div className="w-2 h-2 rounded-full bg-outline"></div>
                  To Do ({todoSubtasks.length})
                </h4>
                <div className="space-y-1">
                  {todoSubtasks.map((subtask) => (
                    <Link key={subtask.id} to={`/app/tasks/${subtask.taskId}`} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex items-start justify-between gap-md hover:shadow-sm transition-shadow group">
                      <div className="min-w-0">
                        <div className="font-button text-button text-on-background group-hover:text-primary transition-colors block truncate">{subtask.title}</div>
                        <span className="font-label-caps text-label-caps text-outline block truncate">{subtask.description || 'No description'}</span>
                      </div>
                      <span className="font-label-caps text-label-caps text-outline flex-shrink-0">Task #{String(subtask.taskId).padStart(3, '0')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {inProgressSubtasks.length > 0 && (
              <div>
                <h4 className="font-label-caps text-label-caps text-secondary uppercase tracking-wider mb-sm flex items-center gap-xs mt-md">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  In Progress ({inProgressSubtasks.length})
                </h4>
                <div className="space-y-1">
                  {inProgressSubtasks.map((subtask) => (
                    <Link key={subtask.id} to={`/app/tasks/${subtask.taskId}`} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex items-start justify-between gap-md hover:shadow-sm transition-shadow group">
                      <div className="min-w-0">
                        <div className="font-button text-button text-on-background group-hover:text-primary transition-colors block truncate">{subtask.title}</div>
                        <span className="font-label-caps text-label-caps text-outline block truncate">{subtask.description || 'No description'}</span>
                      </div>
                      <span className="font-label-caps text-label-caps text-outline flex-shrink-0">Task #{String(subtask.taskId).padStart(3, '0')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {doneSubtasks.length > 0 && (
              <div>
                <h4 className="font-label-caps text-label-caps text-tertiary uppercase tracking-wider mb-sm flex items-center gap-xs mt-md">
                  <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                  Completed ({doneSubtasks.length})
                </h4>
                <div className="space-y-1">
                  {doneSubtasks.map((subtask) => (
                    <Link key={subtask.id} to={`/app/tasks/${subtask.taskId}`} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex items-start justify-between gap-md hover:shadow-sm transition-shadow group opacity-90">
                      <div className="min-w-0">
                        <div className="font-button text-button text-on-background group-hover:text-primary transition-colors block truncate">{subtask.title}</div>
                        <span className="font-label-caps text-label-caps text-outline block truncate">{subtask.description || 'No description'}</span>
                      </div>
                      <span className="font-label-caps text-label-caps text-outline flex-shrink-0">Task #{String(subtask.taskId).padStart(3, '0')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Team Members */}
      <section className="flex flex-col gap-md">
        <div className="flex justify-between items-center border-b border-outline-variant pb-2">
          <h3 className="font-h3 text-h3 text-on-background">Team Members</h3>
          <Link to="/app/team" className="font-button text-button text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1">
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-sm">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md flex items-center gap-md hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm flex-shrink-0">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-button text-button text-on-background truncate">{member.name}</p>
                <span className={`font-label-caps text-label-caps ${member.role === 'ADMIN' ? 'text-primary' : 'text-outline'}`}>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default MemberDashboard;
