import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoginModal } from '@/contexts/LoginModalContext';
import FadeIn from './FadeIn';

const routes = [
  {
    from: 'Mumbai',
    to: 'Pune',
    price: '₹450',
    duration: '3h 30m',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea4af?auto=format&fit=crop&w=600&q=80',
    alt: 'Mumbai to Pune express highway',
  },
  {
    from: 'Delhi',
    to: 'Jaipur',
    price: '₹380',
    duration: '5h 15m',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
    alt: 'Delhi to Jaipur route through Rajasthan',
  },
  {
    from: 'Bangalore',
    to: 'Mysore',
    price: '₹320',
    duration: '2h 45m',
    image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=600&q=80',
    alt: 'Bangalore to Mysore scenic route',
  },
  {
    from: 'Chennai',
    to: 'Coimbatore',
    price: '₹520',
    duration: '7h 00m',
    image: 'https://images.unsplash.com/photo-1587474260587-136574528176?auto=format&fit=crop&w=600&q=80',
    alt: 'Chennai to Coimbatore intercity travel',
  },
];

export default function PopularRoutes() {
  const { openLogin } = useLoginModal();

  return (
    <section id="routes" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Popular Routes</h2>
          <p className="mt-3 text-slate-600">
            Top intercity connections with daily departures and live seat availability
          </p>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map((route, i) => (
            <FadeIn key={`${route.from}-${route.to}`} delay={i * 0.08}>
              <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={route.image}
                    alt={route.alt}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                    {route.duration}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    {route.from}{' '}
                    <span className="font-normal text-slate-400">→</span> {route.to}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">Starting from</p>
                  <p className="text-2xl font-bold text-teal-600">{route.price}</p>
                  <Button
                    type="button"
                    onClick={() => openLogin('/dashboard')}
                    className="mt-4 w-full bg-teal-600 hover:bg-teal-700"
                  >
                    Book Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
