import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminTopbar } from '../components/layout/AdminTopbar';
import { AdminMobileDrawer } from '../components/layout/AdminMobileDrawer';
import { AdminBottomNav } from '../components/layout/AdminBottomNav';
import { AdminCommandPalette } from '../components/admin/AdminCommandPalette';
import { useScrollTop } from '../hooks/useScrollTop';

export function AdminLayout() {
  useScrollTop();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => document.body.classList.remove('admin-body');
  }, []);

  useEffect(() => {
    function handleToggle() {
      setCmdOpen((prev) => !prev);
    }
    window.addEventListener('toggle-command-palette', handleToggle);
    return () => window.removeEventListener('toggle-command-palette', handleToggle);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col">
      <AdminTopbar
        onMenu={() => setMobileOpen(true)}
        onOpenCommandPalette={() => setCmdOpen(true)}
        collapsed={collapsed}
      />

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar Rail */}
        <aside
          className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 transition-all duration-300 ease-in-out lg:block ${
            collapsed ? 'w-16' : 'w-64'
          }`}
        >
          <AdminSidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((prev) => !prev)}
          />
        </aside>

        {/* Android Material 3 Mobile Navigation Drawer & App Launcher */}
        <AdminMobileDrawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 px-3 py-4 sm:px-8 sm:py-6 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Android Mobile Bottom Navigation Bar (Home, Entries, CRM, Scanner, All Apps) */}
      <AdminBottomNav
        onOpenMenu={() => setMobileOpen((prev) => !prev)}
        isMenuOpen={mobileOpen}
      />

      {/* Global Cmd + K Palette */}
      <AdminCommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
