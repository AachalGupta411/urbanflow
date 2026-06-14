import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Mail, Train, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginModal } from '@/contexts/LoginModalContext';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/token';

export default function LoginModal() {
  const { isOpen, redirectTo, closeLogin } = useLoginModal();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('demo@urbanflow.edu');
  const [password, setPassword] = useState('demo12345');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      closeLogin();
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isOpen, closeLogin, navigate, redirectTo]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLogin();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>('input')?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, closeLogin]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      closeLogin();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    closeLogin();
    navigate('/register');
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-label="Close login dialog"
            onClick={closeLogin}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
          >
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-5 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Train className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-teal-100">
                      UrbanFlow
                    </p>
                    <h2 id="login-modal-title" className="text-lg font-bold">
                      Welcome Back
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeLogin}
                  className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-teal-100">
                Sign in to book tickets, track buses, and manage your journeys.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error ? (
                <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="modal-email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="modal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="modal-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/40"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-teal-600 hover:bg-teal-700"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="font-semibold text-teal-600 hover:text-teal-700"
                >
                  Create Account
                </button>
              </p>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
