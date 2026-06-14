import FadeIn from './FadeIn';

const stats = [
  { value: '5M+', label: 'Daily Riders', detail: 'Across bus, metro & EV networks' },
  { value: '12,000+', label: 'Vehicles', detail: 'GPS-enabled fleet units' },
  { value: '250+', label: 'Routes', detail: 'Optimized corridor coverage' },
  { value: '99.98%', label: 'Uptime', detail: 'Enterprise SLA compliance' },
];

export default function StatsSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/80 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.08}>
            <div className="text-center lg:text-left">
              <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-blue-600">{stat.label}</p>
              <p className="mt-1 hidden text-xs text-slate-500 sm:block">{stat.detail}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
