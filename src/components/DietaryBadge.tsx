import React from 'react';
import { DietaryType } from '../types';

interface DietaryBadgeProps {
  type: DietaryType;
  showText?: boolean;
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({ type, showText = false }) => {
  const isVeg = type === 'veg';

  return (
    <div className="inline-flex items-center gap-1.5" title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
      {/* Official cinema culinary standard square with dot/triangle */}
      <div
        className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 ${
          isVeg
            ? 'border-emerald-500 bg-emerald-950/40'
            : 'border-rose-500 bg-rose-950/40'
        }`}
        aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      >
        {isVeg ? (
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        ) : (
          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-rose-400" />
        )}
      </div>

      {showText && (
        <span className={`text-[11px] font-semibold tracking-wide ${isVeg ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isVeg ? 'Pure Veg' : 'Non-Veg'}
        </span>
      )}
    </div>
  );
};
