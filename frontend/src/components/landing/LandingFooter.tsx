import { Link } from 'react-router-dom';
import { Globe, Mail, Share2, Train } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Live Tracking', href: '#tracking' },
    { label: 'Ticketing', href: '#ticketing' },
    { label: 'Analytics', href: '#analytics' },
    { label: 'Operations Center', href: '/login' },
  ],
  Company: [
    { label: 'About UrbanFlow', href: '#home' },
    { label: 'Contact', href: '#contact' },
    { label: 'Careers', href: '#contact' },
    { label: 'Security', href: '#contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '#contact' },
    { label: 'API Status', href: '#contact' },
    { label: 'System Status', href: '#contact' },
    { label: 'Support', href: '#contact' },
  ],
};

export default function LandingFooter() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                <Train className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold text-white">UrbanFlow</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Intelligent public transportation platform for modern cities. Built for authorities, operators, and millions of daily riders.
            </p>
            <div className="mt-6 flex gap-3">
              {[Share2, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#contact"
                  className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:text-white"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">{title}</h4>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-400 transition hover:text-teal-400">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">© 2026 UrbanFlow. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-emerald-400">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
