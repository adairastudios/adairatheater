import React, { useState } from 'react';
import { useCinema } from '../context/CinemaContext';
import { X, Bell, Droplets, Utensils, HelpCircle, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ASSISTANCE_OPTIONS = [
  { id: 'water', label: 'Still Water Glass', icon: <Droplets className="w-4 h-4 text-sky-400" /> },
  { id: 'napkins', label: 'Extra Napkins & Wipes', icon: <Utensils className="w-4 h-4 text-emerald-400" /> },
  { id: 'cutlery', label: 'Cutlery & Straws', icon: <Utensils className="w-4 h-4 text-amber-400" /> },
  { id: 'usher', label: 'Summon Floor Usher', icon: <Bell className="w-4 h-4 text-[#D9F20A]" /> },
];

export const UsherHelpModal: React.FC = () => {
  const {
    isUsherModalOpen,
    setIsUsherModalOpen,
    callUsher,
    screen,
    seat,
  } = useCinema();

  const [selectedType, setSelectedType] = useState('usher');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isUsherModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const typeObj = ASSISTANCE_OPTIONS.find((o) => o.id === selectedType);
    callUsher(typeObj ? typeObj.label : 'General Assistance', note);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsUsherModalOpen(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsUsherModalOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md glass-panel-elevated rounded-2xl sm:rounded-3xl border border-white/20 p-4 sm:p-6 z-10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D9F20A]/15 border border-[#D9F20A]/30 flex items-center justify-center text-[#D9F20A]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] tracking-[0.2em] text-[#8DBBDA] uppercase font-bold">
                  In-Theatre Support
                </span>
                <h3 className="text-lg font-serif font-bold text-white">Call Theatre Usher</h3>
              </div>
            </div>

            <button
              onClick={() => setIsUsherModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#D9F20A] text-black flex items-center justify-center mx-auto shadow-lg shadow-[#D9F20A]/30">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h4 className="font-bold text-base text-white">Usher Alerted</h4>
              <p className="text-xs text-white/60">
                Staff has received your request for {screen} · Seat {seat}. An usher is on the way.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="py-4 space-y-4">
              <p className="text-xs text-white/70">
                Need anything during the screening? Select an option below and floor staff will arrive discreetly at <strong className="text-white">{screen} · Seat {seat}</strong>.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {ASSISTANCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedType(opt.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all min-h-[44px] ${
                      selectedType === opt.id
                        ? 'bg-white/15 border-[#D9F20A] text-white shadow-sm glow-lime-inner'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {opt.icon}
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="usher-note-input" className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1 block">
                  Optional Note
                </label>
                <input
                  id="usher-note-input"
                  type="text"
                  placeholder="e.g. Please bring extra ice, spill assistance"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-[#D9F20A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#D9F20A] text-black font-extrabold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.98] transition-all min-h-[44px]"
              >
                Send Request to Floor Staff
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
