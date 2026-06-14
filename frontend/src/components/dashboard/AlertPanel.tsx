import { AlertTriangle, Bell, Info, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

interface AlertPanelProps {
  alerts: Notification[];
  loading?: boolean;
  maxItems?: number;
}

const typeConfig = {
  delay: { icon: AlertTriangle, variant: 'danger' as const, label: 'Delay' },
  route_change: { icon: Route, variant: 'warning' as const, label: 'Route Change' },
  system: { icon: Info, variant: 'default' as const, label: 'System' },
};

export default function AlertPanel({ alerts, loading, maxItems = 6 }: AlertPanelProps) {
  const visible = alerts.slice(0, maxItems);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-teal-600" />
          <CardTitle>Transportation Alerts</CardTitle>
        </div>
        <Badge variant="muted">{alerts.length} total</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">No active alerts</p>
            <p className="text-xs text-slate-400">All routes operating normally</p>
          </div>
        ) : (
          visible.map((alert) => {
            const config = typeConfig[alert.type] ?? typeConfig.system;
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className={cn(
                  'animate-slide-in rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-200',
                  !alert.read && 'border-l-2 border-l-teal-500'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-white p-1.5 shadow-sm">
                    <Icon className="h-3.5 w-3.5 text-teal-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{alert.title}</p>
                      <Badge variant={config.variant} className="shrink-0 text-[10px]">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{alert.message}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
