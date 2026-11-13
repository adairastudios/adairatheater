import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { parseScreenParam } from '../utils/seatQr';

const EASE = [0.16, 1, 0.3, 1] as const;
const SESSION_KEY = 'adaira_intro_seen_v1';

type Phase = 'scan' | 'done' | 'exit';

/** Reads the seat straight from the URL so the intro can show it on first paint. */
const readSeat = () => {
  const p = new URLSearchParams(window.location.search);
  const seat = p.get('seat')?.toUpperCase() ?? null;
  const screen = p.get('screen') ? parseScreenParam(p.get('screen')!) : null;
  return { seat, screen };
};

const shouldShow = () => {
  if (window.location.pathname.includes('/admin') || window.location.hash === '#admin') return false;
  try {
    const { seat, screen } = readSeat();
    const key = `${screen ?? ''}|${seat ?? ''}`;
    if (sessionStorage.getItem(SESSION_KEY) === key) return false;
    sessionStorage.setItem(SESSION_KEY, key);
  } catch {
    // storage unavailable: still show the intro
  }
  return true;
};

/**
 * Premium "scan complete" intro shown when a guest opens the app from a seat QR.
 * Scan frame + sweep → check mark with seat confirmation → soft reveal of the app.
 */
export const ScanIntro: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [visible] = useState(shouldShow);
  const [phase, setPhase] = useState<Phase>('scan');
  const [{ seat, screen }] = useState(readSeat);

  useEffect(() => {
    if (!visible) {
      onFinish();
      return;
    }
    const t1 = setTimeout(() => setPhase('done'), 1500);
    const t2 = setTimeout(() => setPhase('exit'), 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible, onFinish]);

  // Mount the app as the intro starts fading, so the two cross-dissolve.
  useEffect(() => {
    if (phase === 'exit') onFinish();
  }, [phase, onFinish]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] bg-smoke flex flex-col items-center justify-center px-6 select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
          transition={{ duration: 0.7, ease: EASE }}
          onClick={() => setPhase('exit')}
          role="status"
          aria-live="polite"
        >
          {/* Soft ambient wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(60% 40% at 50% 38%, rgba(217,242,10,0.16) 0%, rgba(245,245,245,0) 70%)',
            }}
          />

          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Scanner frame corners */}
            <AnimatePresence>
              {phase === 'scan' && (
                <motion.div
                  key="frame"
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  {[
                    'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-[22px]',
                    'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-[22px]',
                    'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[22px]',
                    'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[22px]',
                  ].map((c) => (
                    <span key={c} className={`absolute w-9 h-9 border-lime-strong ${c}`} />
                  ))}

                  {/* Sweep line */}
                  <motion.div
                    className="absolute left-3 right-3 h-[2px] rounded-full bg-lime"
                    style={{ boxShadow: '0 0 18px 4px rgba(217,242,10,0.55)' }}
                    initial={{ top: '12%', opacity: 0 }}
                    animate={{ top: ['12%', '88%', '12%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.4, ease: 'easeInOut', times: [0, 0.5, 1] }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center: monogram while scanning, check when done */}
            <AnimatePresence mode="wait">
              {phase === 'scan' ? (
                <motion.img
                  key="mark"
                  src="/assets/brand/adaira-mark.png"
                  alt=""
                  className="w-16 h-auto"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              ) : (
                <motion.div
                  key="check"
                  className="w-24 h-24 rounded-full bg-lime flex items-center justify-center"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  style={{ boxShadow: '0 20px 50px -18px rgba(150,170,0,0.65)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-11 h-11" fill="none">
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      stroke="#121316"
                      strokeWidth={2.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ripple on success */}
            {phase === 'done' && (
              <motion.span
                className="absolute w-24 h-24 rounded-full border-2 border-lime-strong/50"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.1, opacity: 0 }}
                transition={{ duration: 1.1, ease: EASE }}
              />
            )}
          </div>

          {/* Copy */}
          <div className="relative mt-10 h-20 text-center">
            <AnimatePresence mode="wait">
              {phase === 'scan' ? (
                <motion.div
                  key="t1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-muted">
                    {seat ? 'Reading seat code' : 'Adaira Studios'}
                  </p>
                  <p className="mt-2 text-sm text-ink-soft">One moment…</p>
                </motion.div>
              ) : (
                <motion.div
                  key="t2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-sky-deep">
                    {seat ? 'Scan complete' : 'Welcome'}
                  </p>
                  <p className="mt-2 font-serif text-[26px] font-bold text-ink leading-tight">
                    {seat ? `Seat ${seat}` : 'In-Seat Dining'}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {seat ? `${screen ?? 'Your screen'} · Ready to order` : 'Order without missing a scene'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Brand footer */}
          <motion.img
            src="/assets/brand/adaira-logo-dark.png"
            alt="Adaira Studios"
            className="absolute bottom-10 h-6 w-auto opacity-80"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
