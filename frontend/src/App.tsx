import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { OperationsLayout } from '@/components/dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoginModalProvider } from '@/contexts/LoginModalContext';
import { useOperationsDashboard } from '@/hooks/useOperationsDashboard';
import AnalyticsPage from '@/pages/Analytics';
import OperationsDashboardPage from '@/pages/OperationsDashboard';
import GpsTrackingPage from '@/pages/GpsTracking';
import NotificationsPage from '@/pages/Notifications';
import RegisterPage from '@/pages/Register';
import TicketsPage from '@/pages/Tickets';
import LandingPage from '@/pages/Landing';

function OperationsLayoutWithAlerts() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  const { metrics } = useOperationsDashboard(60000);
  return <OperationsLayout alertCount={metrics.alertCount} />;
}

export default function App() {
  return (
    <LoginModalProvider>
      <Routes>
        {/* Public landing page — always the homepage */}
        <Route path="/" element={<LandingPage />} />

        {/* Secondary login route opens modal on landing page, then redirects to / */}
        <Route path="/login" element={<LandingPage openLoginOnMount />} />

        <Route path="/register" element={<RegisterPage />} />

        {/* Protected operations dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <OperationsLayoutWithAlerts />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<OperationsDashboardPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tracking" element={<GpsTrackingPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LoginModalProvider>
  );
}
