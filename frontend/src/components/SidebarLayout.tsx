import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const SidebarLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return isActive
      ? "bg-primary-fixed text-primary font-button text-button rounded-lg px-3 py-2 flex items-center gap-3 transition-colors duration-200 ease-in-out"
      : "text-on-surface-variant hover:bg-surface-container font-button text-button rounded-lg px-3 py-2 flex items-center gap-3 transition-colors duration-200 ease-in-out";
  };

  const getIconClass = (path: string) => {
    return location.pathname.startsWith(path)
      ? "material-symbols-outlined [font-variation-settings:'FILL'_1]"
      : "material-symbols-outlined";
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="bg-background text-on-background font-body-md text-body-md flex min-h-screen">
      {/* SideNavBar Component */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] border-r border-outline-variant bg-surface-bright hidden md:flex flex-col p-4 gap-y-2 z-50">
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-lg">E</div>
          <div>
            <h2 className="text-primary font-h2 text-h2 leading-none">Ethara</h2>
            <span className="text-outline font-label-caps text-label-caps">Workspace</span>
          </div>
        </div>

        {user.role === 'ADMIN' && (
          <button className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-button text-button py-2 px-4 rounded transition-colors duration-200 mb-6 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Task
          </button>
        )}

        <nav className="flex flex-col gap-1 flex-grow">
          <Link className={getNavLinkClass('/app/dashboard')} to="/app/dashboard">
            <span className={getIconClass('/app/dashboard')}>dashboard</span>
            Dashboard
          </Link>
          <Link className={getNavLinkClass('/app/projects')} to="/app/projects">
            <span className={getIconClass('/app/projects')}>assignment</span>
            Projects
          </Link>
          <Link className={getNavLinkClass('/app/tasks')} to="/app/tasks">
            <span className={getIconClass('/app/tasks')}>view_kanban</span>
            Tasks
          </Link>
          <Link className={getNavLinkClass('/app/team')} to="/app/team">
            <span className={getIconClass('/app/team')}>group</span>
            Team
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-4">
          {user.name && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-button text-button text-on-surface truncate">{user.name}</p>
                <p className="font-label-caps text-label-caps text-outline">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-on-surface-variant hover:bg-error-container hover:text-on-error-container font-button text-button rounded-lg px-3 py-2 flex items-center gap-3 transition-colors duration-200 ease-in-out"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        {/* TopAppBar Component (Mobile Only) */}
        <header className="md:hidden flex justify-between items-center w-full px-6 h-16 bg-surface-bright border-b border-outline-variant sticky top-0 z-40">
          <h1 className="text-primary font-h3 text-h3">Ethara</h1>
          <div className="flex gap-4 text-on-surface-variant">
            <button><span className="material-symbols-outlined">menu</span></button>
          </div>
        </header>

        <div className="p-gutter lg:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
