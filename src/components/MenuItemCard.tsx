import React, { useState } from 'react';
import { MenuItem } from '../types';
import { useCinema } from '../context/CinemaContext';
import { DietaryBadge } from './DietaryBadge';
import { Plus, Minus, Clock, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '../utils/currency';

interface MenuItemCardProps {
  item: MenuItem;
  index?: number;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, index = 0 }) => {
  const { cart, addToCart, updateQuantity, openProduct } = useCinema();
  const [imgError, setImgError] = useState(false);

  const quantity = cart.find((ci) => ci.item.id === item.id)?.quantity ?? 0;
  const isSoldOut = !item.inStock;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={() => openProduct(item)}
      className="group card rounded-[20px] overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#EFEFF1] overflow-hidden">
        {!imgError ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              isSoldOut ? 'grayscale opacity-60' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="w-7 h-7 text-faint" />
          </div>
        )}

        <span className="absolute top-2.5 left-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
          <DietaryBadge type={item.dietary} size={16} />
        </span>

        {item.isChefSpecial && !isSoldOut && (
          <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider bg-lime text-ink px-2 py-0.5 rounded-full">
            Signature
          </span>
        )}

        {isSoldOut && (
          <span className="absolute inset-x-0 bottom-3 mx-auto w-fit text-[10px] font-bold uppercase tracking-wider bg-white text-rose-600 px-2.5 py-1 rounded-full shadow">
            Sold out
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-sans text-[13px] sm:text-sm font-bold text-ink leading-snug line-clamp-2 min-h-[2.5em]">
          {item.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] text-muted">
          {item.prepTimeMins && (
            <>
              <Clock className="w-3 h-3" />
              <span>{item.prepTimeMins} min</span>
            </>
          )}
          {item.calories && <span className="truncate">· {item.calories}</span>}
        </div>

        <div className="mt-auto pt-2.5 flex items-center justify-between gap-2">
          <span className="text-sm sm:text-base font-extrabold text-ink tabular-nums">{formatINR(item.price)}</span>

          {isSoldOut ? null : quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
              className="h-8 px-3 rounded-full bg-lime text-black text-[11px] font-extrabold flex items-center gap-1 shadow-[0_6px_14px_-8px_rgba(120,140,0,0.9)]"
              aria-label={`Add ${item.name}`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              ADD
            </motion.button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="h-8 flex items-center rounded-full bg-lime text-ink"
            >
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="w-7 h-8 flex items-center justify-center"
                aria-label={`Decrease ${item.name}`}
              >
                <Minus className="w-3 h-3" />
              </button>
              <motion.span
                key={quantity}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-4 text-center text-xs font-bold tabular-nums text-ink"
              >
                {quantity}
              </motion.span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="w-7 h-8 flex items-center justify-center"
                aria-label={`Increase ${item.name}`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};
