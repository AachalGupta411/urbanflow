import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Train, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoginModal } from '@/contexts/LoginModalContext';
import { cn } from '@/lib/utils';

const links = [
  { href: '#home', label: 'Home' },
  { href: '#routes', label: 'Routes' },
  { href: '#tracking', label: 'Live Tracking' },
  { href: '#booking', label: 'Ticket Booking' },
  { href: '#news', label: 'News' },
  { href: '#contact', label: 'Contact' },
];

export default function BookingNavbar() {
  const [open, setOpen] = useState(false);
  const { openLogin } = useLoginModal();

  const handleLogin = () => {
    setOpen(false);
    openLogin('/dashboard');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20">
            <Train className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Urban<span className="text-teal-600">Flow</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-teal-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogin}
            className="hidden border-teal-600 text-teal-700 hover:bg-teal-50 sm:inline-flex"
          >
            Login
          </Button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={cn('border-t border-slate-100 bg-white lg:hidden', open ? 'block' : 'hidden')}>
        <nav className="flex flex-col gap-1 px-4 py-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700"
            >
              {link.label}
            </a>
          ))}
          <Button type="button" onClick={handleLogin} className="mt-2 w-full bg-teal-600 hover:bg-teal-700">
            Login
          </Button>
        </nav>
      </div>
    </header>
  );
}
