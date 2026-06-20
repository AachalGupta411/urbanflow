import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Info,
  Megaphone,
  RefreshCw,
  Route,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MetricCard } from '@/components/dashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import * as notificationApi from '@/services/notificationApi';
import type { Notification } from '@/types';
import { formatDateTime, getErrorMessage } from '@/utils/token';

const typeConfig = {
  delay: { icon: AlertTriangle, variant: 'danger' as const, label: 'Delay alert' },
  route_change: { icon: Route, variant: 'warning' as const, label: 'Route change' },
  system: { icon: Info, variant: 'default' as const, label: 'System' },
};

const selectClassName =
  'flex h-11 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:border-teal-500';

const textareaClassName =
  'flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:border-teal-500';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [announceForm, setAnnounceForm] = useState({
    type: 'system' as Notification['type'],
    title: '',
    message: '',
    route_id: '',
  });
  const [announcing, setAnnouncing] = useState(false);

  const loadNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const data = await notificationApi.listNotifications();
      setNotifications(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Notification service unavailable'));
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const stats = useMemo(() => {
    const unread = notifications.filter((n) => !n.read).length;
    const delays = notifications.filter((n) => n.type === 'delay').length;
    const routeChanges = notifications.filter((n) => n.type === 'route_change').length;
    return { total: notifications.length, unread, delays, routeChanges };
  }, [notifications]);

  const handleAnnounce = async (event: FormEvent) => {
    event.preventDefault();
    setAnnouncing(true);
    setError('');
    setSuccess('');
    try {
      const notification = await notificationApi.announceNotification({
        type: announceForm.type,
        title: announceForm.title,
        message: announceForm.message,
        route_id: announceForm.route_id || undefined,
      });
      setNotifications((prev) => [notification, ...prev]);
      setAnnounceForm({ type: 'system', title: '', message: '', route_id: '' });
      setSuccess('Announcement published successfully.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to publish announcement'));
    } finally {
      setAnnouncing(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
    } catch {
      /* ignore — inbox still usable */
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Alerts & Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Delay alerts, route changes, and system announcements from the notification service.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void loadNotifications(true)}
          disabled={refreshing}
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total alerts"
          value={stats.total}
          changeLabel={`${stats.unread} unread`}
          icon={Bell}
          accent="blue"
          loading={loading}
        />
        <MetricCard
          title="Unread"
          value={stats.unread}
          changeLabel="Requires attention"
          icon={AlertTriangle}
          accent="amber"
          loading={loading}
        />
        <MetricCard
          title="Delay alerts"
          value={stats.delays}
          changeLabel="Service disruptions"
          icon={AlertTriangle}
          accent="cyan"
          loading={loading}
        />
        <MetricCard
          title="Route changes"
          value={stats.routeChanges}
          changeLabel="Schedule updates"
          icon={Route}
          accent="green"
          loading={loading}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-teal-600" />
              <CardTitle>Publish announcement</CardTitle>
            </div>
            <CardDescription>
              Operator action — posts directly to the notification service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAnnounce}>
              <div className="space-y-2">
                <Label htmlFor="alert-type">Alert type</Label>
                <select
                  id="alert-type"
                  className={selectClassName}
                  value={announceForm.type}
                  onChange={(e) =>
                    setAnnounceForm((prev) => ({
                      ...prev,
                      type: e.target.value as Notification['type'],
                    }))
                  }
                >
                  <option value="delay">Delay</option>
                  <option value="route_change">Route change</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-title">Title</Label>
                <Input
                  id="alert-title"
                  type="text"
                  value={announceForm.title}
                  onChange={(e) =>
                    setAnnounceForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  placeholder="Service delay on Route R-101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-message">Message</Label>
                <textarea
                  id="alert-message"
                  className={textareaClassName}
                  value={announceForm.message}
                  onChange={(e) =>
                    setAnnounceForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  required
                  placeholder="Expected delay of 15 minutes due to traffic..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-route">
                  Route ID <span className="font-normal text-slate-400">(optional)</span>
                </Label>
                <Input
                  id="alert-route"
                  type="text"
                  value={announceForm.route_id}
                  onChange={(e) =>
                    setAnnounceForm((prev) => ({ ...prev, route_id: e.target.value }))
                  }
                  placeholder="R-101"
                />
              </div>

              <Button type="submit" variant="teal" className="w-full" disabled={announcing}>
                {announcing ? 'Publishing…' : 'Publish announcement'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>Live alerts from Kafka events and operator broadcasts</CardDescription>
            </div>
            <Badge variant="muted">{notifications.length} total</Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner label="Loading notifications..." size="sm" />
            ) : notifications.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <Bell className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Alerts appear here when the notification service consumes Kafka events, or when
                  you publish an announcement.
                </p>
              </div>
            ) : (
              <ul className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {notifications.map((item) => {
                  const config = typeConfig[item.type] ?? typeConfig.system;
                  const Icon = config.icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!item.read) void handleMarkRead(item.id);
                        }}
                        className={cn(
                          'w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-200 hover:shadow-md',
                          !item.read && 'border-l-4 border-l-teal-500 bg-teal-50/30',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-slate-50 p-2 shadow-sm">
                            <Icon className="h-4 w-4 text-teal-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                              <Badge variant={config.variant} className="text-[10px]">
                                {config.label}
                              </Badge>
                              {!item.read && (
                                <Badge variant="success" className="text-[10px]">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                              {item.message}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <time>{formatDateTime(item.created_at)}</time>
                              {item.route_id ? (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                                  Route {item.route_id}
                                </span>
                              ) : null}
                              {!item.read ? (
                                <span className="text-teal-600">Click to mark as read</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
