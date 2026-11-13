import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCinema } from '../context/CinemaContext';
import { Armchair, ChevronDown, ShoppingBag, Home, Utensils, Radio, BellRing, ChefHat } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

type View = 'welcome' | 'menu' | 'tracking' | 'admin';

export interface NavItem {
  key: View | 'help';
  label: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'welcome', label: 'Home', icon: <Home className="w-[18px] h-[18px]" /> },
  { key: 'menu', label: 'Menu', icon: <Utensils className="w-[18px] h-[18px]" /> },
  { key: 'tracking', label: 'Track', icon: <Radio className="w-[18px] h-[18px]" /> },
  { key: 'help', label: 'Help', icon: <BellRing className="w-[18px] h-[18px]" /> },
  { key: 'admin', label: 'Kitchen', icon: <ChefHat className="w-[18px] h-[18px]" /> },
];

/** Shared nav state used by the top bar (desktop) and the bottom tab bar (phones). */
export const useNav = () => {
  const { currentView, setCurrentView, setIsUsherModalOpen, isUsherModalOpen, activeOrder } = useCinema();
  const isLive = !!activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled';
  const isActive = (key: NavItem['key']) => (key === 'help' ? isUsherModalOpen : !isUsherModalOpen && key === currentView);
  const go = (key: NavItem['key']) => (key === 'help' ? setIsUsherModalOpen(true) : setCurrentView(key));
  return { isActive, go, isLive };
};

const LiveDot: React.FC = () => (
  <span className="absolute -top-0.5 -right-0.5 flex w-2.5 h-2.5">
    <span className="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping" />
    <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
  </span>
);

/* ---------------------------------------------------------------- */
/* Top bar: brand, desktop links, tray and seat. Slides away on scroll down. */
/* ---------------------------------------------------------------- */
export const Header: React.FC = () => {
  const { currentView, setCurrentView, screen, seat, setIsSeatModalOpen, cartCount, setIsCartSheetOpen, navHidden } = useCinema();
  const { isActive, go, isLive } = useNav();
  const isAdmin = currentView === 'admin';

  return (
    <motion.header
      initial={false}
      animate={{ y: navHidden ? '-100%' : '0%' }}
      transition={{ duration: 0.45, ease: EASE }}
      className={`sticky top-0 z-40 w-full border-b ${isAdmin ? 'bg-[#0B0E16] border-white/10' : 'frosted-white border-line'}`}
    >
      <div className={`${isAdmin ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3`}>
        <button
          onClick={() => setCurrentView('welcome')}
          className="flex items-center shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
          aria-label="Adaira Studios home"
        >
          <img
            src={isAdmin ? '/assets/brand/adaira-logo.png' : '/assets/brand/adaira-logo-dark.png'}
            alt="Adaira Studios"
            className="h-[26px] sm:h-7 w-auto object-contain"
          />
        </button>

        {/* Desktop links (phones use the bottom tab bar) */}
        <nav className={`hidden md:flex items-center gap-1 p-1 rounded-full ${isAdmin ? 'bg-white/5' : 'bg-[#F1F1F3]'}`}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.key);
            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                className={`relative flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[13px] font-semibold transition-colors ${
                  active ? 'text-ink' : isAdmin ? 'text-white/60 hover:text-white' : 'text-muted hover:text-ink'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="desktop-nav-pill"
                    className="absolute inset-0 rounded-full bg-lime"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">
                  {item.icon}
                  {item.key === 'tracking' && isLive && <LiveDot />}
                </span>
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {!isAdmin && (
            <button
              onClick={() => setIsCartSheetOpen(true)}
              className="relative w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center text-ink hover:border-black/15 transition-colors"
              aria-label={`Open tray, ${cartCount} items`}
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-lime text-ink text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          )}

          <button
            onClick={() => setIsSeatModalOpen(true)}
            className={`flex items-center gap-2 pl-1.5 pr-3 h-10 rounded-full transition-colors ${
              isAdmin ? 'bg-white/10 text-white' : 'bg-white border border-line text-ink hover:border-black/15'
            }`}
            title="Change screen or seat"
          >
            <span className="w-7 h-7 rounded-full bg-lime flex items-center justify-center shrink-0">
              <Armchair className="w-3.5 h-3.5 text-ink" />
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className={`text-[9px] font-semibold uppercase tracking-wider ${isAdmin ? 'text-white/60' : 'text-muted'}`}>{screen}</span>
              <span className="text-[13px] font-bold mt-0.5">Seat {seat}</span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 ${isAdmin ? 'text-white/50' : 'text-faint'}`} />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

/* ---------------------------------------------------------------- */
/* Bottom tab bar for phones. Slides down on scroll down.            */
/* ---------------------------------------------------------------- */
export const BottomNav: React.FC = () => {
  const { navHidden } = useCinema();
  const { isActive, go, isLive } = useNav();

  const spring = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 } as const;

  return (
    <motion.nav
      initial={false}
      animate={{ y: navHidden ? 'calc(100% + 28px)' : '0%', opacity: navHidden ? 0 : 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="md:hidden fixed inset-x-0 z-40 px-4 pointer-events-none"
      style={{ bottom: 'calc(10px + env(safe-area-inset-bottom))' }}
      aria-label="Primary"
    >
      <div className="glass-capsule pointer-events-auto mx-auto max-w-[400px] h-[52px] rounded-full p-1 flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.key);
          return (
            <motion.button
              key={item.key}
              layout
              transition={spring}
              onClick={() => go(item.key)}
              whileTap={{ scale: 0.92 }}
              className={`relative h-full rounded-full flex items-center justify-center gap-1.5 ${active ? 'flex-[2] text-ink' : 'flex-1 text-ink-soft/70'}`}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  className="absolute inset-0 rounded-full bg-lime shadow-[0_4px_12px_-6px_rgba(130,150,0,0.85),inset_0_1px_0_rgba(255,255,255,0.6)]"
                  transition={spring}
                />
              )}
              <motion.span layout="position" transition={spring} className="relative [&>svg]:w-[17px] [&>svg]:h-[17px]">
                {item.icon}
                {item.key === 'tracking' && isLive && <LiveDot />}
              </motion.span>
              <AnimatePresence initial={false}>
                {active && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.08, duration: 0.3, ease: EASE } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    className="relative text-[12px] font-bold whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
