import React, { useState, useMemo } from 'react';
import { useCinema } from '../context/CinemaContext';
import { Category, DietaryType } from '../types';
import { MenuItemCard } from './MenuItemCard';
import { Search, X, SlidersHorizontal, Popcorn, Coffee, UtensilsCrossed, CakeSlice, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const CATEGORIES: { name: Category; label: string; icon: React.ReactNode }[] = [
  { name: 'Popcorn', label: 'Popcorn', icon: <Popcorn className="w-4 h-4" /> },
  { name: 'Snacks', label: 'Snacks', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { name: 'Meals', label: 'Meals', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { name: 'Beverages', label: 'Beverages', icon: <Coffee className="w-4 h-4" /> },
  { name: 'Desserts', label: 'Desserts', icon: <CakeSlice className="w-4 h-4" /> },
  { name: 'Combos', label: 'Combos', icon: <Sparkles className="w-4 h-4" /> },
];

export const MenuScreen: React.FC = () => {
  const { menuItems, screen, seat, setIsSeatModalOpen } = useCinema();

  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | DietaryType>('all');

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category match
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Dietary match
      if (dietaryFilter !== 'all' && item.dietary !== dietaryFilter) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesCat || matchesTags;
      }
      return true;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery]);

  return (
    <div className="pb-28 max-w-7xl mx-auto px-3 sm:px-6">
      {/* Top Banner / Screen Anchor reminder */}
      <div className="py-2.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-white/10">
        <div>
          <span className="text-[9px] sm:text-[10px] tracking-[0.22em] text-[#8DBBDA] uppercase font-semibold">
            IN-THEATRE CULINARY
          </span>
          <h2 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Cinema Dining Menu
          </h2>
        </div>

        <button
          onClick={() => setIsSeatModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] sm:text-xs text-white/80 transition-colors"
        >
          <span className="text-white/50">Delivering to:</span>
          <span className="font-bold text-[#D9F20A]">{screen} · Seat {seat}</span>
          <span className="text-[#8DBBDA] underline text-[10px] sm:text-[11px] ml-0.5">Edit</span>
        </button>
      </div>

      {/* Sticky Search & Filter Toolbar */}
      <div className="sticky top-13 sm:top-16 z-30 pt-2 pb-2 -mx-3 px-3 sm:-mx-6 sm:px-6 glass-panel border-b border-white/10 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-2 sm:gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              placeholder="Search popcorn, burgers, drinks, combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/40 text-xs sm:text-sm focus:outline-none focus:border-[#D9F20A] focus:ring-1 focus:ring-[#D9F20A] transition-all min-h-[38px] sm:min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Veg / Non-Veg Segmented Control */}
          <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-white/5 rounded-xl border border-white/10 shrink-0 self-start md:self-auto min-h-[38px] sm:min-h-[44px]">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap min-h-[32px] sm:min-h-[36px] ${
                dietaryFilter === 'all'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap min-h-[32px] sm:min-h-[36px] ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-white/60 hover:text-emerald-400'
              }`}
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
              <span>Veg</span>
            </button>
            <button
              onClick={() => setDietaryFilter('non-veg')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap min-h-[32px] sm:min-h-[36px] ${
                dietaryFilter === 'non-veg'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-white/60 hover:text-rose-400'
              }`}
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400" />
              <span>Non-Veg</span>
            </button>
          </div>
        </div>

        {/* Category Tab Bar (Horizontal Scroller) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-2 pb-0.5">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap min-h-[34px] sm:min-h-[40px] shrink-0 ${
              selectedCategory === 'All'
                ? 'bg-[#D9F20A] text-black shadow-sm shadow-[#D9F20A]/20'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            All
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap min-h-[34px] sm:min-h-[40px] shrink-0 ${
                  isSelected
                    ? 'bg-[#D9F20A] text-black shadow-sm shadow-[#D9F20A]/20'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Item count & active filter hint */}
      <div className="pt-3 pb-1.5 flex items-center justify-between text-[11px] sm:text-xs text-white/50">
        <span>
          Showing <span className="text-white font-semibold">{filteredItems.length}</span> items
        </span>
        {(searchQuery || dietaryFilter !== 'all' || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setDietaryFilter('all');
              setSelectedCategory('All');
            }}
            className="text-[#D9F20A] hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Menu Cards Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mt-1 sm:mt-2">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 sm:py-16 text-center rounded-2xl sm:rounded-3xl glass-panel border border-white/10 my-4 sm:my-6">
          <SlidersHorizontal className="w-8 h-8 sm:w-10 sm:h-10 text-white/30 mx-auto mb-2.5" />
          <h3 className="text-base sm:text-lg font-serif font-bold text-white">No items found</h3>
          <p className="text-xs text-white/60 max-w-sm mx-auto mt-1">
            We couldn't find any dishes matching your current search or dietary filter. Try clearing your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDietaryFilter('all');
              setSelectedCategory('All');
            }}
            className="mt-3.5 px-4 py-2 rounded-xl bg-[#D9F20A] text-black text-xs font-bold"
          >
            View All Dishes
          </button>
        </div>
      )}
    </div>
  );
};
