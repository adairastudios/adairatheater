import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Flame, Minus, Plus, MessageSquare, Check } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';
import { DietaryBadge } from './DietaryBadge';
import { formatINR } from '../utils/currency';
import { MenuItem } from '../types';

const EASE = [0.16, 1, 0.3, 1] as const;

const rise = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.12 + i * 0.05, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
});

const SheetBody: React.FC<{ item: MenuItem; onClose: () => void }> = ({ item, onClose }) => {
  const { cart, addToCart, updateQuantity, updateItemInstruction } = useCinema();
  const existing = cart.find((c) => c.item.id === item.id);
  const [qty, setQty] = useState(existing?.quantity ?? 1);
  const [note, setNote] = useState(existing?.instructions ?? '');
  const [noteOpen, setNoteOpen] = useState(!!existing?.instructions);
  const [added, setAdded] = useState(false);
  const soldOut = !item.inStock;

  const confirm = () => {
    if (soldOut) return;
    if (existing) {
      updateQuantity(item.id, qty - existing.quantity);
    } else {
      addToCart(item);
      if (qty > 1) updateQuantity(item.id, qty - 1);
    }
    updateItemInstruction(item.id, note.trim());
    setAdded(true);
    setTimeout(onClose, 650);
  };

  return (
    <>
      {/* Hero image */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] shrink-0 overflow-hidden bg-[#EFEFF1]">
        <motion.img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        <motion.button
          {...rise(0)}
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-ink shadow"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 sm:px-7 -mt-6 relative">
        <motion.div {...rise(1)} className="flex items-center gap-2">
          <DietaryBadge type={item.dietary} size={18} showText />
          {item.isChefSpecial && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-lime text-ink px-2 py-0.5 rounded-full">
              Chef Signature
            </span>
          )}
          <span className="text-[11px] font-semibold text-sky-deep">{item.category}</span>
        </motion.div>

        <motion.h2 {...rise(2)} className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-ink leading-tight">
          {item.name}
        </motion.h2>

        <motion.div {...rise(3)} className="mt-2 flex items-center gap-3 text-xs text-muted">
          {item.prepTimeMins && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {item.prepTimeMins} min
            </span>
          )}
          {item.calories && (
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> {item.calories}
            </span>
          )}
          <span className="ml-auto text-xl font-extrabold text-ink tabular-nums">{formatINR(item.price)}</span>
        </motion.div>

        <motion.p {...rise(4)} className="mt-3 text-sm text-ink-soft leading-relaxed">
          {item.description}
        </motion.p>

        {item.tags && item.tags.length > 0 && (
          <motion.div {...rise(5)} className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F1F1F3] text-ink-soft">
                {t}
              </span>
            ))}
          </motion.div>
        )}

        <motion.div {...rise(6)} className="mt-4 pb-4">
          {!noteOpen ? (
            <button
              onClick={() => setNoteOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-deep"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Add a note for the chef
            </button>
          ) : (
            <motion.textarea
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 72 }}
              transition={{ duration: 0.35, ease: EASE }}
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Extra butter, sauce on the side, no ice…"
              className="w-full p-3 rounded-2xl bg-[#F5F5F5] border border-line text-sm text-ink placeholder:text-faint resize-none focus:outline-none focus:border-ink/30"
            />
          )}
        </motion.div>
      </div>

      {/* Action bar */}
      <motion.div
        {...rise(5)}
        className="shrink-0 px-5 sm:px-7 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-line bg-white flex items-center gap-3"
      >
        <div className="h-12 flex items-center rounded-2xl bg-[#F1F1F3]">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={soldOut}
            className="w-11 h-12 flex items-center justify-center text-ink disabled:opacity-30"
            aria-label="Decrease"
          >
            <Minus className="w-4 h-4" />
          </button>
          <motion.span key={qty} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-6 text-center font-bold tabular-nums">
            {qty}
          </motion.span>
          <button
            onClick={() => setQty((q) => q + 1)}
            disabled={soldOut}
            className="w-11 h-12 flex items-center justify-center text-ink disabled:opacity-30"
            aria-label="Increase"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={confirm}
          disabled={soldOut}
          className={`flex-1 h-12 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-colors ${
            soldOut ? 'bg-[#E5E5E7] text-muted' : added ? 'bg-lime-strong text-ink' : 'bg-lime text-black'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {soldOut ? (
              <motion.span key="s">Sold out</motion.span>
            ) : added ? (
              <motion.span key="a" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" /> Added to tray
              </motion.span>
            ) : (
              <motion.span key="b" exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                {existing ? 'Update tray' : 'Add to tray'}
                <span className="opacity-40">·</span>
                <span className="tabular-nums">{formatINR(item.price * qty)}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </>
  );
};

export const ProductDetailSheet: React.FC = () => {
  const { selectedProduct, openProduct } = useCinema();
  const close = () => openProduct(null);

  useEffect(() => {
    if (!selectedProduct) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && openProduct(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedProduct, openProduct]);

  return (
    <AnimatePresence>
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={selectedProduct.name}>
          <motion.div
            className="absolute inset-0 bg-black/35"
            style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={close}
          />
          <motion.div
            key={selectedProduct.id}
            className="relative w-full sm:max-w-lg max-h-[92vh] bg-white rounded-t-[28px] sm:rounded-[28px] overflow-hidden flex flex-col card-raised"
            initial={{ opacity: 0, y: 40, clipPath: 'inset(18% 0% 0% 0% round 28px 28px 0 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 28px 28px 0 0)' }}
            exit={{ opacity: 0, y: 30, clipPath: 'inset(12% 0% 0% 0% round 28px 28px 0 0)' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <SheetBody item={selectedProduct} onClose={close} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
