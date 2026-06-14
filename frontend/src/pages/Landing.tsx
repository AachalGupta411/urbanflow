import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BookingFooter,
  BookingHero,
  BookingNavbar,
  LiveTrackingPreview,
  MobileAppPromo,
  NewsUpdates,
  PopularRoutes,
  WhyChooseUs,
} from '@/components/booking';
import LoginModal from '@/components/booking/LoginModal';
import { useLoginModal } from '@/contexts/LoginModalContext';

interface LandingPageProps {
  /** When true, opens the login modal immediately (used by /login route). */
  openLoginOnMount?: boolean;
}

export default function LandingPage({ openLoginOnMount = false }: LandingPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useLoginModal();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const state = location.state as { openLogin?: boolean; from?: string } | null;

    if (openLoginOnMount || state?.openLogin) {
      handled.current = true;
      openLogin(state?.from ?? '/dashboard');

      if (openLoginOnMount) {
        navigate('/', { replace: true, state: {} });
      } else if (state?.openLogin) {
        navigate('/', { replace: true, state: {} });
      }
    }
  }, [openLoginOnMount, location.state, openLogin, navigate]);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <BookingNavbar />
      <main>
        <BookingHero />
        <PopularRoutes />
        <WhyChooseUs />
        <LiveTrackingPreview />
        <NewsUpdates />
        <MobileAppPromo />
      </main>
      <BookingFooter />
      <LoginModal />
    </div>
  );
}
