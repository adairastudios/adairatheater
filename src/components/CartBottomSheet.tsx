import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { ShoppingBag, ArrowRight, X, Trash2, Plus, Minus, MessageSquare, Armchair, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DietaryBadge } from './DietaryBadge';
import { formatINR } from '../utils/currency';

export const CartBottomSheet: React.FC = () => {
  const {
    cart,
    cartCount,
    subtotal,
    taxes,
    serviceFee,
    grandTotal,
    isCartSheetOpen,
    setIsCartSheetOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeFromCart,
    updateItemInstruction,
    screen,
    seat,
    currentView,
    navHidden,
  } = useCinema();

  const [activeInstructionItemId, setActiveInstructionItemId] = useState<string | null>(null);

  // Do not show floating bar if cart is empty or on admin view or checkout
  const showFloatingBar = cartCount > 0 && currentView !== 'admin' && !isCartSheetOpen;

  return (
    <>
      {/* Floating Cart Bar (Sticky Anchor at Bottom) */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed left-3 right-3 sm:left-4 sm:right-4 max-w-xl mx-auto z-40 bottom-[var(--cart-bottom)] md:bottom-4 transition-[bottom] duration-500 ease-premium"
            style={{ ['--cart-bottom' as string]: navHidden ? 'calc(12px + env(safe-area-inset-bottom))' : 'calc(70px + env(safe-area-inset-bottom))' }}
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCartSheetOpen(true)}
              className="w-full h-14 pl-2 pr-4 rounded-2xl bg-lime text-ink flex items-center justify-between gap-3 shadow-[0_18px_40px_-16px_rgba(140,160,0,0.9)]"
            >
              <div className="flex items-center gap-3">
                <span className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-[18px] h-[18px] text-black" />
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-lime-strong text-ink text-[10px] ring-2 ring-lime font-bold flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-[11px] text-ink/60">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'} · Seat {seat}
                  </span>
                  <span className="block text-sm font-extrabold tabular-nums">{formatINR(grandTotal)}</span>
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                View tray
                <ArrowRight className="w-4 h-4" />
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glass Bottom Sheet Modal */}
      <AnimatePresence>
        {isCartSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartSheetOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-sm"
            />

            {/* Bottom Sheet Box */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white card-raised rounded-t-[28px] sm:rounded-[28px] p-4 sm:p-6 z-10 max-h-[88vh] flex flex-col shadow-2xl"
            >
              {/* Drag Handle Bar */}
              <div className="w-10 h-1 bg-[#E9E9EC] rounded-full mx-auto mb-2.5 sm:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-line">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-lime/30 border border-lime-deep/20 flex items-center justify-center text-lime-deep">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-ink">Your Cinema Tray</h3>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-sky-deep">
                      <Armchair className="w-3 h-3 text-lime-deep" />
                      <span>{screen} · Seat {seat}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartSheetOpen(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F5] hover:bg-black/5 flex items-center justify-center text-muted hover:text-ink transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="overflow-y-auto no-scrollbar py-2.5 sm:py-3 space-y-2.5 flex-1">
                {cart.length === 0 ? (
                  <div className="py-10 text-center">
                    <ShoppingBag className="w-10 h-10 text-faint mx-auto mb-2" />
                    <p className="text-muted text-xs sm:text-sm">Your dining tray is empty.</p>
                  </div>
                ) : (
                  cart.map((ci) => {
                    const isEditingInstruction = activeInstructionItemId === ci.item.id;
                    const itemTotal = ci.item.price * ci.quantity;

                    return (
                      <div
                        key={ci.item.id}
                        className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#F5F5F5] border border-line hover:border-black/15 transition-all flex flex-col gap-1.5 sm:gap-2"
                      >
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                          {/* Item Thumbnail & Name */}
                          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                            <img
                              src={ci.item.image}
                              alt={ci.item.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover shrink-0 border border-line"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <DietaryBadge type={ci.item.dietary} />
                                <h4 className="font-semibold text-xs sm:text-sm text-ink truncate">
                                  {ci.item.name}
                                </h4>
                              </div>
                              <span className="text-[11px] sm:text-xs font-bold text-lime-deep tabular-nums">
                                {formatINR(ci.item.price)} each
                              </span>
                            </div>
                          </div>

                          {/* Quantity Stepper */}
                          <div className="flex items-center gap-1 p-0.5 rounded-lg sm:rounded-xl bg-[#F5F5F5] border border-line shrink-0">
                            <button
                              onClick={() => updateQuantity(ci.item.id, -1)}
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#F5F5F5] hover:bg-black/10 text-ink flex items-center justify-center transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <span className="w-5 sm:w-6 text-center text-xs font-bold text-ink tabular-nums">
                              {ci.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(ci.item.id, 1)}
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#D9F20A] text-black font-bold flex items-center justify-center hover:brightness-110 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            onClick={() => removeFromCart(ci.item.id)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-faint hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                            aria-label={`Remove ${ci.item.name}`}
                          >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>

                        {/* Special Instruction Row */}
                        <div className="pt-1 border-t border-line flex items-center justify-between text-[11px] sm:text-xs">
                          {ci.instructions ? (
                            <div className="flex items-center gap-1.5 text-ink-soft italic text-[10px] sm:text-[11px] truncate flex-1">
                              <MessageSquare className="w-2.5 h-2.5 text-lime-deep shrink-0" />
                              <span className="truncate">"{ci.instructions}"</span>
                              <button
                                onClick={() => setActiveInstructionItemId(isEditingInstruction ? null : ci.item.id)}
                                className="text-sky-deep underline text-[9px] sm:text-[10px] ml-1 shrink-0"
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveInstructionItemId(isEditingInstruction ? null : ci.item.id)}
                              className="text-[10px] sm:text-[11px] text-sky-deep hover:text-ink flex items-center gap-1 py-0.5 transition-colors"
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>+ Note for chef</span>
                            </button>
                          )}

                          <span className="text-[11px] sm:text-xs font-extrabold text-ink tabular-nums shrink-0 ml-2">
                            {formatINR(itemTotal)}
                          </span>
                        </div>

                        {/* Instruction Input Drawer */}
                        {isEditingInstruction && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="e.g. Extra hot, sauce on side, no ice..."
                              value={ci.instructions || ''}
                              onChange={(e) => updateItemInstruction(ci.item.id, e.target.value)}
                              className="flex-1 px-2.5 py-1 rounded-lg bg-[#F5F5F5] border border-line text-ink text-[11px] placeholder:text-faint focus:outline-none focus:border-ink/40"
                            />
                            <button
                              onClick={() => setActiveInstructionItemId(null)}
                              className="px-2 py-1 rounded-lg bg-[#F1F1F3] hover:bg-black/10 text-[11px] text-ink font-medium"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bill Breakdown Summary */}
              {cart.length > 0 && (
                <div className="pt-2.5 border-t border-line space-y-1 text-[11px] sm:text-xs text-ink-soft">
                  <div className="flex items-center justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-ink font-medium tabular-nums">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      In-Seat Delivery Service
                      {subtotal >= 30 && (
                        <span className="text-[9px] text-lime-deep font-bold">(Free above ₹999)</span>
                      )}
                    </span>
                    <span className="text-ink font-medium tabular-nums">
                      {serviceFee === 0 ? <span className="text-lime-deep">FREE</span> : formatINR(serviceFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GST (5%)</span>
                    <span className="text-ink font-medium tabular-nums">{formatINR(taxes)}</span>
                  </div>

                  {/* Grand Total */}
                  <div className="pt-1.5 border-t border-line flex items-center justify-between text-sm sm:text-base font-bold text-ink">
                    <span>Total Amount</span>
                    <span className="text-lg sm:text-xl font-extrabold text-lime-deep tabular-nums">
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                </div>
              )}

              {/* Checkout CTA */}
              {cart.length > 0 && (
                <div className="pt-3 mt-1">
                  <button
                    onClick={() => {
                      setIsCartSheetOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-3 sm:py-3.5 px-5 rounded-2xl bg-[#D9F20A] text-black font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all glow-lime min-h-[44px] sm:min-h-[48px]"
                  >
                    <span>Proceed to Seat Checkout</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
