import { createContext, useContext, type ReactNode } from 'react';
import {
  useOperationsDashboard,
  type OperationsDashboardData,
} from '@/hooks/useOperationsDashboard';

type DashboardContextValue = OperationsDashboardData & {
  refresh: () => Promise<void>;
};

const OperationsDashboardContext = createContext<DashboardContextValue | null>(null);

export function OperationsDashboardProvider({ children }: { children: ReactNode }) {
  const dashboard = useOperationsDashboard(60000);

  return (
    <OperationsDashboardContext.Provider value={dashboard}>
      {children}
    </OperationsDashboardContext.Provider>
  );
}

export function useOperationsDashboardContext(): DashboardContextValue {
  const context = useContext(OperationsDashboardContext);
  if (!context) {
    throw new Error('useOperationsDashboardContext must be used within OperationsDashboardProvider');
  }
  return context;
}
