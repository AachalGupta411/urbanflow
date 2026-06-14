import { FormEvent, useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import * as notificationApi from '@/services/notificationApi';
import type { Notification } from '@/types';
import { formatDateTime, getErrorMessage } from '@/utils/token';

const typeLabels: Record<Notification['type'], string> = {
  delay: 'Delay alert',
  route_change: 'Route change',
  system: 'System',
};

const typeClass: Record<Notification['type'], string> = {
  delay: 'badge-warning',
  route_change: 'badge-info',
  system: 'badge-muted',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [announceForm, setAnnounceForm] = useState({
    type: 'system' as Notification['type'],
    title: '',
    message: '',
    route_id: '',
  });
  const [announcing, setAnnouncing] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationApi.listNotifications();
      setNotifications(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Notification service unavailable'));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

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
      setSuccess('Announcement published.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to publish announcement'));
    } finally {
      setAnnouncing(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="text-muted">Delay alerts, route changes, and system announcements from the notification service.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => void loadNotifications()}>
          Refresh
        </button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="split-layout">
        <section className="panel">
          <h2>Publish announcement</h2>
          <p className="text-muted panel-intro">Demo operator action — posts to the notification service.</p>
          <form className="form-stack" onSubmit={handleAnnounce}>
            <label>
              Type
              <select
                value={announceForm.type}
                onChange={(e) => setAnnounceForm((prev) => ({ ...prev, type: e.target.value as Notification['type'] }))}
              >
                <option value="delay">Delay</option>
                <option value="route_change">Route change</option>
                <option value="system">System</option>
              </select>
            </label>

            <label>
              Title
              <input
                type="text"
                value={announceForm.title}
                onChange={(e) => setAnnounceForm((prev) => ({ ...prev, title: e.target.value }))}
                required
                placeholder="Service delay on Route R-101"
              />
            </label>

            <label>
              Message
              <textarea
                value={announceForm.message}
                onChange={(e) => setAnnounceForm((prev) => ({ ...prev, message: e.target.value }))}
                required
                rows={4}
                placeholder="Expected delay of 15 minutes due to traffic..."
              />
            </label>

            <label>
              Route ID <span className="optional">(optional)</span>
              <input
                type="text"
                value={announceForm.route_id}
                onChange={(e) => setAnnounceForm((prev) => ({ ...prev, route_id: e.target.value }))}
                placeholder="R-101"
              />
            </label>

            <button type="submit" className="btn btn-primary" disabled={announcing}>
              {announcing ? 'Publishing...' : 'Publish'}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Inbox</h2>
          {loading ? (
            <LoadingSpinner label="Loading notifications..." size="sm" />
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <p>No notifications yet. They will appear here when the notification service consumes Kafka events.</p>
            </div>
          ) : (
            <ul className="notification-list">
              {notifications.map((item) => (
                <li key={item.id} className={`notification-item ${item.read ? 'read' : 'unread'}`}>
                  <div className="notification-header">
                    <span className={`badge ${typeClass[item.type]}`}>{typeLabels[item.type]}</span>
                    <time>{formatDateTime(item.created_at)}</time>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.message}</p>
                  {item.route_id ? <p className="text-muted">Route: {item.route_id}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
