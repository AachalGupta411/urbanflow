import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface OperationsLayoutProps {
  alertCount?: number;
}

export default function OperationsLayout({ alertCount = 0 }: OperationsLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
      <Navbar sidebarCollapsed={sidebarCollapsed} alertCount={alertCount} />
      <main
        className="min-h-screen bg-slate-50 pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
