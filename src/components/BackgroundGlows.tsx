import React from 'react';

export const BackgroundGlows: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Deep gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07090F] via-[#090D18] to-[#0D1220]" />

      {/* Electric lime primary glow orb (top right) */}
      <div 
        className="absolute -top-[120px] -right-[100px] w-[380px] h-[380px] md:w-[540px] md:h-[540px] rounded-full blur-[140px] opacity-25 dark:opacity-20 animate-pulse"
        style={{
          background: 'radial-gradient(circle, #D9F20A 0%, rgba(217, 242, 10, 0.2) 50%, transparent 80%)',
          animationDuration: '8s',
        }}
      />

      {/* Soft sky blue secondary glow orb (bottom left) */}
      <div 
        className="absolute top-[40%] -left-[140px] w-[340px] h-[340px] md:w-[500px] md:h-[500px] rounded-full blur-[150px] opacity-20 dark:opacity-15"
        style={{
          background: 'radial-gradient(circle, #8DBBDA 0%, rgba(141, 187, 218, 0.25) 50%, transparent 80%)',
        }}
      />

      {/* Subtle theatre spotlight beam from ceiling */}
      <div 
        className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-[280px] md:w-[480px] h-[400px] blur-[120px] opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, #D9F20A 0%, transparent 70%)',
        }}
      />

      {/* Subtle cinema vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(7,9,15,0.75)_100%)] pointer-events-none" />
    </div>
  );
};
