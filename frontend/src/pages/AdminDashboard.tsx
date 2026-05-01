import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, tasksApi, subtasksApi, projectsApi, usersApi, type DashboardStats, type TaskDto, type SubtaskDto, type ProjectDto, type UserDto } from '../services/api';

const statusBadge = (status: string) => {
  switch (status) {
    case 'IN_PROGRESS':
      return <span className="inline-flex items-center px-2 py-1 rounded bg-secondary-fixed text-secondary font-label-caps text-label-caps">In Progress</span>;
    case 'DONE':
      return <span className="inline-flex items-center px-2 py-1 rounded bg-tertiary-fixed text-tertiary font-label-caps text-label-caps">Completed</span>;
    default:
      return <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container text-on-surface-variant font-label-caps text-label-caps">To Do</span>;
  }
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [allTasks, setAllTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Project Modal
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Create Task Modal
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskProjectId, setNewTaskProjectId] = useState<number | ''>('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<number | ''>('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Subtask drafts for task creation
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<Array<{
    title: string;
    description?: string;
    assignedToId?: number | null;
    dueDate?: string | null;
  }>>([]);

  // Subtask UI state
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});
  const [subtasksMap, setSubtasksMap] = useState<Record<number, TaskDto[]>>({});
  const [showCreateSubtask, setShowCreateSubtask] = useState(false);
  const [subtaskParentId, setSubtaskParentId] = useState<number | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDesc, setNewSubtaskDesc] = useState('');
  const [newSubtaskAssigneeId, setNewSubtaskAssigneeId] = useState<number | ''>('');
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState('');
  const [creatingSubtask, setCreatingSubtask] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchAll = async () => {
    try {
      const [statsRes, projectsRes, usersRes] = await Promise.all([
        dashboardApi.getStats(),
        projectsApi.getAll(),
        usersApi.getAll(),
      ]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);

      // Fetch tasks for all projects
      const taskPromises = projectsRes.data.map((p) =>
        p.id ? tasksApi.getByProject(p.id).then((r) => r.data).catch(() => []) : Promise.resolve([])
      );
      const taskArrays = await Promise.all(taskPromises);
      setAllTasks(taskArrays.flat());
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchSubtasks = async (parentId: number) => {
    try {
      const res = await subtasksApi.getByTask(parentId);
      setSubtasksMap((prev) => ({ ...prev, [parentId]: res.data }));
    } catch (err) {
      console.error('Failed to load subtasks', err);
    }
  };

  const toggleExpand = async (taskId: number) => {
    const isOpen = expandedTasks[taskId];
    if (isOpen) {
      setExpandedTasks((p) => ({ ...p, [taskId]: false }));
    } else {
      await fetchSubtasks(taskId);
      setExpandedTasks((p) => ({ ...p, [taskId]: true }));
    }
  };

  const openCreateSubtask = (parentId: number) => {
    setSubtaskParentId(parentId);
    setShowCreateSubtask(true);
  };

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskParentId) return;
    setCreatingSubtask(true);
    try {
      await subtasksApi.create(subtaskParentId, {
        title: newSubtaskTitle,
        description: newSubtaskDesc,
        assignedToId: newSubtaskAssigneeId || null,
        dueDate: newSubtaskDueDate || null,
      });
      setShowCreateSubtask(false);
      setNewSubtaskTitle('');
      setNewSubtaskDesc('');
      setNewSubtaskAssigneeId('');
      setNewSubtaskDueDate('');
      // refresh subtasks and tasks list
      await fetchSubtasks(subtaskParentId);
      await fetchAll();
    } catch (err) {
      console.error('Failed to create subtask', err);
    } finally {
      setCreatingSubtask(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await projectsApi.create({ name: newProjectName, description: newProjectDesc });
      setShowCreateProject(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchAll();
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);
    try {
      const { data: created } = await tasksApi.create({
        title: newTaskTitle,
        description: newTaskDesc,
        projectId: newTaskProjectId || null,
        assignedToId: newTaskAssigneeId || null,
        dueDate: newTaskDueDate || null,
        status: 'TODO',
      });

      // Create any provided subtasks sequentially
      if (created && created.id != null && newTaskSubtasks.length > 0) {
        for (const sd of newTaskSubtasks) {
          if (!sd.title || sd.title.trim() === '') continue;
          try {
            await subtasksApi.create(created.id!, {
              title: sd.title,
              description: sd.description || null,
              assignedToId: sd.assignedToId || null,
              dueDate: sd.dueDate || null,
              status: 'TODO',
            });
          } catch (err) {
            console.error('Failed to create subtask', err);
          }
        }
      }

      setShowCreateTask(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskProjectId('');
      setNewTaskAssigneeId('');
      setNewTaskDueDate('');
      setNewTaskSubtasks([]);
      await fetchAll();
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setCreatingTask(false);
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
          <span className="font-body-sm text-body-sm">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  const completionRate = stats && stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;
  const memberCount = users.filter((u) => u.role === 'MEMBER').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <>
      {/* Welcome Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-h1 text-h1 text-on-background mb-1">Admin Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Welcome back, {user.name}. Here is your organization overview.
          </p>
        </div>
        <div className="hidden md:flex gap-3">
          <div className="flex items-center gap-2 bg-primary-fixed text-primary font-label-caps text-label-caps px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            ADMIN
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
            {(user.name || 'A').charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-md">
        <button
          onClick={() => setShowCreateProject(true)}
          className="flex items-center gap-sm bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-button text-button px-md py-sm rounded-lg transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
          Create Project
        </button>
        <button
          onClick={() => setShowCreateTask(true)}
          className="flex items-center gap-sm bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-button text-button px-md py-sm rounded-lg transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_task</span>
          Assign Task
        </button>
        <Link
          to="/app/team"
          className="flex items-center gap-sm border border-outline-variant hover:bg-surface-container text-on-surface font-button text-button px-md py-sm rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">group</span>
          Manage Team
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-button text-button text-on-surface-variant">Total Tasks</span>
            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">list_alt</span>
            </div>
          </div>
          <span className="font-h1 text-h1 text-on-background">{stats?.totalTasks ?? 0}</span>
          <span className="font-label-caps text-label-caps text-outline">Across all projects</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-button text-button text-on-surface-variant">Pending</span>
            <div className="w-8 h-8 rounded bg-secondary-fixed text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">pending</span>
            </div>
          </div>
          <span className="font-h1 text-h1 text-on-background">{stats?.pendingTasks ?? 0}</span>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-1 overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: `${stats && stats.totalTasks > 0 ? Math.round((stats.pendingTasks / stats.totalTasks) * 100) : 0}%` }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-button text-button text-on-surface-variant">Completed</span>
            <div className="w-8 h-8 rounded bg-tertiary-fixed text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <span className="font-h1 text-h1 text-on-background">{stats?.completedTasks ?? 0}</span>
          <span className="font-label-caps text-label-caps text-outline">{completionRate}% completion</span>
        </div>

        <div className="bg-error-container border border-error-container rounded-lg p-md shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-on-error-container opacity-5 rounded-full -mr-8 -mt-8"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="font-button text-button text-on-error-container">Overdue</span>
            <div className="w-8 h-8 rounded bg-surface-container-lowest text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <span className="font-h1 text-h1 text-on-error-container relative z-10">{stats?.overdueTasks ?? 0}</span>
          <span className="font-label-caps text-label-caps text-on-error-container opacity-80 relative z-10">
            {(stats?.overdueTasks ?? 0) > 0 ? 'Needs attention' : 'All clear'}
          </span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="font-button text-button text-on-surface-variant">Team</span>
            <div className="w-8 h-8 rounded bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <span className="font-h1 text-h1 text-on-background">{users.length}</span>
          <span className="font-label-caps text-label-caps text-outline">{adminCount} admin · {memberCount} members</span>
        </div>
      </div>

      {/* Two-Column Layout: Projects + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Projects Overview */}
        <section className="flex flex-col gap-md">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h3 className="font-h3 text-h3 text-on-background">Projects ({projects.length})</h3>
            <Link to="/app/projects" className="font-button text-button text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="flex flex-col gap-sm">
            {projects.slice(0, 4).map((project) => {
              const projectTasks = allTasks.filter((t) => t.projectId === project.id);
              const done = projectTasks.filter((t) => t.status === 'DONE').length;
              const progress = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0;
              return (
                <div key={project.id} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex items-center gap-md hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">folder</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-button text-button text-on-background truncate">{project.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="font-label-caps text-label-caps text-outline whitespace-nowrap">{done}/{projectTasks.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant font-body-sm opacity-60">
                <span className="material-symbols-outlined text-[28px] block mb-1">folder_off</span>
                No projects yet
              </div>
            )}
          </div>
        </section>

        {/* Recent Tasks */}
        <section className="flex flex-col gap-md">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h3 className="font-h3 text-h3 text-on-background">All Tasks ({allTasks.length})</h3>
            <Link to="/app/tasks" className="font-button text-button text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1">
              View Board <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-bright">
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant font-semibold">Task</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant font-semibold hidden sm:table-cell">Assignee</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant">
                {allTasks.slice(0, 6).flatMap((task) => {
                  const rows: JSX.Element[] = [];
                  rows.push(
                    <tr key={task.id} className="hover:bg-surface-bright transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleExpand(task.id!)} className="text-on-surface-variant hover:text-primary p-1 rounded">
                            <span className="material-symbols-outlined text-[18px]">{expandedTasks[task.id!] ? 'expand_less' : 'expand_more'}</span>
                          </button>
                          <Link to={`/app/tasks/${task.id}`} className="font-button text-button text-on-background group-hover:text-primary transition-colors">
                            {task.title}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-on-surface-variant">{task.assignedToName || 'Unassigned'}</td>
                      <td className="py-3 px-4 flex items-center justify-between">
                        {statusBadge(task.status)}
                        <div className="ml-4">
                          <button onClick={() => openCreateSubtask(task.id!)} className="font-label-caps text-label-caps text-primary hover:underline">Add Subtask</button>
                        </div>
                      </td>
                    </tr>
                  );

                  if (expandedTasks[task.id!] && subtasksMap[task.id!]) {
                    const subs = subtasksMap[task.id!]!;
                    if (subs.length === 0) {
                      rows.push(
                        <tr key={`${task.id}-empty`} className="bg-surface-container p-2">
                          <td colSpan={3} className="py-2 px-6 text-on-surface-variant">No subtasks</td>
                        </tr>
                      );
                    } else {
                      subs.map((sub) => rows.push(
                        <tr key={sub.id} className="bg-surface-bright">
                          <td className="py-2 px-6">↳ <Link to={`/app/tasks/${sub.id}`} className="font-button text-button text-on-background group-hover:text-primary transition-colors">{sub.title}</Link></td>
                          <td className="py-2 px-4 hidden sm:table-cell text-on-surface-variant">{sub.assignedToName || 'Unassigned'}</td>
                          <td className="py-2 px-4">{statusBadge(sub.status)}</td>
                        </tr>
                      ));
                    }
                  }

                  return rows;
                })}
                {allTasks.length === 0 && (
                  <tr><td colSpan={3} className="py-8 text-center text-on-surface-variant opacity-60">No tasks yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Team Overview */}
      <section className="flex flex-col gap-md">
        <div className="flex justify-between items-center border-b border-outline-variant pb-2">
          <h3 className="font-h3 text-h3 text-on-background">Team Members</h3>
          <Link to="/app/team" className="font-button text-button text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1">
            Manage <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
          {users.slice(0, 8).map((member) => (
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

      {/* ── Create Project Modal ── */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowCreateProject(false)}>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl w-full max-w-md p-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-h2 text-h2 text-on-background mb-lg">Create Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-lg">
              <div className="space-y-sm">
                <label className="block font-label-caps text-label-caps text-on-surface uppercase">Project Name</label>
                <input
                  className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="e.g. Ethara Mobile App"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-sm">
                <label className="block font-label-caps text-label-caps text-on-surface uppercase">Description</label>
                <textarea
                  className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none h-24"
                  placeholder="Brief project description..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-md justify-end">
                <button type="button" onClick={() => setShowCreateProject(false)} className="font-button text-button text-on-surface-variant hover:text-on-surface px-md py-sm rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="bg-primary text-on-primary font-button text-button px-md py-sm rounded-lg hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Task Modal ── */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowCreateTask(false)}>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl w-full max-w-lg p-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-h2 text-h2 text-on-background mb-lg">Assign New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-lg">
              <div className="space-y-sm">
                <label className="block font-label-caps text-label-caps text-on-surface uppercase">Task Title</label>
                <input
                  className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="e.g. Design login page"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-sm">
                <label className="block font-label-caps text-label-caps text-on-surface uppercase">Description</label>
                <textarea
                  className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none h-20"
                  placeholder="Task details..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                />
              </div>
              {/* Subtasks Inline Editor */}
              <div className="space-y-sm">
                <div className="flex items-center justify-between">
                  <label className="block font-label-caps text-label-caps text-on-surface uppercase">Subtasks</label>
                  <button type="button" onClick={() => setNewTaskSubtasks((s) => [...s, { title: '' }])} className="font-button text-button text-primary hover:underline">Add Subtask</button>
                </div>
                <div className="space-y-2">
                  {newTaskSubtasks.map((sd, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                      <input
                        className="col-span-5 block w-full px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary"
                        placeholder="Subtask title"
                        value={sd.title}
                        onChange={(e) => setNewTaskSubtasks((prev) => { const copy = [...prev]; copy[idx] = { ...copy[idx], title: e.target.value }; return copy; })}
                        required
                      />
                      <select
                        className="col-span-4 block w-full px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary"
                        value={sd.assignedToId ?? ''}
                        onChange={(e) => setNewTaskSubtasks((prev) => { const copy = [...prev]; copy[idx] = { ...copy[idx], assignedToId: e.target.value ? Number(e.target.value) : null }; return copy; })}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        className="col-span-2 block w-full px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary"
                        value={sd.dueDate ?? ''}
                        onChange={(e) => setNewTaskSubtasks((prev) => { const copy = [...prev]; copy[idx] = { ...copy[idx], dueDate: e.target.value || null }; return copy; })}
                      />
                      <button type="button" onClick={() => setNewTaskSubtasks((prev) => prev.filter((_, i) => i !== idx))} className="col-span-1 text-error hover:underline">Remove</button>
                      <textarea
                        className="col-span-12 block w-full px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary mt-1"
                        placeholder="Subtask description (optional)"
                        value={sd.description ?? ''}
                        onChange={(e) => setNewTaskSubtasks((prev) => { const copy = [...prev]; copy[idx] = { ...copy[idx], description: e.target.value }; return copy; })}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className="block font-label-caps text-label-caps text-on-surface uppercase">Project</label>
                  <select
                    className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    value={newTaskProjectId}
                    onChange={(e) => setNewTaskProjectId(e.target.value ? Number(e.target.value) : '')}
                    required
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id!}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-sm">
                  <label className="block font-label-caps text-label-caps text-on-surface uppercase">Assign To</label>
                  <select
                    className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    value={newTaskAssigneeId}
                    onChange={(e) => setNewTaskAssigneeId(e.target.value ? Number(e.target.value) : '')}
                    required
                  >
                    <option value="">Select member</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-sm">
                <label className="block font-label-caps text-label-caps text-on-surface uppercase">Due Date</label>
                <input
                  type="date"
                  className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
              <div className="flex gap-md justify-end">
                <button type="button" onClick={() => setShowCreateTask(false)} className="font-button text-button text-on-surface-variant hover:text-on-surface px-md py-sm rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={creatingTask} className="bg-primary text-on-primary font-button text-button px-md py-sm rounded-lg hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60">
                  {creatingTask ? 'Creating...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Subtask Modal ── */}
      {showCreateSubtask && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowCreateSubtask(false)}>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl w-full max-w-lg p-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-h2 text-h2 text-on-background mb-lg">Create Subtask</h2>
            <form onSubmit={handleCreateSubtask} className="space-y-lg">
              <div className="space-y-sm">
                <label className="block font-label-caps text-label-caps text-on-surface uppercase">Subtask Title</label>
                <input
                  className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  placeholder="e.g. Create wireframes"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-sm">
                <label className="block font-label-caps text-label-caps text-on-surface uppercase">Description</label>
                <textarea
                  className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none h-20"
                  placeholder="Subtask details..."
                  value={newSubtaskDesc}
                  onChange={(e) => setNewSubtaskDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-sm">
                  <label className="block font-label-caps text-label-caps text-on-surface uppercase">Assign To</label>
                  <select
                    className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    value={newSubtaskAssigneeId}
                    onChange={(e) => setNewSubtaskAssigneeId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Select member</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-sm">
                  <label className="block font-label-caps text-label-caps text-on-surface uppercase">Due Date</label>
                  <input
                    type="date"
                    className="block w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    value={newSubtaskDueDate}
                    onChange={(e) => setNewSubtaskDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-md justify-end">
                <button type="button" onClick={() => setShowCreateSubtask(false)} className="font-button text-button text-on-surface-variant hover:text-on-surface px-md py-sm rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={creatingSubtask} className="bg-primary text-on-primary font-button text-button px-md py-sm rounded-lg hover:bg-on-primary-fixed-variant transition-colors disabled:opacity-60">
                  {creatingSubtask ? 'Creating...' : 'Create Subtask'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
