import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, Train } from 'lucide-react';

const footerLinks = {
  Routes: ['Mumbai → Pune', 'Delhi → Jaipur', 'Bangalore → Mysore', 'Chennai → Coimbatore'],
  Company: ['About UrbanFlow', 'Careers', 'Partners', 'Press'],
  Support: ['Help Center', 'Ticket Refunds', 'Lost & Found', 'Accessibility'],
};

export default function BookingFooter() {
  return (
    <footer id="contact" className="border-t border-slate-100 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white">
                <Train className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold text-white">
                Urban<span className="text-teal-400">Flow</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              India&apos;s smart transportation platform for booking tickets, tracking buses, and
              planning seamless city travel.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a href="mailto:support@urbanflow.gov" className="flex items-center gap-2 hover:text-teal-400">
                <Mail className="h-4 w-4" />
                support@urbanflow.gov
              </a>
              <a href="tel:+911800425352" className="flex items-center gap-2 hover:text-teal-400">
                <Phone className="h-4 w-4" />
                1800-425-352 (24/7)
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-sm hover:text-teal-400">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">© 2026 UrbanFlow. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {[Globe, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-teal-600 hover:text-white"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
