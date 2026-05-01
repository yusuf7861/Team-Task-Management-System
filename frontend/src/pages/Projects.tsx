import React, { useEffect, useState } from 'react';
import { projectsApi, tasksApi, type ProjectDto, type TaskDto } from '../services/api';

interface ProjectWithStats extends ProjectDto {
  taskCount: number;
  completedCount: number;
  tasks: TaskDto[];
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Create Project Modal
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const { data: projectList } = await projectsApi.getAll();
      
      // Enrich each project with task stats
      const enriched = await Promise.all(
        projectList.map(async (project) => {
          let tasks: TaskDto[] = [];
          try {
            if (project.id) {
              const res = await tasksApi.getByProject(project.id);
              tasks = res.data;
            }
          } catch { /* project may have no tasks */ }
          return {
            ...project,
            taskCount: tasks.length,
            completedCount: tasks.filter((t) => t.status === 'DONE').length,
            tasks: tasks
          };
        })
      );
      setProjects(enriched);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await projectsApi.create({ name: newProjectName, description: newProjectDesc });
      setShowCreateProject(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setCreating(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-md text-on-surface-variant">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="font-body-sm text-body-sm">Loading projects...</span>
        </div>
      </div>
    );
  }

  const projectColors = [
    { bg: 'bg-primary-fixed', text: 'text-primary', icon: 'rocket_launch' },
    { bg: 'bg-secondary-fixed', text: 'text-secondary', icon: 'campaign' },
    { bg: 'bg-tertiary-fixed', text: 'text-tertiary', icon: 'design_services' },
    { bg: 'bg-error-container', text: 'text-error', icon: 'code' },
  ];

  if (selectedProject) {
    const idx = projects.indexOf(selectedProject);

    const progress = selectedProject.taskCount > 0
      ? Math.round((selectedProject.completedCount / selectedProject.taskCount) * 100)
      : 0;

    return (
      <div className="animate-in fade-in duration-500">
        {/* Detail Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setSelectedProjectId(null)}
            className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors text-outline hover:text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-caps text-label-caps text-outline">Projects</span>
              <span className="material-symbols-outlined text-[16px] text-outline opacity-40">chevron_right</span>
              <span className="font-label-caps text-label-caps text-primary font-bold">Project Detail</span>
            </div>
            <h1 className="font-h1 text-h1 text-on-background">{selectedProject.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-h3 text-h3 text-on-background mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                About Project
              </h3>
              <p className="text-on-surface-variant font-body-md leading-relaxed mb-8">
                {selectedProject.description || 'No description provided for this project.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-outline-variant">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Status</span>
                  <div className={`flex items-center gap-2 ${progress === 100 ? 'text-tertiary' : 'text-primary'} font-button`}>
                    <div className={`w-2 h-2 rounded-full ${progress === 100 ? 'bg-tertiary' : 'bg-primary'}`}></div>
                    {progress === 100 ? 'Completed' : 'Active'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Created By</span>
                  <div className="font-button text-on-background">{selectedProject.createdByName || 'Unknown'}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Tasks</span>
                  <div className="font-button text-on-background">{selectedProject.taskCount} items</div>
                </div>
              </div>
            </div>

            {/* Task List in Project */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-h3 text-h3 text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">list_alt</span>
                  Project Tasks
                </h3>
                <span className="bg-surface-container text-on-surface-variant font-label-caps text-[12px] px-3 py-1 rounded-full">
                  {selectedProject.taskCount} Total
                </span>
              </div>

              {selectedProject.tasks.length === 0 ? (
                <div className="text-center py-12 text-outline">
                  <span className="material-symbols-outlined text-[48px] opacity-20 block mb-2">assignment_late</span>
                  No tasks assigned to this project yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedProject.tasks.map(task => (
                    <div key={task.id} className="group bg-surface-container/30 border border-transparent hover:border-primary/20 hover:bg-surface-container-lowest rounded-xl p-4 transition-all flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-button text-on-background group-hover:text-primary transition-colors truncate">{task.title}</div>
                        <div className="text-[12px] text-outline flex items-center gap-2 mt-1">
                          <span className="font-bold">ETH-{String(task.id).padStart(3, '0')}</span>
                          <span>•</span>
                          <span>{task.assignedToName || 'Unassigned'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-label-caps border border-current/10 ${
                          task.status === 'DONE' ? 'bg-tertiary-fixed text-tertiary' : 
                          task.status === 'IN_PROGRESS' ? 'bg-secondary-container text-secondary' : 
                          'bg-surface-container text-outline'
                        }`}>
                          {task.status}
                        </span>
                        <a href={`/app/tasks/${task.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-outline hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side Stats */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h4 className="font-label-caps text-label-caps text-outline mb-6 uppercase tracking-widest">Progress Stats</h4>
              
              <div className="flex flex-col items-center py-4">
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="64" cy="64" r="58" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="8"
                      className="text-surface-container"
                    />
                    <circle 
                      cx="64" cy="64" r="58" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 58}
                      strokeDashoffset={2 * Math.PI * 58 * (1 - progress / 100)}
                      className={`${progress === 100 ? 'text-tertiary' : 'text-primary'} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-h2 text-h2 text-on-background">{progress}%</span>
                    <span className="text-[10px] text-outline font-bold uppercase">Done</span>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-outline">Completed Tasks</span>
                    <span className="font-bold text-on-background">{selectedProject.completedCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-outline">Remaining Tasks</span>
                    <span className="font-bold text-on-background">{selectedProject.taskCount - selectedProject.completedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-h1 text-h1 text-on-background">Projects</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and track your team's projects.</p>
        </div>
        {user.role === 'ADMIN' && (
          <button
            onClick={() => setShowCreateProject(true)}
            className="bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-button text-button px-md py-sm rounded-lg transition-colors flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
        {projects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] opacity-30 mb-md">folder_off</span>
            <p className="font-body-md text-body-md">No projects yet. Create your first project!</p>
          </div>
        ) : (
          projects.map((project, idx) => {
            const color = projectColors[idx % projectColors.length];
            const progress = project.taskCount > 0
              ? Math.round((project.completedCount / project.taskCount) * 100)
              : 0;

            return (
              <div 
                key={project.id} 
                onClick={() => setSelectedProjectId(project.id || null)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow flex flex-col gap-md cursor-pointer group"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-md">
                    <div className={`w-10 h-10 ${color.bg} ${color.text} rounded-lg flex items-center justify-center`}>
                      <span className="material-symbols-outlined">{color.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-h3 text-h3 text-on-background group-hover:text-primary transition-colors">{project.name}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">{project.description || 'No description'}</p>
                    </div>
                  </div>
                  <button className="text-outline hover:text-on-surface p-1 rounded" onClick={(e) => e.stopPropagation()}>
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">Progress</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant">{progress}%</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                    <div className={`${color.bg} h-full rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-sm border-t border-outline-variant">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {project.taskCount} task{project.taskCount !== 1 ? 's' : ''} · {project.completedCount} completed
                  </span>
                  {project.createdByName && (
                    <span className="font-label-caps text-label-caps text-outline">{project.createdByName}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

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
    </>
  );
};

export default Projects;
