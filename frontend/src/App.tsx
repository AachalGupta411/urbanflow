import { Navigate, Route, Routes } from 'react-router-dom';
import { OperationsLayout } from '@/components/dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoginModalProvider } from '@/contexts/LoginModalContext';
import { OperationsDashboardProvider, useOperationsDashboardContext } from '@/contexts/OperationsDashboardContext';
import AnalyticsPage from '@/pages/Analytics';
import OperationsDashboardPage from '@/pages/OperationsDashboard';
import GpsTrackingPage from '@/pages/GpsTracking';
import NotificationsPage from '@/pages/Notifications';
import RegisterPage from '@/pages/Register';
import TicketsPage from '@/pages/Tickets';
import LandingPage from '@/pages/Landing';

function OperationsLayoutWithAlerts() {
  const { metrics } = useOperationsDashboardContext();
  return <OperationsLayout alertCount={metrics.alertCount} />;
}

function ProtectedOperationsRoutes() {
  return (
    <ProtectedRoute>
      <OperationsDashboardProvider>
        <OperationsLayoutWithAlerts />
      </OperationsDashboardProvider>
    </ProtectedRoute>
  );
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
          element={<ProtectedOperationsRoutes />}
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
