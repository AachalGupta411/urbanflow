import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import FadeIn from './FadeIn';

export default function MobileAppPromo() {
  return (
    <section className="overflow-hidden bg-gradient-to-br from-teal-600 to-blue-700 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-100">
              <Smartphone className="h-3.5 w-3.5" />
              Mobile App
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Travel smarter with the UrbanFlow app
            </h2>
            <p className="mt-4 max-w-lg text-lg text-teal-100">
              Book tickets, track buses live, receive alerts, and manage your journeys — all from
              your phone.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-white shadow-lg transition hover:bg-slate-800"
                aria-label="Download on the App Store"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] leading-none opacity-80">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-white shadow-lg transition hover:bg-slate-800"
                aria-label="Get it on Google Play"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5Z" />
                  <path fill="#FBBC04" d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z" />
                  <path fill="#4285F4" d="M20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81Z" />
                  <path fill="#34A853" d="M6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] leading-none opacity-80">Get it on</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="relative flex justify-center lg:justify-end">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="relative mx-auto w-[260px] rounded-[2.5rem] border-[6px] border-slate-800 bg-slate-900 p-2 shadow-2xl sm:w-[280px]">
                <div className="overflow-hidden rounded-[2rem] bg-white">
                  <div className="bg-gradient-to-br from-teal-500 to-blue-600 px-4 py-6 text-white">
                    <p className="text-xs opacity-80">UrbanFlow</p>
                    <p className="mt-1 text-lg font-bold">Track Bus UF-101</p>
                    <p className="text-sm text-teal-100">ETA · 12 minutes</p>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="h-24 rounded-xl bg-slate-100" />
                    <div className="flex gap-2">
                      <div className="h-8 flex-1 rounded-lg bg-teal-100" />
                      <div className="h-8 flex-1 rounded-lg bg-blue-100" />
                    </div>
                    <div className="h-10 rounded-xl bg-teal-600" />
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 top-1/4 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                <p className="text-xs text-teal-100">Live tracking</p>
                <p className="font-bold text-white">Active</p>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
