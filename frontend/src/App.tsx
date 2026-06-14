import { Navigate, Route, Routes } from 'react-router-dom';
import { OperationsLayout } from '@/components/dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useOperationsDashboard } from '@/hooks/useOperationsDashboard';
import AnalyticsPage from '@/pages/Analytics';
import OperationsDashboardPage from '@/pages/OperationsDashboard';
import GpsTrackingPage from '@/pages/GpsTracking';
import LoginPage from '@/pages/Login';
import NotificationsPage from '@/pages/Notifications';
import RegisterPage from '@/pages/Register';
import TicketsPage from '@/pages/Tickets';

function OperationsLayoutWithAlerts() {
  const { metrics } = useOperationsDashboard(60000);
  return <OperationsLayout alertCount={metrics.alertCount} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <OperationsLayoutWithAlerts />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<OperationsDashboardPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tracking" element={<GpsTrackingPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
