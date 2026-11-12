import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { MenuItem, CartItem, Order, OrderStatus } from '../types';
import { INITIAL_MENU_ITEMS } from '../data/seedMenu';
import { GST_RATE, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '../utils/currency';
import { parseScreenParam } from '../utils/seatQr';

export interface UsherRequest {
  id: string;
  theatre: string;
  screen: string;
  seat: string;
  type: string;
  note?: string;
  time: number;
  resolved: boolean;
}

interface CinemaContextType {
  // Navigation & View
  currentView: 'welcome' | 'menu' | 'tracking' | 'admin';
  setCurrentView: (view: 'welcome' | 'menu' | 'tracking' | 'admin') => void;

  // Seat & Theatre
  theatre: string;
  screen: string;
  seat: string;
  hasSeatFromUrl: boolean;
  setSeatDetails: (details: { theatre?: string; screen?: string; seat?: string }) => void;
  isSeatModalOpen: boolean;
  setIsSeatModalOpen: (open: boolean) => void;

  // Menu & Stock
  menuItems: MenuItem[];
  toggleItemStock: (itemId: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  updateItemInstruction: (itemId: string, instruction: string) => void;
  clearCart: () => void;
  isCartSheetOpen: boolean;
  setIsCartSheetOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  grandTotal: number;

  // Checkout & Payment Modals
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isProcessingPayment: boolean;
  setIsProcessingPayment: (processing: boolean) => void;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  createOrder: (orderPayload: {
    customerName: string;
    phone: string;
    paymentMethod: 'upi' | 'card' | 'wallet';
    deliveryPreference: 'now' | 'interval';
    specialInstructions?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Usher Assistance
  usherRequests: UsherRequest[];
  callUsher: (type: string, note?: string) => void;
  resolveUsherRequest: (id: string) => void;
  isUsherModalOpen: boolean;
  setIsUsherModalOpen: (open: boolean) => void;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;
}

const CinemaContext = createContext<CinemaContextType | undefined>(undefined);

const LOCAL_STORAGE_CART_KEY = 'adaira_cart_v3';
const LOCAL_STORAGE_ORDERS_KEY = 'adaira_orders_v3';
const LOCAL_STORAGE_STOCK_KEY = 'adaira_stock_v1';
const LOCAL_STORAGE_USHER_KEY = 'adaira_usher_v1';
const LOCAL_STORAGE_THEME_KEY = 'adaira_theme_v1';

export const CinemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial URL Params Extraction
  const [theatre, setTheatre] = useState('Adaira Studios · Grand');
  const [screen, setScreen] = useState('Screen 3');
  const [seat, setSeat] = useState('F12');
  const [hasSeatFromUrl, setHasSeatFromUrl] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

  // 2. Navigation View: detect if /admin is in URL or hash
  const [currentView, setCurrentView] = useState<'welcome' | 'menu' | 'tracking' | 'admin'>('welcome');

  // 3. Theme (Permanent cinematic dark mode)
  const isDark = true;
  const toggleTheme = useCallback(() => {}, []);

  // 4. Cart Sheet & Checkout Modals
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isUsherModalOpen, setIsUsherModalOpen] = useState(false);

  // 5. Stock & Menu Items
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_STOCK_KEY);
      if (saved) {
        const stockMap = JSON.parse(saved) as Record<string, boolean>;
        return INITIAL_MENU_ITEMS.map((item) => ({
          ...item,
          inStock: stockMap[item.id] !== undefined ? stockMap[item.id] : item.inStock,
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_MENU_ITEMS;
  });

  // 6. Cart items
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // 7. Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Seed initial demo orders for the kitchen view
    return [
      {
        id: 'ord-demo-1',
        orderNumber: '#AD-1082',
        theatre: 'Adaira Studios · Grand',
        screen: 'Screen 2',
        seat: 'D08',
        customerName: 'Marcus Vance',
        phone: '+91 98201 10842',
        items: [
          {
            item: INITIAL_MENU_ITEMS[0], // Truffle popcorn
            quantity: 1,
            instructions: 'Extra truffle butter please',
          },
          {
            item: INITIAL_MENU_ITEMS[12], // Citrus fizz
            quantity: 2,
          },
        ],
        subtotal: 1007,
        taxes: 50,
        serviceFee: 0,
        total: 1057,
        status: 'preparing',
        paymentMethod: 'card',
        paymentStatus: 'completed',
        deliveryPreference: 'now',
        createdAt: Date.now() - 6 * 60 * 1000,
        estimatedDeliveryMinutes: 9,
      },
      {
        id: 'ord-demo-2',
        orderNumber: '#AD-1083',
        theatre: 'Adaira Studios · Grand',
        screen: 'IMAX 70mm',
        seat: 'H12',
        customerName: 'Elena Rostova',
        phone: '+91 99300 47920',
        items: [
          {
            item: INITIAL_MENU_ITEMS[4], // Loaded Nachos
            quantity: 1,
          },
          {
            item: INITIAL_MENU_ITEMS[8], // Angus Smash Sliders
            quantity: 1,
          },
          {
            item: INITIAL_MENU_ITEMS[17], // Chocolate lava cake
            quantity: 1,
          },
        ],
        subtotal: 1457,
        taxes: 73,
        serviceFee: 0,
        total: 1530,
        status: 'on_the_way',
        paymentMethod: 'upi',
        paymentStatus: 'completed',
        deliveryPreference: 'now',
        createdAt: Date.now() - 14 * 60 * 1000,
        estimatedDeliveryMinutes: 2,
      },
    ];
  });

  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // 8. Usher Assistance Requests
  const [usherRequests, setUsherRequests] = useState<UsherRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USHER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'ush-1',
        theatre: 'Adaira Studios · Grand',
        screen: 'Screen 3',
        seat: 'E10',
        type: 'Napkins & Wet Wipes',
        time: Date.now() - 180000,
        resolved: false,
      },
    ];
  });

  // Synchronize URL parameters on mount
  useEffect(() => {
    const parseUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTheatre = urlParams.get('theatre');
      const urlScreen = urlParams.get('screen');
      const urlSeat = urlParams.get('seat');
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path.includes('/admin') || hash === '#admin') {
        setCurrentView('admin');
      }

      if (urlTheatre) setTheatre(urlTheatre);
      if (urlScreen) setScreen(parseScreenParam(urlScreen));
      if (urlSeat) {
        setSeat(urlSeat.toUpperCase());
        setHasSeatFromUrl(true);
      } else {
        setHasSeatFromUrl(false);
      }
    };

    parseUrl();
    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  // Permanent dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Save Orders to LocalStorage and broadcast
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  // Save Stock to LocalStorage
  useEffect(() => {
    const stockMap: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      stockMap[item.id] = item.inStock;
    });
    localStorage.setItem(LOCAL_STORAGE_STOCK_KEY, JSON.stringify(stockMap));
  }, [menuItems]);

  // Save Usher Requests
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USHER_KEY, JSON.stringify(usherRequests));
  }, [usherRequests]);

  // Cross-Tab and window storage listener for Realtime Sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_ORDERS_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setOrders(updated);
        } catch {}
      }
      if (e.key === LOCAL_STORAGE_STOCK_KEY && e.newValue) {
        try {
          const stockMap = JSON.parse(e.newValue);
          setMenuItems((prev) =>
            prev.map((item) => ({
              ...item,
              inStock: stockMap[item.id] !== undefined ? stockMap[item.id] : item.inStock,
            }))
          );
        } catch {}
      }
      if (e.key === LOCAL_STORAGE_USHER_KEY && e.newValue) {
        try {
          setUsherRequests(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Seat Details Setter
  const setSeatDetails = useCallback(
    ({ theatre: newTheatre, screen: newScreen, seat: newSeat }: { theatre?: string; screen?: string; seat?: string }) => {
      if (newTheatre) setTheatre(newTheatre);
      if (newScreen) setScreen(newScreen);
      if (newSeat) {
        setSeat(newSeat.toUpperCase());
        setHasSeatFromUrl(true);
      }
    },
    []
  );

  // Cart operations
  const addToCart = useCallback((item: MenuItem) => {
    if (!item.inStock) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter((ci): ci is CartItem => ci !== null);
    });
  }, []);

  const updateItemInstruction = useCallback((itemId: string, instruction: string) => {
    setCart((prev) =>
      prev.map((ci) => (ci.item.id === itemId ? { ...ci, instructions: instruction } : ci))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Stock operations
  const toggleItemStock = useCallback((itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, inStock: !item.inStock } : item))
    );
  }, []);

  // Totals calculations
  const cartCount = useMemo(() => cart.reduce((acc, curr) => acc + curr.quantity, 0), [cart]);

  const subtotal = useMemo(
    () => cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0),
    [cart]
  );

  const taxes = useMemo(() => Math.round(subtotal * GST_RATE), [subtotal]);
  const serviceFee = useMemo(
    () => (subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0),
    [subtotal]
  );
  const grandTotal = useMemo(() => subtotal + taxes + serviceFee, [subtotal, taxes, serviceFee]);

  // Active Order getter
  const activeOrder = useMemo(() => {
    if (activeOrderId) {
      return orders.find((o) => o.id === activeOrderId) || null;
    }
    // If not set, pick the most recent incomplete order for this seat
    const seatOrders = orders.filter((o) => o.seat === seat && o.screen === screen);
    if (seatOrders.length > 0) {
      const latest = seatOrders[seatOrders.length - 1];
      if (latest.status !== 'delivered' && latest.status !== 'cancelled') {
        return latest;
      }
      return latest;
    }
    return null;
  }, [orders, activeOrderId, seat, screen]);

  // Order Placement
  const createOrder = useCallback(
    (payload: {
      customerName: string;
      phone: string;
      paymentMethod: 'upi' | 'card' | 'wallet';
      deliveryPreference: 'now' | 'interval';
      specialInstructions?: string;
    }) => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newOrder: Order = {
        id: `ord-${Date.now()}-${randomNum}`,
        orderNumber: `#AD-${randomNum}`,
        theatre,
        screen,
        seat,
        customerName: payload.customerName || 'Cinema Guest',
        phone: payload.phone || '+91 90000 00000',
        items: [...cart],
        subtotal,
        taxes,
        serviceFee,
        total: grandTotal,
        status: 'placed',
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'completed',
        deliveryPreference: payload.deliveryPreference,
        specialInstructions: payload.specialInstructions,
        createdAt: Date.now(),
        estimatedDeliveryMinutes: payload.deliveryPreference === 'now' ? 14 : 25,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setActiveOrderId(newOrder.id);
      clearCart();
      setIsCartSheetOpen(false);
      setIsCheckoutOpen(false);
      return newOrder;
    },
    [theatre, screen, seat, cart, subtotal, taxes, serviceFee, grandTotal, clearCart]
  );

  // Update status (called by Kitchen Staff or simulated auto-timer)
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  }, []);

  // Usher Help Handlers
  const callUsher = useCallback(
    (type: string, note?: string) => {
      const newRequest: UsherRequest = {
        id: `ush-${Date.now()}`,
        theatre,
        screen,
        seat,
        type,
        note,
        time: Date.now(),
        resolved: false,
      };
      setUsherRequests((prev) => [newRequest, ...prev]);
      setIsUsherModalOpen(false);
    },
    [theatre, screen, seat]
  );

  const resolveUsherRequest = useCallback((id: string) => {
    setUsherRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, resolved: true } : req))
    );
  }, []);

  return (
    <CinemaContext.Provider
      value={{
        currentView,
        setCurrentView,
        theatre,
        screen,
        seat,
        hasSeatFromUrl,
        setSeatDetails,
        isSeatModalOpen,
        setIsSeatModalOpen,
        menuItems,
        toggleItemStock,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemInstruction,
        clearCart,
        isCartSheetOpen,
        setIsCartSheetOpen,
        cartCount,
        subtotal,
        taxes,
        serviceFee,
        grandTotal,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isProcessingPayment,
        setIsProcessingPayment,
        orders,
        activeOrder,
        activeOrderId,
        setActiveOrderId,
        createOrder,
        updateOrderStatus,
        usherRequests,
        callUsher,
        resolveUsherRequest,
        isUsherModalOpen,
        setIsUsherModalOpen,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </CinemaContext.Provider>
  );
};

export const useCinema = (): CinemaContextType => {
  const context = useContext(CinemaContext);
  if (!context) {
    throw new Error('useCinema must be used within a CinemaProvider');
  }
  return context;
};
