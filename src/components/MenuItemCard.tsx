import React, { useState } from 'react';
import { MenuItem } from '../types';
import { useCinema } from '../context/CinemaContext';
import { DietaryBadge } from './DietaryBadge';
import { Plus, Minus, Clock, Flame, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '../utils/currency';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { cart, addToCart, updateQuantity } = useCinema();
  const [imgError, setImgError] = useState(false);

  const cartItem = cart.find((ci) => ci.item.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isSoldOut = !item.inStock;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl glass-panel border border-white/10 hover:border-[#D9F20A]/40 transition-all duration-300 overflow-hidden ${
        isSoldOut ? 'opacity-60 grayscale-[0.4]' : 'hover:glow-lime-inner'
      }`}
    >
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-black/40">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          /* High quality CSS fallback */
          <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-slate-900 to-[#07090F] text-center">
            <Utensils className="w-6 h-6 sm:w-8 sm:h-8 text-[#8DBBDA]/50 mb-1.5" />
            <span className="text-[11px] sm:text-xs font-semibold text-white/60">{item.name}</span>
          </div>
        )}

        {/* Contrast Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Tags (Dietary & Chef Special) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="backdrop-blur-md bg-black/60 p-0.5 rounded-md border border-white/10">
            <DietaryBadge type={item.dietary} />
          </div>

          {item.isChefSpecial && (
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#D9F20A] bg-black/75 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-full border border-[#D9F20A]/30">
              Chef Signature
            </span>
          )}
        </div>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#8DBBDA] font-medium mb-1">
            <span>{item.category}</span>
            {item.prepTimeMins && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-white/60">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {item.prepTimeMins}m
                </span>
              </>
            )}
            {item.calories && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-0.5 text-white/50">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D9F20A]" />
                  {item.calories}
                </span>
              </>
            )}
          </div>

          {/* Item Title */}
          <h3 className="font-serif font-bold text-sm sm:text-base text-white group-hover:text-[#D9F20A] transition-colors leading-snug">
            {item.name}
          </h3>

          {/* Description */}
          <p className="mt-1 text-[11px] sm:text-xs text-white/65 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price and Add / Quantity Stepper Footer */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 sm:gap-3">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">
              Price
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#D9F20A] tabular-nums tracking-tight">
              {formatINR(item.price)}
            </span>
          </div>

          {/* Action: Add or Stepper */}
          {isSoldOut ? (
            <button
              disabled
              className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[11px] sm:text-xs font-semibold cursor-not-allowed min-h-[38px] sm:min-h-[44px]"
            >
              Sold Out
            </button>
          ) : quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => addToCart(item)}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#D9F20A] text-black font-extrabold text-xs tracking-wide hover:brightness-110 shadow-sm shadow-[#D9F20A]/20 transition-all min-h-[38px] sm:min-h-[44px]"
              aria-label={`Add ${item.name} to order`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-xl bg-white/10 border border-[#D9F20A]/40 min-h-[38px] sm:min-h-[44px]">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => updateQuantity(item.id, -1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label={`Decrease quantity of ${item.name}`}
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </motion.button>

              <span className="w-6 sm:w-7 text-center font-bold text-xs sm:text-sm text-[#D9F20A] tabular-nums">
                {quantity}
              </span>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => updateQuantity(item.id, 1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#D9F20A] text-black font-bold flex items-center justify-center hover:brightness-110 transition-colors"
                aria-label={`Increase quantity of ${item.name}`}
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
