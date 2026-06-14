import { Calendar, ChevronRight } from 'lucide-react';
import FadeIn from './FadeIn';

const news = [
  {
    date: 'Jun 12, 2026',
    tag: 'Service Update',
    title: 'New Express Routes Added on Mumbai–Pune Corridor',
    excerpt:
      'Six new premium AC buses now operate hourly between Mumbai and Pune with reduced travel time.',
    image: 'https://images.unsplash.com/photo-1544620307-cf1550695a24?auto=format&fit=crop&w=500&q=80',
  },
  {
    date: 'Jun 10, 2026',
    tag: 'Metro Integration',
    title: 'Metro Line 3 Now Connected to UrbanFlow Ticketing',
    excerpt:
      'Passengers can book combined metro and bus tickets in a single transaction through the app.',
    image: 'https://images.unsplash.com/photo-1519005059706-2e0222277848?auto=format&fit=crop&w=500&q=80',
  },
  {
    date: 'Jun 8, 2026',
    tag: 'Safety',
    title: 'Real-Time Crowd Alerts Rolled Out Across 40 Routes',
    excerpt:
      'New passenger density indicators help commuters choose less crowded buses during peak hours.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=500&q=80',
  },
];

export default function NewsUpdates() {
  return (
    <section id="news" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">News & Updates</h2>
          <p className="mt-3 text-slate-600">Latest transportation announcements and service updates</p>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-3">
          {news.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                      {item.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {item.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold leading-snug text-slate-900">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.excerpt}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 transition hover:text-teal-700"
                  >
                    Read more
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
