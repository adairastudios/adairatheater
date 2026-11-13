import React, { useState, useEffect } from 'react';
import { useCinema } from '../context/CinemaContext';
import { OrderStatus } from '../types';
import { Armchair, ChefHat, CheckCircle2, Clock, Footprints, HelpCircle, ArrowLeft, Utensils, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import { DietaryBadge } from './DietaryBadge';
import { formatINR } from '../utils/currency';

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  {
    key: 'placed',
    label: 'Order Placed',
    desc: 'Sent to the kitchen terminal & confirmed',
  },
  {
    key: 'preparing',
    label: 'Preparing in Kitchen',
    desc: 'Chef is popping, assembling & packing your order',
  },
  {
    key: 'on_the_way',
    label: 'On the Way to Your Seat',
    desc: 'Usher is walking through the auditorium',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    desc: 'Served directly to your seat. Enjoy the film!',
  },
];

export const OrderTrackingScreen: React.FC = () => {
  const {
    activeOrder,
    orders,
    setActiveOrderId,
    setCurrentView,
    setIsUsherModalOpen,
    theatre,
    screen,
    seat,
  } = useCinema();

  // If no activeOrder, pick the latest order
  const order = activeOrder || (orders.length > 0 ? orders[0] : null);

  // Remaining minutes simulation
  const [minutesLeft, setMinutesLeft] = useState<number>(() => {
    if (!order) return 12;
    if (order.status === 'delivered') return 0;
    if (order.status === 'on_the_way') return 2;
    if (order.status === 'preparing') return 8;
    return 14;
  });

  useEffect(() => {
    if (!order) return;
    if (order.status === 'delivered') {
      setMinutesLeft(0);
    } else if (order.status === 'on_the_way') {
      setMinutesLeft(2);
    } else if (order.status === 'preparing') {
      setMinutesLeft(7);
    } else {
      setMinutesLeft(14);
    }
  }, [order?.status]);

  if (!order) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <Receipt className="w-12 h-12 text-faint mx-auto mb-3" />
        <h3 className="text-xl font-serif font-bold text-ink">No active orders</h3>
        <p className="text-xs text-muted mt-1">
          You haven't placed an order for this seat yet.
        </p>
        <button
          onClick={() => setCurrentView('menu')}
          className="mt-6 px-6 py-3 rounded-xl bg-[#D9F20A] text-black font-bold text-xs uppercase tracking-wider"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'preparing':
        return 1;
      case 'on_the_way':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="pb-40 md:pb-28 max-w-2xl mx-auto px-3 sm:px-6">
      {/* Back to Menu Bar */}
      <div className="py-2.5 sm:py-4 flex items-center justify-between border-b border-line">
        <button
          onClick={() => setCurrentView('menu')}
          className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink transition-colors py-1 px-2.5 rounded-lg bg-[#F5F5F5] min-h-[36px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Menu</span>
        </button>

        <span className="text-[10px] sm:text-[11px] text-sky-deep uppercase tracking-widest font-semibold">
          Live Seat Dispatch
        </span>

        <button
          onClick={() => setIsUsherModalOpen(true)}
          className="flex items-center gap-1.5 text-xs text-lime-deep hover:underline font-semibold min-h-[36px]"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need Help?</span>
        </button>
      </div>

      {/* Hero Delivery Status Card */}
      <div className="mt-4 sm:mt-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white card-raised border border-line text-center relative overflow-hidden shadow-2xl">
        {/* Ambient pulse effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-lime/25 blur-3xl pointer-events-none" />

        {/* Seat Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#F1F1F3] border border-line text-[11px] sm:text-xs font-bold text-ink mb-3 sm:mb-4">
          <Armchair className="w-3.5 h-3.5 text-lime-deep" />
          <span>{order.screen} · Seat {order.seat}</span>
        </div>

        {/* Order ID & Countdown */}
        <div className="mb-2">
          <span className="text-[10px] sm:text-[11px] text-muted tracking-wider font-mono">
            ORDER {order.orderNumber}
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-extrabold text-ink mt-0.5">
            {order.status === 'delivered'
              ? 'Delivered to Seat!'
              : order.status === 'on_the_way'
              ? 'Usher Walking In...'
              : order.status === 'preparing'
              ? 'Kitchen is Cooking'
              : 'Order Received'}
          </h2>
        </div>

        {order.status !== 'delivered' && (
          <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-[#F5F5F5] border border-lime-deep/20 text-ink">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lime-deep animate-pulse" />
            <span className="text-[11px] sm:text-xs text-ink-soft">Estimated Arrival:</span>
            <span className="text-xs sm:text-sm font-extrabold text-lime-deep tabular-nums">
              ~{minutesLeft} mins
            </span>
          </div>
        )}

        {/* Interactive Timeline */}
        <div className="mt-6 sm:mt-8 text-left space-y-4 sm:space-y-6 relative">
          {/* Vertical Track Line */}
          <div className="absolute left-3.5 sm:left-4 top-3 bottom-3 w-0.5 bg-[#F1F1F3] z-0" />

          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = currentStepIdx > idx;
            const isCurrent = currentStepIdx === idx;

            return (
              <div key={step.key} className="flex items-start gap-3 sm:gap-4 relative z-10">
                {/* Node Dot / Icon */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-[#D9F20A] text-black shadow-sm shadow-[#D9F20A]/30'
                      : isCurrent
                      ? 'bg-lime-soft border-2 border-lime-strong text-lime-deep animate-pulse'
                      : 'bg-[#F1F1F3] text-faint border border-line'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    idx === 1 ? (
                      <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : idx === 2 ? (
                      <Footprints className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )
                  ) : (
                    <span className="text-[10px] sm:text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Text Description */}
                <div className="pt-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        isCurrent
                          ? 'text-lime-deep'
                          : isCompleted
                          ? 'text-ink'
                          : 'text-faint'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D9F20A]/20 text-lime-deep border border-lime-deep/20">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itemized Order Details & Receipt */}
      <div className="mt-4 sm:mt-6 p-4 sm:p-5 rounded-2xl sm:rounded-3xl card border border-line">
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-sky-deep" />
            <h3 className="font-serif font-bold text-xs sm:text-sm text-ink">Order Receipt</h3>
          </div>
          <span className="text-xs sm:text-sm font-bold text-lime-deep tabular-nums">
            {formatINR(order.total)}
          </span>
        </div>

        <div className="py-2.5 sm:py-3 space-y-2">
          {order.items.map((ci, idx) => (
            <div key={idx} className="flex items-start justify-between text-[11px] sm:text-xs">
              <div className="flex items-start gap-2 flex-1">
                <span className="w-4 sm:w-5 font-bold text-lime-deep tabular-nums shrink-0">
                  {ci.quantity}x
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <DietaryBadge type={ci.item.dietary} />
                    <span className="text-ink font-medium">{ci.item.name}</span>
                  </div>
                  {ci.instructions && (
                    <p className="text-[10px] sm:text-[11px] text-muted italic mt-0.5">
                      Note: "{ci.instructions}"
                    </p>
                  )}
                </div>
              </div>
              <span className="text-ink-soft tabular-nums font-mono">
                {formatINR(ci.item.price * ci.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2.5 border-t border-line space-y-1 text-[11px] sm:text-xs text-muted">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Service</span>
            <span className="tabular-nums">{order.serviceFee === 0 ? 'FREE' : formatINR(order.serviceFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span className="tabular-nums">{formatINR(order.taxes)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-line text-xs sm:text-sm font-bold text-ink">
            <span>Total Paid ({order.paymentMethod.toUpperCase()})</span>
            <span className="text-lime-deep tabular-nums">{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <button
          onClick={() => setCurrentView('menu')}
          className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-[#F1F1F3] hover:bg-black/10 text-ink font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-h-[42px] sm:min-h-[44px]"
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Add More Food / Drinks</span>
        </button>

        <button
          onClick={() => setIsUsherModalOpen(true)}
          className="py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl bg-[#F5F5F5] hover:bg-black/5 border border-sky-deep/30 text-sky-deep hover:text-ink font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all min-h-[42px] sm:min-h-[44px]"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-deep" />
          <span>Need Usher Assistance</span>
        </button>
      </div>
    </div>
  );
};
