import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FadeIn from './FadeIn';
import LiveCityMap from './LiveCityMap';

export default function LiveTrackingSection() {
  return (
    <section id="tracking" className="bg-gradient-to-b from-white to-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">Real-Time Tracking</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              See every vehicle on the map
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              GPS telemetry streams from 12,000+ connected units. Operations teams and passengers access the same authoritative position data — updated every few seconds.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {['Live bus & metro positions', 'Route deviation detection', 'Historical track replay', 'Kafka-powered event pipeline'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/login" className="mt-8 inline-block">
              <Button variant="teal" size="lg" className="group">
                Open Live Map
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </FadeIn>

          <FadeIn delay={0.12} direction="left">
            <LiveCityMap />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
