import React, { useState, useMemo } from 'react';
import { useCinema } from '../context/CinemaContext';
import { Category, DietaryType } from '../types';
import { MenuItemCard } from './MenuItemCard';
import { Search, X, SlidersHorizontal, Popcorn, Coffee, UtensilsCrossed, CakeSlice, Sparkles, LayoutGrid, Sandwich } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const CATEGORIES: { name: Category | 'All'; icon: React.ReactNode }[] = [
  { name: 'All', icon: <LayoutGrid className="w-4 h-4" /> },
  { name: 'Popcorn', icon: <Popcorn className="w-4 h-4" /> },
  { name: 'Snacks', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { name: 'Meals', icon: <Sandwich className="w-4 h-4" /> },
  { name: 'Beverages', icon: <Coffee className="w-4 h-4" /> },
  { name: 'Desserts', icon: <CakeSlice className="w-4 h-4" /> },
  { name: 'Combos', icon: <Sparkles className="w-4 h-4" /> },
];

export const MenuScreen: React.FC = () => {
  const { menuItems, navHidden, menuCategory: selectedCategory, setMenuCategory: setSelectedCategory } =
    useCinema();

  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | DietaryType>('all');

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return menuItems.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (dietaryFilter !== 'all' && item.dietary !== dietaryFilter) return false;
      if (query) {
        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          !!item.tags?.some((t) => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setDietaryFilter('all');
    setSelectedCategory('All');
  };

  const isVeg = dietaryFilter === 'veg';

  return (
    <div className="pb-44 md:pb-32 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="pt-4 pb-3 flex items-end justify-between gap-3">
        <div>
          <span className="text-[11px] tracking-[0.16em] text-muted uppercase font-semibold">In-theatre kitchen</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">Cinema Menu</h2>
        </div>
      </div>

      {/* Sticky toolbar */}
      <div className={`sticky ${navHidden ? 'top-0' : 'top-14 sm:top-16'} transition-[top] duration-[450ms] ease-premium z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pt-2 pb-2 frosted border-b border-line`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
            <input
              type="text"
              placeholder="Search popcorn, burgers, drinks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white border border-line text-ink placeholder:text-faint text-sm focus:outline-none focus:border-ink/40 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/5 flex items-center justify-center text-ink-soft"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Veg toggle, Swiggy-style */}
          <button
            onClick={() => setDietaryFilter(isVeg ? 'all' : 'veg')}
            className="h-11 px-3 rounded-2xl bg-white border border-line flex flex-col items-center justify-center gap-0.5 shrink-0"
            aria-pressed={isVeg}
            aria-label="Veg only"
          >
            <span className="text-[9px] font-extrabold tracking-wider text-ink-soft leading-none">VEG</span>
            <span className={`relative w-8 h-3.5 rounded-full transition-colors ${isVeg ? 'bg-emerald-500' : 'bg-black/15'}`}>
              <motion.span
                className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow"
                animate={{ left: isVeg ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            </span>
          </button>
        </div>

        {/* Category tabs with sliding underline */}
        <div className="mt-2 flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`relative flex items-center gap-1.5 px-3 h-10 text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                  active ? 'text-ink' : 'text-muted hover:text-ink-soft'
                }`}
              >
                {cat.icon}
                {cat.name.toUpperCase()}
                {active && (
                  <motion.span
                    layoutId="cat-underline"
                    className="absolute left-2 right-2 -bottom-0.5 h-[3px] rounded-full bg-lime-strong"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <div className="pt-3 pb-2 flex items-center justify-between text-xs text-muted">
        <span>
          <span className="text-ink font-bold">{filteredItems.length}</span> dishes
          {isVeg && <span className="ml-1 text-emerald-600 font-semibold">· Veg only</span>}
        </span>
        {(searchQuery || dietaryFilter !== 'all' || selectedCategory !== 'All') && (
          <button onClick={resetFilters} className="text-sky-deep font-semibold">
            Reset
          </button>
        )}
      </div>

      {/* 2x2 grid */}
      {filteredItems.length > 0 ? (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => (
              <MenuItemCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="py-14 text-center card rounded-3xl my-4">
          <SlidersHorizontal className="w-9 h-9 text-faint mx-auto mb-2.5" />
          <h3 className="text-lg font-serif font-bold text-ink">Nothing matches</h3>
          <p className="text-xs text-muted max-w-xs mx-auto mt-1">Try a different search or clear your filters.</p>
          <button onClick={resetFilters} className="mt-4 px-5 h-10 rounded-full bg-lime text-ink text-xs font-bold">
            Show all dishes
          </button>
        </div>
      )}
    </div>
  );
};
