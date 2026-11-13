import React from 'react';

/** Plain white-smoke canvas with a barely-there lime wash at the top. */
export const BackgroundGlows: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-smoke" aria-hidden="true">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full blur-[110px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(217,242,10,0.35) 0%, transparent 70%)' }}
      />
    </div>
  );
};
