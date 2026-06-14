import { ArrowUpRight, Bell, Route, Wrench } from 'lucide-react';
import FadeIn from './FadeIn';

const news = [
  {
    icon: Route,
    tag: 'Service Update',
    date: 'Jun 12, 2026',
    title: 'R-101 Express corridor frequency increased to 5-minute headways',
    summary: 'Peak-hour capacity boost across the Central–Airport corridor effective immediately.',
  },
  {
    icon: Bell,
    tag: 'Announcement',
    date: 'Jun 10, 2026',
    title: 'Real-time delay notifications now available in passenger app',
    summary: 'Kafka-powered alerts deliver sub-second notification to registered commuters.',
  },
  {
    icon: Wrench,
    tag: 'Maintenance',
    date: 'Jun 8, 2026',
    title: 'Scheduled maintenance: Metro Line A — off-peak hours only',
    summary: 'Track work completed with zero impact to peak service levels.',
  },
];

export default function NewsSection() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">News & Updates</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Service announcements</h2>
          </div>
          <a href="#contact" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            View all updates →
          </a>
        </FadeIn>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {news.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <article className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    <item.icon className="h-3 w-3" />
                    {item.tag}
                  </span>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900 group-hover:text-blue-700">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-600 opacity-0 transition group-hover:opacity-100">
                  Read more <ArrowUpRight className="h-3 w-3" />
                </span>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
