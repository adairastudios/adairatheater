import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { X, Armchair, ShieldCheck, CreditCard, Smartphone, Wallet, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '../utils/currency';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsProcessingPayment,
    screen,
    seat,
    setIsSeatModalOpen,
    grandTotal,
    createOrder,
    setCurrentView,
  } = useCinema();

  // Form states
  const [customerName, setCustomerName] = useState('Cinema Guest');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [deliveryPreference, setDeliveryPreference] = useState<'now' | 'interval'>('now');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet'>('card');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Mock Card states
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('921');

  // Mock UPI state
  const [upiId, setUpiId] = useState('guest@cinema');

  if (!isCheckoutOpen) return null;

  const handleSendOtp = () => {
    setOtpSent(true);
    // Simulate auto-filled OTP
    setTimeout(() => {
      setOtpCode('7492');
      setOtpVerified(true);
    }, 900);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckoutOpen(false);
    setIsProcessingPayment(true);

    // After payment processing animation completes (handled in PaymentProcessingModal),
    // the order will be committed.
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCheckoutOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg glass-panel-elevated rounded-2xl sm:rounded-3xl border border-white/20 p-4 sm:p-6 z-10 max-h-[92vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10">
            <div>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#8DBBDA] uppercase font-bold">
                Seat Delivery
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white">Express Checkout</h3>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Close checkout"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handlePay} className="overflow-y-auto no-scrollbar py-3 sm:py-4 space-y-3.5 sm:space-y-4 flex-1">
            {/* Seat Confirmation Box */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/15 flex items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#D9F20A]/15 border border-[#D9F20A]/30 flex items-center justify-center text-[#D9F20A] shrink-0">
                  <Armchair className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-[#8DBBDA] uppercase font-bold tracking-wider block">
                    Confirmed Seat
                  </span>
                  <span className="text-xs sm:text-base font-bold text-white">
                    {screen} · Seat {seat}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSeatModalOpen(true)}
                className="text-xs text-[#8DBBDA] hover:text-[#D9F20A] underline px-1.5 py-0.5"
              >
                Change
              </button>
            </div>

            {/* Guest Details */}
            <div className="space-y-2">
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/70 block">
                Guest Information
              </label>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Your Name (for order ticket)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D9F20A] transition-all min-h-[38px] sm:min-h-[44px]"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  placeholder="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-[#D9F20A] transition-all min-h-[38px] sm:min-h-[44px]"
                />
                {!otpVerified ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] sm:text-xs font-semibold text-white whitespace-nowrap min-h-[38px] sm:min-h-[44px]"
                  >
                    {otpSent ? 'Sending...' : 'Verify OTP'}
                  </button>
                ) : (
                  <div className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-bold flex items-center gap-1 whitespace-nowrap min-h-[38px] sm:min-h-[44px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Timing Preference */}
            <div>
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5 block">
                Delivery Timing
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryPreference('now')}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all min-h-[42px] sm:min-h-[48px] ${
                    deliveryPreference === 'now'
                      ? 'bg-white/10 border-[#D9F20A] glow-lime-inner'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D9F20A]" />
                    <span>Deliver ASAP</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-white/60 block mt-0.5">
                    ~12-15 mins during show
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryPreference('interval')}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all min-h-[42px] sm:min-h-[48px] ${
                    deliveryPreference === 'interval'
                      ? 'bg-white/10 border-[#D9F20A] glow-lime-inner'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8DBBDA]" />
                    <span>At Interval</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-white/60 block mt-0.5">
                    Hot during theatre break
                  </span>
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5 block">
                Payment Method (Mock Gateway)
              </label>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all min-h-[38px] sm:min-h-[44px] ${
                    paymentMethod === 'card'
                      ? 'bg-white/15 border-[#D9F20A] text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9F20A]" />
                  <span className="text-[11px] sm:text-xs font-semibold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all min-h-[38px] sm:min-h-[44px] ${
                    paymentMethod === 'upi'
                      ? 'bg-white/15 border-[#D9F20A] text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8DBBDA]" />
                  <span className="text-[11px] sm:text-xs font-semibold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all min-h-[38px] sm:min-h-[44px] ${
                    paymentMethod === 'wallet'
                      ? 'bg-white/15 border-[#D9F20A] text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                  <span className="text-[11px] sm:text-xs font-semibold">Apple Pay</span>
                </button>
              </div>

              {/* Dynamic Payment Details Fields */}
              {paymentMethod === 'card' && (
                <div className="p-3 rounded-xl sm:rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-white/50">
                    <span>Card Details</span>
                    <span className="text-[10px] text-[#8DBBDA]">Stripe/Razorpay Ready</span>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white text-xs font-mono"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      placeholder="MM/YY"
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white text-xs font-mono"
                    />
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="CVV"
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="p-3 rounded-xl sm:rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-[11px] text-white/60 block">Enter UPI ID / VPA</span>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@okaxis"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-white/40 block">
                    Supported: GPay, PhonePe, Paytm, BHIM, Cred
                  </span>
                </div>
              )}

              {paymentMethod === 'wallet' && (
                <div className="p-3 rounded-xl sm:rounded-2xl bg-black/40 border border-white/10 text-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="text-xs text-white font-medium block">
                    Cinema Dining Pass / Apple Pay
                  </span>
                  <span className="text-[10px] text-white/50 block mt-0.5">
                    Biometric authorization ready
                  </span>
                </div>
              )}
            </div>

            {/* Special Instructions for Usher */}
            <div>
              <label htmlFor="usher-instructions" className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/70 mb-1 block">
                Usher Delivery Notes (Optional)
              </label>
              <input
                id="usher-instructions"
                type="text"
                placeholder="e.g. Please whisper, quiet entry, extra napkins"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#D9F20A] min-h-[38px] sm:min-h-[42px]"
              />
            </div>

            {/* Order total & CTA */}
            <div className="pt-2.5 border-t border-white/10">
              <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
                <span className="text-white/70">Total Due</span>
                <span className="text-lg sm:text-xl font-extrabold text-[#D9F20A] tabular-nums">
                  {formatINR(grandTotal)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#D9F20A] text-black font-extrabold text-xs sm:text-sm tracking-wider hover:brightness-110 active:scale-[0.98] transition-all glow-lime shadow-lg shadow-[#D9F20A]/20 min-h-[46px] sm:min-h-[50px] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Authorize & Place Order</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
