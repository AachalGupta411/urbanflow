import {
  BarChart3,
  Bell,
  Bus,
  MapPin,
  Ticket,
  Zap,
} from 'lucide-react';
import FadeIn from './FadeIn';

const features = [
  {
    icon: Ticket,
    title: 'Smart Ticketing',
    description: 'Digital fare collection, validation, and booking across bus, metro, and EV services.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: MapPin,
    title: 'Real-Time GPS Tracking',
    description: 'Live vehicle positions, route adherence, and telemetry for operations teams.',
    color: 'from-teal-500 to-teal-600',
  },
  {
    icon: Bus,
    title: 'Metro Management',
    description: 'Coordinate multi-modal networks with unified scheduling and capacity planning.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Bell,
    title: 'Passenger Notifications',
    description: 'Automated delay alerts, route changes, and system announcements via Kafka events.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: BarChart3,
    title: 'Route Analytics',
    description: 'Utilization metrics, demand forecasting, and performance dashboards for authorities.',
    color: 'from-blue-600 to-teal-500',
  },
  {
    icon: Zap,
    title: 'EV Fleet Monitoring',
    description: 'Track electric vehicle health, charging status, and green route efficiency.',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function FeaturesSection() {
  return (
    <section id="ticketing" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">Platform Capabilities</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for transportation authorities
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Enterprise modules designed for smart mobility — not tourism. Manage the full transit lifecycle from one cloud-native platform.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.06}>
              <article className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
                <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white shadow-lg`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
