import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FadeIn from './FadeIn';

export default function RouteSearchSection() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('Central Station');
  const [to, setTo] = useState('International Airport');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [passengers, setPassengers] = useState(1);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate('/login', {
      state: {
        from: '/tickets',
        search: { from, to, date, passengers },
      },
    });
  };

  return (
    <section id="routes" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Trip Planner</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Search routes across the network
          </h2>
          <p className="mt-4 text-slate-600">
            Plan multimodal journeys with live schedule integration and instant ticket booking.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mx-auto mt-10 max-w-4xl">
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" /> From
                </span>
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" /> To
                </span>
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Calendar className="h-3.5 w-3.5" /> Date
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Users className="h-3.5 w-3.5" /> Passengers
                </span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </label>
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
              <Search className="h-4 w-4" />
              Search Routes & Book
            </Button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}
