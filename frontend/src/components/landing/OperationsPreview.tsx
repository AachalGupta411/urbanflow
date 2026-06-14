import { motion } from 'framer-motion';
import { Activity, Bus, Users } from 'lucide-react';
import FadeIn from './FadeIn';

export default function OperationsPreview() {
  return (
    <section id="analytics" className="overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Live Operations Center</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Command-center visibility for your entire network
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Monitor fleet health, ticketing volume, and passenger alerts from a unified operations dashboard — the same interface your control room uses daily.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="relative mx-auto mt-14 max-w-5xl">
          {/* Browser frame */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-4 flex-1 rounded-md bg-white px-3 py-1 text-xs text-slate-500">
                ops.urbanflow.gov/dashboard
              </span>
            </div>

            {/* Dashboard mock */}
            <div className="bg-[#0a0f1e] p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Operations Command Center</p>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">● Live</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Active Fleet', value: '847', color: 'border-blue-500/30 bg-blue-500/10' },
                  { label: 'Tickets Today', value: '12.4K', color: 'border-teal-500/30 bg-teal-500/10' },
                  { label: 'Passengers', value: '5.2M', color: 'border-emerald-500/30 bg-emerald-500/10' },
                  { label: 'Alerts', value: '3', color: 'border-amber-500/30 bg-amber-500/10' },
                ].map((m) => (
                  <div key={m.label} className={`rounded-lg border p-3 ${m.color}`}>
                    <p className="text-[10px] text-slate-400">{m.label}</p>
                    <p className="text-lg font-bold text-white">{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="col-span-2 h-32 rounded-lg bg-slate-800/80 sm:h-40" />
                <div className="h-32 rounded-lg bg-slate-800/80 sm:h-40" />
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <motion.div
            className="absolute -left-2 top-1/4 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:block lg:-left-8"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600"><Bus className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-slate-500">Fleet uptime</p>
                <p className="text-lg font-bold text-slate-900">99.98%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-2 bottom-1/4 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:block lg:-right-8"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal-100 p-2 text-teal-600"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-slate-500">Active riders</p>
                <p className="text-lg font-bold text-slate-900">142K now</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute right-8 top-0 hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 lg:flex lg:items-center lg:gap-2"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Activity className="h-3.5 w-3.5" />
            All systems operational
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
