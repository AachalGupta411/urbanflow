import { NavLink } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MapPin,
  Ticket,
  Train,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Operations', icon: LayoutDashboard },
  { to: '/tracking', label: 'Fleet Tracking', icon: MapPin },
  { to: '/tickets', label: 'Ticketing', icon: Ticket },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/10 bg-ops-navy/95 backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary shadow-glow">
          <Train className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <p className="text-sm font-bold tracking-tight text-foreground">UrbanFlow</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ops Center</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/15 text-primary shadow-glow'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div
          className={cn(
            'glass-panel flex items-center gap-2 rounded-lg p-3',
            collapsed && 'justify-center'
          )}
        >
          <Activity className="h-4 w-4 shrink-0 animate-pulse-soft text-emerald-400" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">System Status</p>
              <p className="text-[10px] text-emerald-400">All services operational</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="mt-3 flex w-full items-center justify-center rounded-lg border border-white/10 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
