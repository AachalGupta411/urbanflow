import { Quote } from 'lucide-react';
import FadeIn from './FadeIn';

const testimonials = [
  {
    role: 'Transportation Authority',
    name: 'Metropolitan Transit Commission',
    quote: 'UrbanFlow gave us unified visibility across 250 routes. Our control room reduced incident response time by 40% in the first quarter.',
    author: 'Director of Operations',
  },
  {
    role: 'Passengers',
    name: 'Daily Commuter Program',
    quote: 'Real-time alerts and mobile ticketing eliminated uncertainty during peak hours. Passengers finally trust the schedule again.',
    author: 'Citizen Advisory Board',
  },
  {
    role: 'Fleet Operators',
    name: 'Regional Bus Consortium',
    quote: 'GPS telemetry and automated dispatch recommendations helped us optimize headways without adding vehicles to the road.',
    author: 'Fleet Management Lead',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Trusted By</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for every stakeholder
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <FadeIn key={t.role} delay={i * 0.1}>
              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition hover:border-blue-200 hover:shadow-lg">
                <Quote className="h-8 w-8 text-blue-200" />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">{t.role}</p>
                  <p className="mt-1 font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.author}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
