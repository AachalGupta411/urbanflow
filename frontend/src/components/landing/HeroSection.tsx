import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FadeIn from './FadeIn';
import HeroTransportMap from './HeroTransportMap';

export default function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-white pb-20 pt-12 sm:pt-16 lg:pb-28 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.08),transparent_50%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Smart City Mobility Platform
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
            Intelligent Public Transportation for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Modern Cities
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Track buses, manage metro networks, purchase tickets, and receive real-time transit
            updates from a single platform built for transportation authorities and millions of
            daily commuters.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/login">
              <Button size="lg" className="group">
                Track Route
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Book Ticket
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-600" />
              Real-time fleet telemetry
            </div>
            <div className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span className="hidden sm:inline">Enterprise-grade uptime & security</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} direction="left">
          <HeroTransportMap />
        </FadeIn>
      </div>
    </section>
  );
}
