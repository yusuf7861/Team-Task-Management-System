import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const SidebarLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar whenever the route changes (user tapped a nav link)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return isActive
      ? 'bg-primary-fixed text-primary font-button text-button rounded-lg px-3 py-2 flex items-center gap-3 transition-colors duration-200 ease-in-out'
      : 'text-on-surface-variant hover:bg-surface-container font-button text-button rounded-lg px-3 py-2 flex items-center gap-3 transition-colors duration-200 ease-in-out';
  };

  const getIconClass = (path: string) =>
    location.pathname.startsWith(path)
      ? "material-symbols-outlined [font-variation-settings:'FILL'_1]"
      : 'material-symbols-outlined';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Shared sidebar content (rendered in both desktop aside and mobile drawer)
  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-lg">E</div>
        <div>
          <h2 className="text-primary font-h2 text-h2 leading-none">Ethara</h2>
          <span className="text-outline font-label-caps text-label-caps">Workspace</span>
        </div>
        {/* Close button — mobile only */}
        <button
          className="ml-auto md:hidden text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

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
    </>
  );

  return (
    <div className="bg-background text-on-background font-body-md text-body-md flex min-h-screen">

      {/* ── Desktop Sidebar (always visible ≥ md) ─────────────────────── */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] border-r border-outline-variant bg-surface-bright hidden md:flex flex-col p-4 gap-y-2 z-50">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay (dim background when drawer is open) ─────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Drawer (slides in from left) ─────────────────────── */}
      <aside
        className={[
          'fixed left-0 top-0 h-screen w-[260px] border-r border-outline-variant bg-surface-bright',
          'flex flex-col p-4 gap-y-2 z-[70] md:hidden',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Navigation menu"
      >
        <SidebarContent />
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">

        {/* Top App Bar — mobile only */}
        <header className="md:hidden flex justify-between items-center w-full px-4 h-14 bg-surface-bright border-b border-outline-variant sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-sm">E</div>
            <span className="text-primary font-h3 text-h3">Ethara</span>
          </div>
          <button
            id="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <div className="p-gutter lg:p-xl max-w-[1400px] w-full mx-auto flex flex-col gap-xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
