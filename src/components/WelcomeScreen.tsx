import React from 'react';
import { useCinema } from '../context/CinemaContext';
import { Armchair, Sparkles, Clock, ShieldCheck, ArrowRight, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

export const WelcomeScreen: React.FC = () => {
  const {
    theatre,
    screen,
    seat,
    hasSeatFromUrl,
    setIsSeatModalOpen,
    setCurrentView,
  } = useCinema();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-between py-4 sm:py-6 px-3 sm:px-6 max-w-4xl mx-auto">
      {/* Top Welcome Lockup */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center pt-2 sm:pt-6"
      >
        {/* Brand Monogram Logo */}
        <div className="inline-block relative mb-3 sm:mb-5">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#D9F20A]/15 blur-xl rounded-full" />
            <img
              src="/assets/brand/adaira-logo.png"
              alt="Adaira Studios Logo"
              className="relative w-36 sm:w-56 h-auto mx-auto object-contain drop-shadow-[0_8px_20px_rgba(217,242,10,0.2)]"
            />
          </motion.div>
        </div>

        {/* Subtitle / Venue Label */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] text-[#8DBBDA] uppercase font-sans">
            VIP CINEMA IN-SEAT DINING
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-snug max-w-xl mx-auto text-balance">
          Order without missing a single scene.
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
          Fresh artisanal popcorn, hot gourmet meals, and chilled craft sips hand-delivered straight to your recliner.
        </p>

        {/* Detected Seat Badge Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-4 sm:mt-5 inline-flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 p-2.5 sm:p-3.5 px-3.5 sm:px-5 rounded-2xl glass-panel-elevated border border-white/15"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D9F20A]/15 border border-[#D9F20A]/30 flex items-center justify-center text-[#D9F20A] shrink-0">
              <Armchair className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[9px] text-[#8DBBDA] uppercase font-bold tracking-wider block leading-none">
                {theatre}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide mt-0.5 block">
                {screen} <span className="text-white/40">·</span> Seat {seat}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-white/10 pt-1 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-center">
            <button
              onClick={() => setIsSeatModalOpen(true)}
              className="text-[11px] text-[#8DBBDA] hover:text-[#D9F20A] flex items-center gap-1.5 py-0.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors min-h-[30px]"
            >
              <Edit3 className="w-3 h-3" />
              <span>{hasSeatFromUrl ? 'Change Seat' : 'Choose Seat'}</span>
            </button>
          </div>
        </motion.div>

        {/* PRIMARY HERO CTA: View Cinema Menu & Order immediately above the fold */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4 sm:mt-5 max-w-sm sm:max-w-md mx-auto w-full"
        >
          <button
            onClick={() => setCurrentView('menu')}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#D9F20A] text-black font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-[0.98] transition-all glow-lime shadow-xl shadow-[#D9F20A]/20 min-h-[48px] sm:min-h-[52px]"
          >
            <span>View Cinema Menu & Order</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5]" />
          </button>

          {/* Quick Categories Bar */}
          <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap text-[11px] text-white/70">
            <span className="text-white/40 text-[10px] uppercase font-semibold mr-1">Quick Jump:</span>
            {['Popcorn', 'Snacks', 'Meals', 'Beverages', 'Combos'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCurrentView('menu')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 hover:text-[#D9F20A] border border-white/10 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Hero Showcase Card with Photography (Clickable to Menu) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        onClick={() => setCurrentView('menu')}
        className="my-5 sm:my-6 relative rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-white/15 group cursor-pointer hover:border-[#D9F20A]/40 transition-all"
        title="Tap to browse menu"
      >
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
          <img
            src="/assets/images/hero-cinema-dining.jpg"
            alt="VIP Cinema In-Seat Dining Experience"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          {/* Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-[#07090F]/50 to-transparent" />
          
          <div className="absolute top-3 right-3 z-10 backdrop-blur-md bg-black/60 px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-bold text-[#D9F20A] flex items-center gap-1">
            <span>Tap to Open Menu</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Overlay Perks Strip */}
        <div className="p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 border-t border-white/10 relative z-10 bg-[#07090F]/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D9F20A] shrink-0" />
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">Artisanal Kitchen</h4>
              <p className="text-[10px] sm:text-[11px] text-white/60">Crafted fresh on order</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="w-3.5 h-3.5 text-[#8DBBDA] shrink-0" />
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">12-Min Delivery</h4>
              <p className="text-[10px] sm:text-[11px] text-white/60">Discreet seat drop-off</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D9F20A] shrink-0" />
            <div className="text-left">
              <h4 className="text-xs font-bold text-white">Contactless Pay</h4>
              <p className="text-[10px] sm:text-[11px] text-white/60">UPI, Cards & Apple Pay</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
