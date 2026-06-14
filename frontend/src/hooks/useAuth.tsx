import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as passengerApi from '@/services/passengerApi';
import type { Passenger } from '@/types';
import {
  clearAuthStorage,
  getStoredPassenger,
  getToken,
  setStoredPassenger,
  setToken,
} from '@/utils/token';

interface AuthContextValue {
  passenger: Passenger | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: passengerApi.RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [passenger, setPassenger] = useState<Passenger | null>(() => getStoredPassenger<Passenger>());
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState(true);

  const persistAuth = useCallback((authToken: string, authPassenger: Passenger) => {
    setToken(authToken);
    setStoredPassenger(authPassenger);
    setTokenState(authToken);
    setPassenger(authPassenger);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setTokenState(null);
    setPassenger(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!getToken()) {
      logout();
      return;
    }
    const profile = await passengerApi.getProfile();
    setStoredPassenger(profile);
    setPassenger(profile);
  }, [logout]);

  useEffect(() => {
    const bootstrap = async () => {
      const existingToken = getToken();
      if (!existingToken) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await passengerApi.getProfile();
        setPassenger(profile);
        setStoredPassenger(profile);
      } catch {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await passengerApi.login({ email, password });
      persistAuth(result.token, result.passenger);
    },
    [persistAuth]
  );

  const register = useCallback(
    async (payload: passengerApi.RegisterPayload) => {
      const result = await passengerApi.register(payload);
      persistAuth(result.token, result.passenger);
    },
    [persistAuth]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      passenger,
      token,
      isAuthenticated: Boolean(token && passenger),
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [passenger, token, isLoading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
