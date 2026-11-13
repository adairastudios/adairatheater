import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { Category, MenuItem } from '../types';
import { Search, ChevronRight, ChevronLeft, ArrowRight, Clock, Sparkles, ShieldCheck, Zap, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatINR } from '../utils/currency';
import { DietaryBadge } from './DietaryBadge';

const EASE = [0.16, 1, 0.3, 1] as const;

const CATEGORY_TILES: { name: Category; img: string }[] = [
  { name: 'Popcorn', img: '/assets/images/gourmet-popcorn.jpg' },
  { name: 'Snacks', img: '/assets/images/truffle-nachos.jpg' },
  { name: 'Meals', img: '/assets/images/hero-cinema-dining.jpg' },
  { name: 'Beverages', img: '/assets/images/citrus-fizz.jpg' },
  { name: 'Desserts', img: '/assets/images/gourmet-popcorn.jpg' },
  { name: 'Combos', img: '/assets/images/hero-cinema-dining.jpg' },
];

const SEARCH_HINTS = ['Truffle Popcorn', 'Loaded Nachos', 'Smash Sliders', 'Citrus Fizz', 'Lava Cake'];

type BannerTheme = 'lime' | 'sky' | 'sand';

interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  img: string;
  productId?: string;
  category?: Category;
  theme: BannerTheme;
}

const BANNERS: Banner[] = [
  {
    id: 'b1',
    eyebrow: 'Premiere Duo Combo',
    title: 'Save ₹227',
    sub: 'Popcorn, nachos & two sodas for two.',
    cta: 'Order now',
    img: '/assets/images/hero-cinema-dining.jpg',
    productId: 'com-1',
    theme: 'lime',
  },
  {
    id: 'b2',
    eyebrow: 'Interval Express',
    title: 'Hot in 12 min',
    sub: 'Delivered to your recliner, mid-scene.',
    cta: 'Browse snacks',
    img: '/assets/images/truffle-nachos.jpg',
    category: 'Snacks',
    theme: 'sky',
  },
  {
    id: 'b3',
    eyebrow: 'Chef Signature',
    title: 'Truffle Popcorn',
    sub: 'Parmigiano, white truffle, Maldon salt.',
    cta: 'Try it · ₹449',
    img: '/assets/images/gourmet-popcorn.jpg',
    productId: 'pop-1',
    theme: 'sand',
  },
  {
    id: 'b4',
    eyebrow: 'Sip Something New',
    title: 'Citrus Fizz',
    sub: 'Lime cordial, blue pea & garden mint.',
    cta: 'Add · ₹279',
    img: '/assets/images/citrus-fizz.jpg',
    productId: 'bev-1',
    theme: 'lime',
  },
];

const THEME: Record<BannerTheme, { bg: string; eyebrow: string; cta: string }> = {
  lime: { bg: 'bg-lime-soft', eyebrow: 'text-lime-deep', cta: 'bg-white text-ink' },
  sky: { bg: 'bg-sky-soft', eyebrow: 'text-sky-deep', cta: 'bg-lime text-ink' },
  sand: { bg: 'bg-sand-soft', eyebrow: 'text-[#8A5A22]', cta: 'bg-lime text-ink' },
};

/* ---------------------------------------------------------------- */
/* Banner carousel: native scroll-snap (smooth swipe), next card peeks,
   autoplay pauses while the guest touches or hovers it.              */
/* ---------------------------------------------------------------- */
const BannerCarousel: React.FC<{ onSelect: (b: Banner) => void }> = ({ onSelect }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [stops, setStops] = useState(BANNERS.length);
  const hold = useRef(false);

  const step = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.children.length < 2) return 1;
    return (el.children[1] as HTMLElement).offsetLeft - (el.children[0] as HTMLElement).offsetLeft;
  }, []);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setStops(Math.round((el.scrollWidth - el.clientWidth) / step()) + 1);
    setIndex(Math.round(el.scrollLeft / step()));
  }, [step]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const goTo = useCallback(
    (i: number) => trackRef.current?.scrollTo({ left: i * step(), behavior: 'smooth' }),
    [step]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      if (hold.current || document.hidden) return;
      goTo(index >= stops - 1 ? 0 : index + 1);
    }, 4500);
    return () => clearTimeout(t);
  }, [index, stops, goTo]);

  const pause = () => (hold.current = true);
  const resume = () => setTimeout(() => (hold.current = false), 1200);

  return (
    <div className="relative group/carousel">
      <div
        ref={trackRef}
        onScroll={measure}
        onPointerDown={pause}
        onPointerUp={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        onMouseEnter={pause}
        onMouseLeave={resume}
        className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 scroll-px-4 sm:-mx-6 sm:px-6 sm:scroll-px-6 lg:mx-0 lg:px-0 lg:scroll-px-0"
      >
        {BANNERS.map((b, i) => {
          const t = THEME[b.theme];
          const active = i === index || (stops < BANNERS.length && i === index + 1);
          return (
            <button
              key={b.id}
              onClick={() => onSelect(b)}
              className={`snap-start shrink-0 w-[88%] sm:w-[64%] lg:w-[calc(50%-8px)] h-[176px] sm:h-[196px] lg:h-[212px] ${t.bg} rounded-3xl overflow-hidden flex items-stretch text-left transition-transform duration-500 ease-premium active:scale-[0.99]`}
            >
              <div className="flex-1 min-w-0 py-4 pl-4 pr-2 sm:p-6 lg:p-7 flex flex-col justify-between">
                <div>
                  <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] truncate ${t.eyebrow}`}>{b.eyebrow}</p>
                  <h3 className="mt-1 font-serif text-[21px] sm:text-[28px] lg:text-[30px] font-bold leading-[1.15] text-ink truncate">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-[12px] sm:text-[13px] text-ink-soft/80 leading-snug line-clamp-2">{b.sub}</p>
                </div>
                <span className={`self-start inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full text-[11px] sm:text-xs font-bold shadow-[0_4px_12px_-6px_rgba(0,0,0,0.25)] ${t.cta}`}>
                  {b.cta}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <div className="relative w-[38%] shrink-0 p-2.5 sm:p-3">
                <div className="w-full h-full rounded-[18px] overflow-hidden bg-white/60">
                  <img
                    src={b.img}
                    alt=""
                    draggable={false}
                    className={`w-full h-full object-cover transition-transform duration-[1400ms] ease-premium ${active ? 'scale-100' : 'scale-110'}`}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop arrows */}
      <button
        onClick={() => goTo(Math.max(0, index - 1))}
        disabled={index === 0}
        className="hidden lg:flex absolute left-0 top-[106px] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white card items-center justify-center text-ink-soft opacity-0 group-hover/carousel:opacity-100 disabled:!opacity-0 transition-opacity"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => goTo(Math.min(stops - 1, index + 1))}
        disabled={index >= stops - 1}
        className="hidden lg:flex absolute right-0 top-[106px] translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white card items-center justify-center text-ink-soft opacity-0 group-hover/carousel:opacity-100 disabled:!opacity-0 transition-opacity"
        aria-label="Next banner"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Progress dots */}
      <div className="mt-3.5 flex items-center justify-center gap-1.5">
        {Array.from({ length: stops }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Show banner ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ease-premium ${i === index ? 'w-6 bg-lime-strong' : 'w-1.5 bg-black/12'}`}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
const SignatureCard: React.FC<{ item: MenuItem; onOpen: () => void }> = ({ item, onOpen }) => {
  const { addToCart, updateQuantity, cart } = useCinema();
  const qty = cart.find((c) => c.item.id === item.id)?.quantity ?? 0;
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="snap-start w-[152px] sm:w-[188px] lg:w-[calc((100%-64px)/5)] shrink-0 card rounded-[20px] overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-square bg-[#EFEFF1]">
        <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
        <span className="absolute top-2.5 left-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
          <DietaryBadge type={item.dietary} size={16} />
        </span>
      </div>
      <div className="p-3">
        <p className="text-[13px] font-semibold text-ink leading-snug line-clamp-2 min-h-[34px]">{item.name}</p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-sm font-bold text-ink tabular-nums">{formatINR(item.price)}</span>
          {qty === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
              disabled={!item.inStock}
              className="w-8 h-8 rounded-full bg-lime text-ink flex items-center justify-center disabled:opacity-40"
              aria-label={`Add ${item.name}`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <div onClick={(e) => e.stopPropagation()} className="h-8 flex items-center rounded-full bg-lime text-ink">
              <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-8 flex items-center justify-center" aria-label="Decrease">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-3 text-center text-xs font-bold tabular-nums">{qty}</span>
              <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-8 flex items-center justify-center" aria-label="Increase">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SectionHead: React.FC<{ title: string; sub?: string; action: string; onAction: () => void }> = ({ title, sub, action, onAction }) => (
  <div className="flex items-end justify-between gap-3">
    <div>
      <h2 className="font-sans text-[17px] sm:text-lg font-extrabold text-ink tracking-tight">{title}</h2>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
    <button onClick={onAction} className="text-xs font-semibold text-sky-deep flex items-center gap-0.5 shrink-0">
      {action} <ChevronRight className="w-3.5 h-3.5" />
    </button>
  </div>
);

/* ---------------------------------------------------------------- */
export const WelcomeScreen: React.FC = () => {
  const { setCurrentView, setMenuCategory, menuItems, openProduct } = useCinema();

  const [hint, setHint] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHint((h) => (h + 1) % SEARCH_HINTS.length), 2600);
    return () => clearInterval(t);
  }, []);

  const signatures = useMemo(() => menuItems.filter((m) => m.isChefSpecial), [menuItems]);

  const goMenu = (cat: Category | 'All' = 'All') => {
    setMenuCategory(cat);
    setCurrentView('menu');
  };

  const onBanner = (b: Banner) => {
    const product = b.productId && menuItems.find((m) => m.id === b.productId);
    if (product) openProduct(product);
    else goMenu(b.category ?? 'All');
  };

  const reveal = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.07 * i, ease: EASE },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-44 md:pb-32">
      {/* Search */}
      <motion.button
        {...reveal(0)}
        onClick={() => goMenu('All')}
        className="w-full lg:max-w-2xl lg:mx-auto lg:flex h-12 sm:h-[52px] rounded-2xl bg-white border border-line flex items-center gap-3 px-4 text-left shadow-[0_8px_24px_-16px_rgba(0,0,0,0.3)]"
      >
        <Search className="w-[18px] h-[18px] text-ink-soft shrink-0" />
        <span className="text-sm text-muted flex items-center gap-1 overflow-hidden h-5">
          Search for
          <span className="relative inline-block h-5 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={hint}
                className="block text-ink-soft font-medium"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                '{SEARCH_HINTS[hint]}'
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      </motion.button>

      {/* Banners */}
      <motion.section {...reveal(1)} className="mt-5 sm:mt-7">
        <BannerCarousel onSelect={onBanner} />
      </motion.section>

      {/* Service highlights: one compact strip */}
      <motion.div {...reveal(2)} className="mt-4 card rounded-2xl grid grid-cols-2 divide-x divide-line">
        {[
          { icon: <Sparkles className="w-[15px] h-[15px]" />, t: 'Free delivery', s: 'Above ₹999', chip: 'bg-lime-soft text-lime-deep' },
          { icon: <Zap className="w-[15px] h-[15px]" />, t: '12 min to seat', s: 'Mid-scene drop-off', chip: 'bg-sky-soft text-sky-deep' },
        ].map((h) => (
          <div key={h.t} className="flex items-center gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 min-w-0">
            <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${h.chip}`}>{h.icon}</span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[12.5px] font-bold text-ink truncate">{h.t}</span>
              <span className="block mt-0.5 text-[11px] text-muted truncate">{h.s}</span>
            </span>
          </div>
        ))}
      </motion.div>

      {/* Categories */}
      <motion.section {...reveal(3)} className="mt-7 sm:mt-10">
        <SectionHead title="What are you craving?" action="See all" onAction={() => goMenu('All')} />
        <div className="mt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar md:mx-0 md:px-0 md:grid md:grid-cols-6 md:overflow-visible">
          {CATEGORY_TILES.map((c) => (
            <motion.button
              key={c.name}
              whileTap={{ scale: 0.94 }}
              onClick={() => goMenu(c.name)}
              className="group flex flex-col items-center gap-2 shrink-0"
            >
              <span className="w-[68px] h-[68px] sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-white p-[3px] card transition-shadow group-hover:shadow-[0_0_0_2px_var(--color-lime)]">
                <img src={c.img} alt="" className="w-full h-full object-cover rounded-full brightness-110 transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span className="text-xs font-semibold text-ink-soft">{c.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Chef signatures */}
      <motion.section {...reveal(4)} className="mt-8 sm:mt-10">
        <SectionHead title="Chef's Signatures" sub="Most loved at Adaira" action="Full menu" onAction={() => goMenu('All')} />
        <div className="mt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 lg:scroll-px-0 pb-2">
          {signatures.map((item) => (
            <SignatureCard key={item.id} item={item} onOpen={() => openProduct(item)} />
          ))}
        </div>
      </motion.section>

      {/* Perks */}
      <motion.div {...reveal(5)} className="mt-8 sm:mt-10 card rounded-3xl grid grid-cols-3 divide-x divide-line">
        {[
          { icon: <Sparkles className="w-4 h-4" />, t: 'Made fresh', s: 'On every order' },
          { icon: <Clock className="w-4 h-4" />, t: '12 minutes', s: 'Seat drop-off' },
          { icon: <ShieldCheck className="w-4 h-4" />, t: 'Contactless', s: 'UPI & cards' },
        ].map((p) => (
          <div key={p.t} className="py-4 sm:py-5 px-2 text-center">
            <span className="mx-auto w-9 h-9 rounded-full bg-lime-soft text-lime-deep flex items-center justify-center">{p.icon}</span>
            <p className="mt-2 text-xs sm:text-sm font-bold text-ink">{p.t}</p>
            <p className="text-[10px] sm:text-xs text-muted">{p.s}</p>
          </div>
        ))}
      </motion.div>

      {/* Primary CTA */}
      <motion.button
        {...reveal(6)}
        whileTap={{ scale: 0.98 }}
        onClick={() => goMenu('All')}
        className="mt-6 w-full lg:max-w-md lg:mx-auto lg:flex h-14 rounded-2xl bg-lime text-ink font-bold text-sm flex items-center justify-center gap-2 shadow-[0_14px_30px_-16px_rgba(150,170,0,0.9)]"
      >
        View full menu
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};
