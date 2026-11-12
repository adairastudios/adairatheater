import React, { useState, useEffect, useRef } from 'react';
import { useCinema } from '../context/CinemaContext';
import { OrderStatus, MenuItem } from '../types';
import {
  ChefHat,
  Armchair,
  Clock,
  CheckCircle2,
  Package,
  QrCode,
  Bell,
  ArrowRight,
  Printer,
  Download,
  ExternalLink,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Check,
  Flame,
  Utensils,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { DietaryBadge } from './DietaryBadge';
import { formatINR } from '../utils/currency';
import {
  SCREEN_NAMES,
  SEAT_ROWS,
  SEAT_NUMBERS,
  formatSeatCode,
  getPublicSiteUrl,
  isLocalSiteUrl,
  buildSeatUrl,
  buildSeatPath,
} from '../utils/seatQr';

type AdminTab = 'kds' | 'stock' | 'qr' | 'usher';

const ALL_SCREENS = SCREEN_NAMES;
const ROWS = SEAT_ROWS;

/** Plain black-on-white, standard quiet zone, medium error correction: scans reliably when printed. */
const QR_OPTIONS = {
  errorCorrectionLevel: 'M' as const,
  margin: 4,
  color: { dark: '#000000', light: '#FFFFFF' },
};

interface PrintCard {
  screen: string;
  seat: string;
  qr: string;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Writes a clean, printable sheet of seat cards into an already-opened window. */
const writePrintSheet = (win: Window, title: string, cards: PrintCard[]) => {
  const single = cards.length === 1;
  const cardHtml = cards
    .map(
      (c) => `
      <div class="card">
        <div class="brand">ADAIRA STUDIOS</div>
        <div class="seat">${escapeHtml(c.screen)} &middot; Seat ${escapeHtml(c.seat)}</div>
        <img src="${c.qr}" alt="QR code for ${escapeHtml(c.screen)} seat ${escapeHtml(c.seat)}" />
        <div class="hint">Scan to order food to your seat</div>
      </div>`
    )
    .join('');

  win.document.open();
  win.document.write(`<!doctype html>
<html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; background: #fff; }
  .sheet { display: grid; grid-template-columns: repeat(${single ? 1 : 3}, ${single ? '90mm' : '1fr'}); gap: 6mm; justify-content: center; }
  .card { border: 1px dashed #999; padding: 5mm 4mm; text-align: center; break-inside: avoid; page-break-inside: avoid; }
  .brand { font-size: ${single ? 11 : 8}pt; letter-spacing: 0.25em; color: #555; font-weight: bold; }
  .seat { font-size: ${single ? 20 : 13}pt; font-weight: bold; margin: 2mm 0 3mm; }
  img { width: ${single ? 70 : 45}mm; height: ${single ? 70 : 45}mm; display: block; margin: 0 auto; image-rendering: pixelated; }
  .hint { font-size: ${single ? 11 : 8}pt; color: #333; margin-top: 2mm; }
</style></head>
<body><div class="sheet">${cardHtml}</div>
<script>
  Promise.all(Array.from(document.images).map(function (i) { return i.complete ? 0 : new Promise(function (r) { i.onload = i.onerror = r; }); }))
    .then(function () { setTimeout(function () { window.print(); }, 100); });
</script>
</body></html>`);
  win.document.close();
};

export const AdminKitchenScreen: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    menuItems,
    toggleItemStock,
    usherRequests,
    resolveUsherRequest,
    setCurrentView,
    setSeatDetails,
    theatre,
  } = useCinema();

  const [activeTab, setActiveTab] = useState<AdminTab>('kds');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  // QR Generator states
  const [qrScreen, setQrScreen] = useState('Screen 3');
  const [qrRow, setQrRow] = useState('F');
  const [qrSeatNum, setQrSeatNum] = useState(12);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const [isPrintingAll, setIsPrintingAll] = useState(false);

  const targetSeat = formatSeatCode(qrRow, qrSeatNum);
  const siteUrl = getPublicSiteUrl();
  const siteIsLocal = isLocalSiteUrl(siteUrl);
  const qrTargetUrl = buildSeatUrl(qrScreen, targetSeat);

  // Generate a high-resolution QR code on change (sharp when printed or downloaded)
  useEffect(() => {
    QRCode.toDataURL(qrTargetUrl, { ...QR_OPTIONS, width: 1024 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code error', err));
  }, [qrTargetUrl]);

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `adaira-qr-${qrScreen.replace(/\s+/g, '-').toLowerCase()}-${targetSeat}.png`;
    a.click();
  };

  const handlePrintCard = () => {
    if (!qrDataUrl) return;
    const win = window.open('', '_blank');
    if (!win) return alert('Please allow pop-ups for this site to print QR cards.');
    writePrintSheet(win, `${qrScreen} · Seat ${targetSeat}`, [
      { screen: qrScreen, seat: targetSeat, qr: qrDataUrl },
    ]);
  };

  const handlePrintAllSeats = async () => {
    // Open the window synchronously so pop-up blockers allow it, then fill it.
    const win = window.open('', '_blank');
    if (!win) return alert('Please allow pop-ups for this site to print QR cards.');
    setIsPrintingAll(true);
    try {
      const cards: PrintCard[] = [];
      for (const row of SEAT_ROWS) {
        for (const num of SEAT_NUMBERS) {
          const seat = formatSeatCode(row, num);
          const qr = await QRCode.toDataURL(buildSeatUrl(qrScreen, seat), { ...QR_OPTIONS, width: 512 });
          cards.push({ screen: qrScreen, seat, qr });
        }
      }
      writePrintSheet(win, `${qrScreen} · All Seat QR Codes`, cards);
    } catch (err) {
      console.error('QR sheet error', err);
      win.close();
    } finally {
      setIsPrintingAll(false);
    }
  };

  // Audio beep simulation on order status or toggle
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  // Metrics
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const onTheWayCount = orders.filter((o) => o.status === 'on_the_way').length;
  const completedCount = orders.filter((o) => o.status === 'delivered').length;
  const pendingUsherCount = usherRequests.filter((r) => !r.resolved).length;

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const handleTestScan = () => {
    setSeatDetails({
      screen: qrScreen,
      seat: targetSeat,
    });
    // Update browser URL query params without reloading
    window.history.pushState({}, '', buildSeatPath(qrScreen, targetSeat));
    setCurrentView('welcome');
  };

  return (
    <div className="pb-28 max-w-7xl mx-auto px-3 sm:px-6">
      {/* KDS Header & Sub-Bar */}
      <div className="py-3 sm:py-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#D9F20A] text-black flex items-center justify-center font-bold shadow-md shadow-[#D9F20A]/20 shrink-0">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] tracking-[0.22em] text-[#8DBBDA] uppercase font-bold">
                KITCHEN DISPLAY SYSTEM · AD-KDS
              </span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-tight">
              Adaira Studios · Dispatch Station
            </h1>
          </div>
        </div>

        {/* Right Station Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playChime();
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all min-h-[38px] sm:min-h-[44px] ${
              soundEnabled
                ? 'bg-white/10 border-white/20 text-[#D9F20A]'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
            title="Toggle kitchen order audio chime"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span>Chime {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setCurrentView('menu')}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold border border-white/15 min-h-[38px] sm:min-h-[44px]"
          >
            <span>Exit to Menu</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 my-3 sm:my-4">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-white/10">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/50 tracking-wider block">
            Active Orders
          </span>
          <span className="text-xl sm:text-3xl font-extrabold text-[#D9F20A] tabular-nums">
            {activeOrdersCount}
          </span>
        </div>
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-white/10">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/50 tracking-wider block">
            In Prep
          </span>
          <span className="text-xl sm:text-3xl font-extrabold text-amber-400 tabular-nums">
            {preparingCount}
          </span>
        </div>
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-white/10">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/50 tracking-wider block">
            Out For Delivery
          </span>
          <span className="text-xl sm:text-3xl font-extrabold text-[#8DBBDA] tabular-nums">
            {onTheWayCount}
          </span>
        </div>
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-white/10">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/50 tracking-wider block">
            Delivered Today
          </span>
          <span className="text-xl sm:text-3xl font-extrabold text-emerald-400 tabular-nums">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-white/10 pb-2.5 sm:pb-3 mb-4 sm:mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('kds')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap min-h-[38px] sm:min-h-[44px] ${
            activeTab === 'kds'
              ? 'bg-[#D9F20A] text-black shadow-sm shadow-[#D9F20A]/20'
              : 'bg-white/5 text-white/70 hover:text-white'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Live Orders (KDS)</span>
          {activeOrdersCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-black text-[#D9F20A]">
              {activeOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === 'stock'
              ? 'bg-[#D9F20A] text-black shadow-md shadow-[#D9F20A]/20'
              : 'bg-white/5 text-white/70 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === 'qr'
              ? 'bg-[#D9F20A] text-black shadow-md shadow-[#D9F20A]/20'
              : 'bg-white/5 text-white/70 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Seat QR Generator & Tester</span>
        </button>

        <button
          onClick={() => setActiveTab('usher')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === 'usher'
              ? 'bg-[#D9F20A] text-black shadow-md shadow-[#D9F20A]/20'
              : 'bg-white/5 text-white/70 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Floor Usher Calls</span>
          {pendingUsherCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
              {pendingUsherCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB A: LIVE ORDERS (KDS) */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          {/* Filter Sub-Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <span className="text-xs text-white/40 mr-1">Filter:</span>
            {(['all', 'placed', 'preparing', 'on_the_way', 'delivered'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Orders Grid */}
          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((ord) => {
                const elapsedMins = Math.max(1, Math.floor((Date.now() - ord.createdAt) / 60000));

                return (
                  <div
                    key={ord.id}
                    className={`rounded-3xl glass-panel border p-5 flex flex-col justify-between transition-all ${
                      ord.status === 'placed'
                        ? 'border-amber-500/50 bg-amber-950/20 shadow-lg shadow-amber-950/30'
                        : ord.status === 'preparing'
                        ? 'border-[#D9F20A]/50 bg-[#D9F20A]/5 shadow-lg shadow-[#D9F20A]/10'
                        : ord.status === 'on_the_way'
                        ? 'border-[#8DBBDA]/50 bg-[#8DBBDA]/5'
                        : 'border-white/10 opacity-70'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Seat & Screen Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#D9F20A] text-black font-extrabold flex items-center justify-center text-xs">
                            <Armchair className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-lg font-black text-white tracking-wide block leading-none">
                              {ord.seat}
                            </span>
                            <span className="text-[10px] text-[#8DBBDA] uppercase font-bold tracking-wider">
                              {ord.screen}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] font-mono font-bold text-white/70 block">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[10px] text-white/40 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3 text-[#D9F20A]" />
                            {elapsedMins}m ago
                          </span>
                        </div>
                      </div>

                      {/* Guest & Timing Details */}
                      <div className="py-2.5 flex items-center justify-between text-xs text-white/70 border-b border-white/5">
                        <span>{ord.customerName}</span>
                        <span className="text-[11px] text-[#D9F20A] font-semibold">
                          {ord.deliveryPreference === 'now' ? '⚡ Deliver ASAP' : '🍿 At Interval'}
                        </span>
                      </div>

                      {/* Itemized Kitchen Prep List */}
                      <div className="py-3 space-y-2">
                        {ord.items.map((ci, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs">
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-md bg-white/10 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                                {ci.quantity}x
                              </span>
                              <div>
                                <span className="font-semibold text-white">{ci.item.name}</span>
                                {ci.instructions && (
                                  <div className="mt-0.5 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                                    Note: "{ci.instructions}"
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {ord.specialInstructions && (
                          <div className="mt-2 p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#8DBBDA]">
                            <strong>Delivery Note:</strong> {ord.specialInstructions}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">Current Status:</span>
                        <span className="font-bold uppercase tracking-wider text-white text-[11px]">
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {ord.status === 'placed' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(ord.id, 'preparing');
                              playChime();
                            }}
                            className="col-span-2 py-2.5 px-3 rounded-xl bg-[#D9F20A] text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 min-h-[44px]"
                          >
                            <Flame className="w-4 h-4" />
                            <span>Start Preparing</span>
                          </button>
                        )}

                        {ord.status === 'preparing' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(ord.id, 'on_the_way');
                              playChime();
                            }}
                            className="col-span-2 py-2.5 px-3 rounded-xl bg-[#8DBBDA] text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 min-h-[44px]"
                          >
                            <Utensils className="w-4 h-4" />
                            <span>Dispatch / Out for Delivery</span>
                          </button>
                        )}

                        {ord.status === 'on_the_way' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(ord.id, 'delivered');
                              playChime();
                            }}
                            className="col-span-2 py-2.5 px-3 rounded-xl bg-emerald-400 text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 min-h-[44px]"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Delivered to Seat</span>
                          </button>
                        )}

                        {ord.status === 'delivered' && (
                          <div className="col-span-2 py-2 px-3 rounded-xl bg-white/5 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Delivered Successfully</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center rounded-3xl glass-panel border border-white/10">
              <ChefHat className="w-10 h-10 text-white/30 mx-auto mb-2" />
              <h3 className="font-serif font-bold text-lg text-white">No orders matching filter</h3>
              <p className="text-xs text-white/50 mt-1">All kitchen trays are cleared!</p>
            </div>
          )}
        </div>
      )}

      {/* TAB B: MENU STOCK MANAGER */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Live Kitchen Stock Management
              </h3>
              <p className="text-xs text-white/60">
                Toggle items out of stock if ingredients run out. Guests will instantly see "Sold Out" on the customer menu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <DietaryBadge type={item.dietary} />
                      <h4 className="font-semibold text-xs sm:text-sm text-white truncate">
                        {item.name}
                      </h4>
                    </div>
                    <span className="text-xs text-[#8DBBDA] font-medium">
                      {item.category} · {formatINR(item.price)}
                    </span>
                  </div>
                </div>

                {/* In Stock Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleItemStock(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] shrink-0 ${
                    item.inStock
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                  }`}
                  aria-label={`Toggle stock for ${item.name}`}
                >
                  {item.inStock ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In Stock</span>
                    </>
                  ) : (
                    <span>Sold Out</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB C: SEAT QR CODE GENERATOR & TESTER */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-5">
            <div>
              <span className="text-[10px] tracking-[0.2em] text-[#8DBBDA] uppercase font-bold">
                Seat QR Setup
              </span>
              <h3 className="text-xl font-serif font-bold text-white">Generate Seat QR Code</h3>
              <p className="text-xs text-white/60 mt-1">
                Each seat in the auditorium gets a unique QR code. When scanned, it automatically opens the menu with that screen and seat preloaded.
              </p>
            </div>

            {/* Screen Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2 block">
                Auditorium / Screen
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ALL_SCREENS.map((scr) => (
                  <button
                    key={scr}
                    type="button"
                    onClick={() => setQrScreen(scr)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                      qrScreen === scr
                        ? 'bg-[#D9F20A] text-black font-bold'
                        : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {scr}
                  </button>
                ))}
              </div>
            </div>

            {/* Row & Seat Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5 block">
                  Row
                </label>
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {ROWS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setQrRow(r)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold shrink-0 flex items-center justify-center transition-all ${
                        qrRow === r
                          ? 'bg-[#D9F20A] text-black'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5 block">
                  Seat Number
                </label>
                <select
                  value={qrSeatNum}
                  onChange={(e) => setQrSeatNum(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-[#D9F20A] min-h-[44px]"
                >
                  {SEAT_NUMBERS.map((n) => (
                    <option key={n} value={n} className="bg-slate-900 text-white">
                      Seat {n < 10 ? '0' + n : n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target URL Display */}
            <div className="p-3 rounded-xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                QR opens this link
              </span>
              <p className="text-xs font-mono text-[#D9F20A] break-all">
                {qrTargetUrl}
              </p>
            </div>

            {siteIsLocal && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-200 text-xs leading-relaxed">
                <strong className="block text-amber-300 mb-0.5">These QR codes point to your computer ({siteUrl}).</strong>
                Phones can't open this address. Open this page from your live Vercel site
                (e.g. <span className="font-mono">https://your-site.vercel.app/admin</span>) before printing, or set{' '}
                <span className="font-mono">VITE_PUBLIC_SITE_URL</span>.
              </div>
            )}

            {/* Direct Test Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestScan}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#D9F20A] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all min-h-[48px] shadow-lg shadow-[#D9F20A]/20"
              >
                <ExternalLink className="w-4 h-4 text-black" />
                <span>Test Guest Scan ({qrScreen} · Seat {targetSeat})</span>
              </button>
              <p className="text-center text-[11px] text-white/50 mt-2">
                Simulates scanning the QR sticker on Seat {targetSeat}.
              </p>
            </div>
          </div>

          {/* Seat Tent-Card Preview */}
          <div className="p-6 rounded-3xl glass-panel-elevated border border-white/20 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] tracking-[0.25em] text-[#8DBBDA] uppercase font-bold mb-4">
              Seat Armrest Tent-Card Preview
            </span>

            {/* Plain printable card: black on white, nothing that could confuse a scanner */}
            <div className="w-full max-w-xs bg-white text-black px-6 py-5 rounded-2xl shadow-2xl text-center">
              <span className="text-[10px] tracking-[0.25em] text-gray-500 uppercase font-bold block">
                Adaira Studios
              </span>
              <h4 className="text-xl font-bold tracking-tight text-black mt-1 mb-3">
                {qrScreen} · Seat {targetSeat}
              </h4>

              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${qrScreen} seat ${targetSeat}`}
                  className="w-56 h-56 mx-auto [image-rendering:pixelated]"
                />
              ) : (
                <div className="w-56 h-56 mx-auto bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  Generating...
                </div>
              )}

              <p className="text-xs text-gray-700 font-medium mt-3">Scan to order food to your seat</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-xs">
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={!qrDataUrl}
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={handlePrintCard}
                disabled={!qrDataUrl}
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>Print Card</span>
              </button>
              <button
                type="button"
                onClick={handlePrintAllSeats}
                disabled={isPrintingAll}
                className="col-span-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>
                  {isPrintingAll
                    ? 'Preparing sheet…'
                    : `Print All ${SEAT_ROWS.length * SEAT_NUMBERS.length} Seats · ${qrScreen}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB D: FLOOR USHER REQUESTS */}
      {activeTab === 'usher' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Guest Assistance Queue
              </h3>
              <p className="text-xs text-white/60">
                Auditorium guests calling for napkins, water, cutlery, or usher help.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {usherRequests.map((req) => (
              <div
                key={req.id}
                className={`p-4 rounded-2xl glass-panel border transition-all flex flex-col justify-between ${
                  req.resolved
                    ? 'border-white/5 opacity-50'
                    : 'border-[#D9F20A]/40 bg-[#D9F20A]/5 glow-lime-inner'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#D9F20A] text-black font-extrabold flex items-center justify-center text-xs">
                        <Armchair className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-white">
                        {req.screen} · Seat {req.seat}
                      </span>
                    </div>

                    <span className="text-[10px] text-white/40">
                      {Math.max(1, Math.floor((Date.now() - req.time) / 60000))}m ago
                    </span>
                  </div>

                  <div className="py-2.5">
                    <h4 className="text-sm font-bold text-[#D9F20A]">{req.type}</h4>
                    {req.note && (
                      <p className="text-xs text-white/70 italic mt-1">"{req.note}"</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  {!req.resolved ? (
                    <button
                      onClick={() => resolveUsherRequest(req.id)}
                      className="w-full py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Attended / Resolved</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center justify-center gap-1 font-semibold py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
