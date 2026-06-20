const TOKEN_KEY = 'urbanflow_token';
const PASSENGER_KEY = 'urbanflow_passenger';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredPassenger<T>(): T | null {
  const raw = localStorage.getItem(PASSENGER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredPassenger<T>(passenger: T): void {
  localStorage.setItem(PASSENGER_KEY, JSON.stringify(passenger));
}

export function clearStoredPassenger(): void {
  localStorage.removeItem(PASSENGER_KEY);
}

export function clearAuthStorage(): void {
  clearToken();
  clearStoredPassenger();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: {
          error?: string;
          message?: string;
          errors?: Array<{ msg?: string; message?: string }>;
        };
      };
      code?: string;
      message?: string;
    };

    const data = axiosError.response?.data;
    if (data?.errors?.length) {
      return data.errors.map((e) => e.msg || e.message).filter(Boolean).join('. ');
    }
    if (data?.error) return data.error;
    if (data?.message) return data.message;

    if (axiosError.response?.status === 500) {
      return 'Server error. Make sure the UrbanFlow backend services are running.';
    }
  }

  if (typeof error === 'object' && error !== null) {
    const axiosError = error as { code?: string; message?: string; response?: unknown };
    if (!axiosError.response) {
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        return 'Cannot reach the server. Start the backend with ./scripts/dev-local.sh or ./scripts/setup-local.sh';
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
