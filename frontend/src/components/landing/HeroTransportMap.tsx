import { motion } from 'framer-motion';
import { Bus, Train } from 'lucide-react';

const routes = [
  { id: 'r1', d: 'M 40 180 Q 120 120 200 140 T 360 100', color: '#3b82f6', label: 'R-101' },
  { id: 'r2', d: 'M 60 240 Q 180 200 280 220 T 420 180', color: '#14b8a6', label: 'R-202' },
  { id: 'r3', d: 'M 80 80 Q 200 60 320 90 T 440 70', color: '#6366f1', label: 'R-303' },
];

const vehicles = [
  { id: 'v1', x: 120, y: 130, icon: Bus, color: 'bg-blue-600', delay: 0 },
  { id: 'v2', x: 260, y: 200, icon: Train, color: 'bg-teal-600', delay: 0.8 },
  { id: 'v3', x: 340, y: 95, icon: Bus, color: 'bg-indigo-600', delay: 1.6 },
];

export default function HeroTransportMap() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/50 shadow-2xl shadow-blue-900/10">
      <div className="absolute inset-0 opacity-40">
        <svg className="h-full w-full" viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="480" height="320" fill="url(#grid)" />
          {routes.map((route) => (
            <path
              key={route.id}
              d={route.d}
              fill="none"
              stroke={route.color}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.6"
            />
          ))}
        </svg>
      </div>

      {vehicles.map((vehicle) => (
        <motion.div
          key={vehicle.id}
          className="absolute"
          style={{ left: `${(vehicle.x / 480) * 100}%`, top: `${(vehicle.y / 320) * 100}%` }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: vehicle.delay, ease: 'easeInOut' }}
        >
          <div className={`flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${vehicle.color} text-white shadow-lg ring-4 ring-white`}>
            <vehicle.icon className="h-4 w-4" />
          </div>
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow">
            Live
          </span>
        </motion.div>
      ))}

      <div className="absolute bottom-4 left-4 rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <p className="text-xs font-medium text-slate-500">Active vehicles</p>
        <p className="text-2xl font-bold text-slate-900">12,047</p>
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Network Online
      </div>
    </div>
  );
}
