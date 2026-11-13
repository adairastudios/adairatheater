import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CinemaProvider, useCinema } from './context/CinemaContext';
import { BackgroundGlows } from './components/BackgroundGlows';
import { Header, BottomNav } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MenuScreen } from './components/MenuScreen';
import { OrderTrackingScreen } from './components/OrderTrackingScreen';
import { AdminKitchenScreen } from './components/AdminKitchenScreen';
import { SeatSelectionModal } from './components/SeatSelectionModal';
import { CartBottomSheet } from './components/CartBottomSheet';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentProcessingModal } from './components/PaymentProcessingModal';
import { UsherHelpModal } from './components/UsherHelpModal';
import { ProductDetailSheet } from './components/ProductDetailSheet';
import { ScanIntro } from './components/ScanIntro';

const CinemaAppContent: React.FC = () => {
  const { currentView } = useCinema();
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);

  // Every view starts at the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentView]);

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-ink selection:bg-lime selection:text-black">
      <BackgroundGlows />
      <ScanIntro onFinish={finishIntro} />

      {introDone && (
        <>
          <Header />

          <main className="flex-1 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {currentView === 'welcome' && <WelcomeScreen />}
                {currentView === 'menu' && <MenuScreen />}
                {currentView === 'tracking' && <OrderTrackingScreen />}
                {currentView === 'admin' && <AdminKitchenScreen />}
              </motion.div>
            </AnimatePresence>
          </main>

          <BottomNav />
          <ProductDetailSheet />
          <SeatSelectionModal />
          <CartBottomSheet />
          <CheckoutModal />
          <PaymentProcessingModal />
          <UsherHelpModal />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CinemaProvider>
      <CinemaAppContent />
    </CinemaProvider>
  );
}
