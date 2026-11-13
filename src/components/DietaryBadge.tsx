import React from 'react';
import { DietaryType } from '../types';

interface DietaryBadgeProps {
  type: DietaryType;
  showText?: boolean;
  /** Pixel size of the square mark. */
  size?: number;
}

const VEG = '#0F8A3B';
const NON_VEG = '#C8372D';

/**
 * Standard Indian food mark: a square outline with a filled circle (veg)
 * or a filled triangle (non-veg). Drawn as SVG so it stays crisp at any size.
 */
export const DietaryBadge: React.FC<DietaryBadgeProps> = ({ type, showText = false, size = 16 }) => {
  const isVeg = type === 'veg';
  const color = isVeg ? VEG : NON_VEG;
  const label = isVeg ? 'Vegetarian' : 'Non-vegetarian';

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0" title={label}>
      <svg width={size} height={size} viewBox="0 0 16 16" role="img" aria-label={label} className="block shrink-0">
        <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="3" fill="#FFFFFF" stroke={color} strokeWidth="1.5" />
        {isVeg ? (
          <circle cx="8" cy="8" r="3.75" fill={color} />
        ) : (
          <path d="M8 3.9 L12.1 11.2 H3.9 Z" fill={color} stroke={color} strokeWidth="0.9" strokeLinejoin="round" />
        )}
      </svg>
      {showText && (
        <span className="text-[11px] font-semibold" style={{ color }}>
          {isVeg ? 'Veg' : 'Non-veg'}
        </span>
      )}
    </span>
  );
};
