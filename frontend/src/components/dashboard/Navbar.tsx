import { Bell, LogOut, Search, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavbarProps {
  sidebarCollapsed: boolean;
  alertCount?: number;
}

export default function Navbar({ sidebarCollapsed, alertCount = 0 }: NavbarProps) {
  const { passenger, logout } = useAuth();

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-ops-navy/80 px-6 backdrop-blur-xl transition-all duration-300',
        sidebarCollapsed ? 'left-[72px]' : 'left-64'
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search routes, vehicles, tickets..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">Live telemetry active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-lg border border-white/10 p-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {alertCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-foreground">{passenger?.full_name ?? 'Operator'}</p>
            <p className="text-[10px] text-muted-foreground">{passenger?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-white/10 p-2 text-muted-foreground transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
