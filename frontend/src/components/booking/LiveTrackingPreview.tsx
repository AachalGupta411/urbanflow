import { motion } from 'framer-motion';
import { Bus, Clock, MapPin } from 'lucide-react';
import FadeIn from './FadeIn';

const activeBuses = [
  { id: 'UF-101', route: 'Mumbai → Pune', eta: '12 min', status: 'On Time', left: '22%', top: '45%' },
  { id: 'UF-204', route: 'Delhi → Jaipur', eta: '8 min', status: 'On Time', left: '58%', top: '32%' },
  { id: 'UF-318', route: 'Bangalore → Mysore', eta: '18 min', status: 'Delayed', left: '72%', top: '62%' },
];

const routes = [
  { d: 'M 60 200 Q 180 140 300 160 T 520 120', color: '#14B8A6' },
  { d: 'M 80 280 Q 220 220 360 250 T 540 200', color: '#3B82F6' },
  { d: 'M 100 120 Q 240 80 380 100 T 560 70', color: '#6366F1' },
];

export default function LiveTrackingPreview() {
  return (
    <section id="tracking" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Live Tracking Preview</h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Monitor active buses, route status, and arrival times across the network in real time
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            2,847 buses active
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="relative aspect-[16/9] min-h-[320px] sm:min-h-[400px]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="track-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
                  </pattern>
                </defs>
                <rect width="600" height="340" fill="#f8fafc" />
                <rect width="600" height="340" fill="url(#track-grid)" />
                {routes.map((route, i) => (
                  <motion.path
                    key={i}
                    d={route.d}
                    fill="none"
                    stroke={route.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.7 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                  />
                ))}
              </svg>

              {activeBuses.map((bus, i) => (
                <motion.div
                  key={bus.id}
                  className="absolute"
                  style={{ left: bus.left, top: bus.top }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                >
                  <div className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg ring-4 ring-white">
                      <Bus className="h-4 w-4" />
                    </div>
                    <div className="mt-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
                      <p className="font-bold text-slate-900">{bus.id}</p>
                      <p className="text-slate-500">{bus.route}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-3 sm:left-auto sm:right-4 sm:w-auto">
                {activeBuses.map((bus) => (
                  <div
                    key={`eta-${bus.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/95 px-4 py-3 shadow-md backdrop-blur"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">ETA · {bus.id}</p>
                      <p className="font-bold text-slate-900">{bus.eta}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        bus.status === 'On Time'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {bus.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-white/95 px-4 py-2.5 shadow-md backdrop-blur">
                <MapPin className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-semibold text-slate-700">Metro Region · Live View</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
