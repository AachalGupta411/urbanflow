import {
  Bell,
  Bus,
  Clock,
  MapPinned,
  ShieldCheck,
  Train,
} from 'lucide-react';
import FadeIn from './FadeIn';

const features = [
  {
    icon: MapPinned,
    title: 'Real-Time GPS Tracking',
    description: 'Follow your bus live on the map with accurate ETAs and stop-level updates.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Digital Ticketing',
    description: 'Book and store tickets digitally with QR codes and instant confirmation.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Bus,
    title: 'Smart Route Planning',
    description: 'Compare routes, travel times, and fares across bus and metro networks.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Train,
    title: 'Metro & Bus Integration',
    description: 'Plan seamless multimodal journeys with unified ticketing and transfers.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Bell,
    title: 'Passenger Alerts',
    description: 'Get notified about delays, diversions, and service changes in real time.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Clock,
    title: '24/7 Service Availability',
    description: 'Book tickets and access support anytime — night routes and early departures included.',
    color: 'bg-blue-50 text-blue-600',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Why Choose UrbanFlow</h2>
          <p className="mt-3 max-w-2xl mx-auto text-slate-600">
            Everything you need for comfortable, reliable, and smarter city travel
          </p>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-teal-100 hover:shadow-lg">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
