import React from 'react';
import { useCinema } from '../context/CinemaContext';
import { Armchair, ChefHat, Utensils } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    screen,
    seat,
    setIsSeatModalOpen,
    activeOrder,
  } = useCinema();

  const isPreparing = activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-13 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Zone 1: Brand Wordmark & Logo */}
        <button
          onClick={() => setCurrentView('welcome')}
          className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D9F20A] rounded-lg p-0.5"
          aria-label="Adaira Studios Home"
        >
          <img
            src="/assets/brand/adaira-logo.png"
            alt="Adaira Studios Logo"
            className="h-6 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
          />
          <div className="hidden xs:flex flex-col">
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#8DBBDA] uppercase font-semibold font-sans">
              STUDIOS
            </span>
            <span className="text-[11px] sm:text-xs text-white/70 font-medium -mt-0.5">
              In-Seat Dining
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
          <button
            onClick={() => setCurrentView('menu')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap min-h-[38px] sm:min-h-[42px] ${
              currentView === 'menu'
                ? 'bg-white/10 text-[#D9F20A] font-semibold border border-[#D9F20A]/30 glow-lime-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>

          {isPreparing && (
            <button
              onClick={() => setCurrentView('tracking')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap min-h-[38px] sm:min-h-[42px] ${
                currentView === 'tracking'
                  ? 'bg-white/10 text-[#8DBBDA] font-semibold border border-[#8DBBDA]/40 glow-sky'
                  : 'text-[#8DBBDA] hover:bg-white/5'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9F20A] animate-ping" />
              <span>Track</span>
            </button>
          )}

          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all whitespace-nowrap min-h-[38px] sm:min-h-[42px] ${
              currentView === 'admin'
                ? 'bg-white/10 text-[#D9F20A] font-semibold border border-[#D9F20A]/30 glow-lime-sm'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kitchen</span> KDS
          </button>
        </nav>

        {/* Zone 3: Seat Identifier */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSeatModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#D9F20A]/50 transition-all text-xs font-medium text-white group min-h-[38px] sm:min-h-[42px]"
            title="Change screen or seat"
            aria-label="Current seat selection"
          >
            <Armchair className="w-3.5 h-3.5 text-[#D9F20A] group-hover:scale-110 transition-transform shrink-0" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[9px] text-[#8DBBDA] uppercase tracking-wider font-semibold">
                {screen}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
                Seat {seat}
              </span>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};

