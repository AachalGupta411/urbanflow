import { motion } from 'framer-motion';

const activeRoutes = [
  { id: 'R-101', name: 'Central → Airport', vehicles: 24, color: '#3b82f6' },
  { id: 'R-202', name: 'Metro Line A', vehicles: 18, color: '#14b8a6' },
  { id: 'R-303', name: 'EV Green Corridor', vehicles: 12, color: '#10b981' },
];

const positions = [
  { x: 22, y: 45, route: 'R-101' },
  { x: 38, y: 62, route: 'R-101' },
  { x: 55, y: 35, route: 'R-202' },
  { x: 72, y: 58, route: 'R-202' },
  { x: 48, y: 78, route: 'R-303' },
  { x: 85, y: 42, route: 'R-303' },
];

export default function LiveCityMap() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Network Overview</p>
          <span className="text-xs font-medium text-emerald-600">54 vehicles active</span>
        </div>
      </div>

      <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-blue-50">
        <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="30" x2="100" y2="30" stroke="#94a3b8" strokeWidth="0.3" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="0.3" />
          <line x1="0" y1="70" x2="100" y2="70" stroke="#94a3b8" strokeWidth="0.3" />
          <line x1="25" y1="0" x2="25" y2="100" stroke="#94a3b8" strokeWidth="0.3" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#94a3b8" strokeWidth="0.3" />
          <line x1="75" y1="0" x2="75" y2="100" stroke="#94a3b8" strokeWidth="0.3" />
        </svg>

        {positions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 ring-2 ring-white shadow-md"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
          />
        ))}
      </div>

      <div className="space-y-2 border-t border-slate-100 p-4">
        {activeRoutes.map((route) => (
          <div key={route.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: route.color }} />
              <span className="font-medium text-slate-800">{route.id}</span>
              <span className="text-slate-500">{route.name}</span>
            </div>
            <span className="font-semibold text-slate-700">{route.vehicles} units</span>
          </div>
        ))}
      </div>
    </div>
  );
}
