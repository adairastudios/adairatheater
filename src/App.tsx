import React from 'react';
import { CinemaProvider, useCinema } from './context/CinemaContext';
import { BackgroundGlows } from './components/BackgroundGlows';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MenuScreen } from './components/MenuScreen';
import { OrderTrackingScreen } from './components/OrderTrackingScreen';
import { AdminKitchenScreen } from './components/AdminKitchenScreen';
import { SeatSelectionModal } from './components/SeatSelectionModal';
import { CartBottomSheet } from './components/CartBottomSheet';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentProcessingModal } from './components/PaymentProcessingModal';
import { UsherHelpModal } from './components/UsherHelpModal';

const CinemaAppContent: React.FC = () => {
  const { currentView } = useCinema();

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-white selection:bg-[#D9F20A] selection:text-black">
      {/* Dynamic blurred lime and sky ambient background orbs */}
      <BackgroundGlows />

      {/* Top Bar Header */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1 relative z-10">
        {currentView === 'welcome' && <WelcomeScreen />}
        {currentView === 'menu' && <MenuScreen />}
        {currentView === 'tracking' && <OrderTrackingScreen />}
        {currentView === 'admin' && <AdminKitchenScreen />}
      </main>

      {/* Overlays & Modals */}
      <SeatSelectionModal />
      <CartBottomSheet />
      <CheckoutModal />
      <PaymentProcessingModal />
      <UsherHelpModal />
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
