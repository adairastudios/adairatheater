import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { X, Check, Armchair } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { SCREEN_NAMES as SCREENS, SEAT_ROWS as ROWS, SEAT_NUMBERS as SEATS_PER_ROW } from '../utils/seatQr';

export const SeatSelectionModal: React.FC = () => {
  const {
    isSeatModalOpen,
    setIsSeatModalOpen,
    screen,
    seat,
    setSeatDetails,
  } = useCinema();

  const [selectedScreen, setSelectedScreen] = useState(screen);
  const [selectedSeat, setSelectedSeat] = useState(seat);
  const [manualInput, setManualInput] = useState('');

  if (!isSeatModalOpen) return null;

  const handleConfirm = () => {
    const finalSeat = manualInput.trim() ? manualInput.trim().toUpperCase() : selectedSeat;
    setSeatDetails({
      screen: selectedScreen,
      seat: finalSeat,
    });
    setIsSeatModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSeatModalOpen(false)}
          className="fixed inset-0 bg-black/35 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white card-raised rounded-2xl sm:rounded-3xl p-4 sm:p-6 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-line">
            <div>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-sky-deep uppercase font-semibold">
                Theatre Location
              </span>
              <h3 className="text-lg sm:text-xl font-serif text-ink font-semibold">
                Select Your Seat
              </h3>
            </div>
            <button
              onClick={() => setIsSeatModalOpen(false)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F5F5F5] hover:bg-black/5 flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto no-scrollbar py-3 sm:py-4 space-y-4 sm:space-y-5 flex-1">
            {/* Screen Selector */}
            <div>
              <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted mb-1.5 block">
                Auditorium / Screen
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {SCREENS.map((scr) => (
                  <button
                    key={scr}
                    type="button"
                    onClick={() => setSelectedScreen(scr)}
                    className={`py-1.5 px-2.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all min-h-[38px] sm:min-h-[44px] ${
                      selectedScreen === scr
                        ? 'bg-[#D9F20A] text-black font-bold shadow-sm shadow-[#D9F20A]/20'
                        : 'bg-[#F5F5F5] text-ink-soft hover:bg-black/5 border border-line'
                    }`}
                  >
                    {scr}
                  </button>
                ))}
              </div>
            </div>

            {/* Movie Screen Graphic */}
            <div className="text-center pt-1">
              <div className="w-3/4 h-1 sm:h-1.5 mx-auto bg-gradient-to-r from-transparent via-[#8DBBDA] to-transparent rounded-full " />
              <span className="text-[9px] sm:text-[10px] tracking-[0.28em] text-sky-deep uppercase block mt-1 font-medium">
                THEATRE SCREEN
              </span>
            </div>

            {/* Interactive Seat Grid */}
            <div className="space-y-1 select-none overflow-x-auto pb-1">
              {ROWS.map((row) => (
                <div key={row} className="flex items-center justify-center gap-1 sm:gap-1.5 min-w-[300px]">
                  <span className="w-3.5 text-[10px] sm:text-xs font-bold text-faint text-center">{row}</span>
                  <div className="flex gap-0.5 sm:gap-1">
                    {SEATS_PER_ROW.slice(0, 7).map((num) => {
                      const seatCode = `${row}${num < 10 ? '0' + num : num}`;
                      const isSelected = selectedSeat === seatCode;
                      return (
                        <button
                          key={seatCode}
                          type="button"
                          onClick={() => {
                            setSelectedSeat(seatCode);
                            setManualInput('');
                          }}
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded text-[8px] sm:text-[9px] font-bold flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#D9F20A] text-black scale-110 shadow-sm shadow-[#D9F20A]'
                              : 'bg-[#F1F1F3] hover:bg-black/10 text-ink-soft border border-line'
                          }`}
                          aria-label={`Seat ${seatCode}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Aisle Spacer */}
                  <div className="w-2.5 text-center text-faint text-[7px]">·</div>

                  <div className="flex gap-0.5 sm:gap-1">
                    {SEATS_PER_ROW.slice(7).map((num) => {
                      const seatCode = `${row}${num < 10 ? '0' + num : num}`;
                      const isSelected = selectedSeat === seatCode;
                      return (
                        <button
                          key={seatCode}
                          type="button"
                          onClick={() => {
                            setSelectedSeat(seatCode);
                            setManualInput('');
                          }}
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded text-[8px] sm:text-[9px] font-bold flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#D9F20A] text-black scale-110 shadow-sm shadow-[#D9F20A]'
                              : 'bg-[#F1F1F3] hover:bg-black/10 text-ink-soft border border-line'
                          }`}
                          aria-label={`Seat ${seatCode}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <span className="w-3.5 text-[10px] sm:text-xs font-bold text-faint text-center">{row}</span>
                </div>
              ))}
            </div>

            {/* Manual seat override */}
            <div className="pt-2 border-t border-line flex items-center gap-2.5">
              <label htmlFor="manual-seat-input" className="text-[11px] sm:text-xs text-ink-soft whitespace-nowrap">
                Or enter seat:
              </label>
              <input
                id="manual-seat-input"
                type="text"
                placeholder="e.g. VIP-4 or F12"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg sm:rounded-xl bg-[#F5F5F5] border border-line text-ink text-xs placeholder:text-faint focus:outline-none focus:border-ink/40 uppercase"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 sm:pt-4 border-t border-line flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="text-muted block text-[10px]">Chosen:</span>
              <span className="font-bold text-ink text-xs sm:text-sm">
                {selectedScreen} · Seat {manualInput.trim().toUpperCase() || selectedSeat}
              </span>
            </div>
            <button
              onClick={handleConfirm}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#D9F20A] text-black font-bold text-xs sm:text-sm hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md shadow-[#D9F20A]/20 min-h-[40px] sm:min-h-[44px]"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Confirm Seat</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
