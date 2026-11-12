import React, { useState, useEffect } from 'react';
import { useCinema } from '../context/CinemaContext';
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Armchair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const PaymentProcessingModal: React.FC = () => {
  const {
    isProcessingPayment,
    setIsProcessingPayment,
    createOrder,
    setCurrentView,
    screen,
    seat,
  } = useCinema();

  const [step, setStep] = useState<number>(1);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (!isProcessingPayment) {
      setStep(1);
      setHasError(false);
      return;
    }

    // Step 1: Encrypting
    const t1 = setTimeout(() => {
      setStep(2);
    }, 900);

    // Step 2: Verifying seat & dispatching
    const t2 = setTimeout(() => {
      setStep(3);
    }, 1800);

    // Step 3: Success
    const t3 = setTimeout(() => {
      setStep(4);
      // Fire festive confetti in cinema electric lime & sky blue!
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D9F20A', '#8DBBDA', '#ffffff'],
        });
      } catch {}

      // Commit order
      setTimeout(() => {
        createOrder({
          customerName: 'Cinema Guest',
          phone: '+91 98765 43210',
          paymentMethod: 'card',
          deliveryPreference: 'now',
        });
        setIsProcessingPayment(false);
        setCurrentView('tracking');
      }, 1400);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isProcessingPayment, createOrder, setCurrentView]);

  if (!isProcessingPayment) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm glass-panel-elevated rounded-2xl sm:rounded-3xl border border-white/20 p-5 sm:p-8 text-center z-10 shadow-2xl"
        >
          {/* Animated Spinner / Checkmark */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
            {step < 4 && !hasError && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-[#D9F20A] border-t-transparent animate-spin" />
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#D9F20A]/15 flex items-center justify-center text-[#D9F20A]">
                  <Armchair className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                </div>
              </>
            )}

            {step === 4 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-full bg-[#D9F20A] text-black flex items-center justify-center shadow-lg shadow-[#D9F20A]/40"
              >
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </motion.div>
            )}

            {hasError && (
              <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <h3 className="font-serif font-bold text-xl text-white">
            {hasError
              ? 'Payment Declined'
              : step === 1
              ? 'Securing Payment...'
              : step === 2
              ? `Confirming ${screen} · Seat ${seat}...`
              : step === 3
              ? 'Sending Order to Kitchen...'
              : 'Payment Successful!'}
          </h3>

          <p className="text-xs text-white/60 mt-2">
            {hasError
              ? 'Your bank was unable to authorize this transaction. Please try another card or UPI.'
              : step === 4
              ? 'Dispatching your culinary order to the Adaira Kitchen KDS.'
              : 'Please keep this screen open while we connect to cinema dispatch.'}
          </p>

          {/* Step Progress indicators */}
          {!hasError && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < step
                      ? 'w-6 bg-[#D9F20A]'
                      : i === step
                      ? 'w-8 bg-[#8DBBDA] animate-pulse'
                      : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Test failure simulation option for reviewers */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2">
            {!hasError ? (
              <button
                type="button"
                onClick={() => setHasError(true)}
                className="text-[10px] text-white/40 hover:text-rose-400 transition-colors"
              >
                (Test Failure State)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setHasError(false);
                  setStep(1);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Payment</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
