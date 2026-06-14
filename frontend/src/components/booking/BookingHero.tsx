import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Calendar, MapPin, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type TripType = 'oneway' | 'roundtrip';

export default function BookingHero() {
  const [tripType, setTripType] = useState<TripType>('oneway');
  const [from, setFrom] = useState('Mumbai');
  const [to, setTo] = useState('Pune');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[520px] items-center gap-8 py-10 lg:grid-cols-2 lg:gap-12 lg:py-16">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <span className="mb-4 inline-block rounded-full bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
              City Transit & Intercity Travel
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Smart Travel Starts with{' '}
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                UrbanFlow
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Book tickets, track buses in real time, discover routes, and travel smarter across
              the city.
            </p>
          </motion.div>

          {/* Hero bus image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-slate-300/50">
              <img
                src="https://images.unsplash.com/photo-1570125909232-e097023bd6c8?auto=format&fit=crop&w=900&q=80"
                alt="Modern intercity bus on a scenic highway"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-white bg-white px-5 py-4 shadow-xl">
              <p className="text-xs font-medium text-slate-500">Buses running now</p>
              <p className="text-2xl font-bold text-teal-600">2,847</p>
            </div>
          </motion.div>
        </div>

        {/* Mobile hero image */}
        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl shadow-lg lg:hidden">
          <img
            src="https://images.unsplash.com/photo-1570125909232-e097023bd6c8?auto=format&fit=crop&w=800&q=80"
            alt="Modern intercity bus"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Floating booking card */}
        <motion.div
          id="booking"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-20 -mt-4 mb-16 lg:-mt-20"
        >
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-6 lg:p-8"
          >
            <div className="mb-6 flex gap-2">
              {(['oneway', 'roundtrip'] as TripType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTripType(type)}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-semibold transition',
                    tripType === type
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {type === 'oneway' ? 'One Way' : 'Round Trip'}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="from" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  From
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600" />
                  <Input
                    id="from"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="bg-slate-50 pl-10"
                    placeholder="Departure city"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="to" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  To
                </label>
                <div className="relative">
                  <ArrowRightLeft className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                  <Input
                    id="to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="bg-slate-50 pl-10"
                    placeholder="Destination city"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="date" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Travel Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-50 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="passengers" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Passengers
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="passengers"
                    type="number"
                    min={1}
                    max={10}
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="bg-slate-50 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <Button
                  type="submit"
                  className="h-11 w-full bg-gradient-to-r from-teal-600 to-blue-600 text-base shadow-lg shadow-teal-600/20 hover:from-teal-500 hover:to-blue-500"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
