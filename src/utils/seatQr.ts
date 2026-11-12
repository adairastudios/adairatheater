// Seat QR helpers: screen list, short seat URLs, and URL parsing.
//
// QR links are kept as short as possible so the printed code is less dense
// and scans faster, e.g.  https://your-site.vercel.app/?screen=imax&seat=H15

export interface ScreenDef {
  /** Short code used in the QR link. */
  code: string;
  /** Display name shown in the app. */
  name: string;
}

export const SCREENS: ScreenDef[] = [
  { code: '1', name: 'Screen 1' },
  { code: '2', name: 'Screen 2' },
  { code: '3', name: 'Screen 3' },
  { code: '4', name: 'Screen 4' },
  { code: 'imax', name: 'IMAX 70mm' },
  { code: 'vip', name: 'VIP Lounge' },
];

export const SCREEN_NAMES = SCREENS.map((s) => s.name);

/** Auditorium seat layout shared by the guest seat map and the QR generator. */
export const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const SEAT_NUMBERS = Array.from({ length: 14 }, (_, i) => i + 1);

/**
 * Base URL that seat QR codes point to.
 * Set VITE_PUBLIC_SITE_URL (e.g. in Vercel project settings) to force a
 * specific domain; otherwise the address the admin page is opened on is used.
 */
export const getPublicSiteUrl = (): string => {
  const configured = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim();
  return (configured || window.location.origin).replace(/\/+$/, '');
};

/** True when QR codes would point at an address phones can't reach. */
export const isLocalSiteUrl = (url: string): boolean =>
  /^https?:\/\/(localhost|127\.|0\.0\.0\.0|\[::1\])/i.test(url);

/** Formats a seat code like F12 or A05. */
export const formatSeatCode = (row: string, num: number): string =>
  `${row}${String(num).padStart(2, '0')}`;

/** Path + query for a seat, e.g. "/?screen=imax&seat=H15". */
export const buildSeatPath = (screenName: string, seat: string): string => {
  const code = SCREENS.find((s) => s.name === screenName)?.code ?? screenName;
  return `/?screen=${encodeURIComponent(code)}&seat=${encodeURIComponent(seat)}`;
};

/** Full URL encoded into a seat's QR code. */
export const buildSeatUrl = (screenName: string, seat: string): string =>
  `${getPublicSiteUrl()}${buildSeatPath(screenName, seat)}`;

/**
 * Turns a ?screen= value into a display name. Accepts short codes ("3",
 * "imax"), full names ("IMAX 70mm") and older links ("Screen 3").
 */
export const parseScreenParam = (value: string): string => {
  const v = value.trim();
  const lower = v.toLowerCase();
  const match = SCREENS.find((s) => s.code === lower || s.name.toLowerCase() === lower);
  if (match) return match.name;
  if (/^\d+$/.test(v)) return `Screen ${v}`;
  return v;
};
