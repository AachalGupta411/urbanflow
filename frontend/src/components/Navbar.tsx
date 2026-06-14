import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/tracking', label: 'GPS Tracking' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const { passenger, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="brand">
          <span className="brand-icon" aria-hidden="true">UF</span>
          <span>
            <strong>UrbanFlow</strong>
            <small>Public Transit Platform</small>
          </span>
        </NavLink>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-user">
          <div className="user-chip">
            <span className="user-avatar" aria-hidden="true">
              {passenger?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
            <div>
              <strong>{passenger?.full_name}</strong>
              <small>{passenger?.email}</small>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
