export type Category = 'Popcorn' | 'Snacks' | 'Meals' | 'Beverages' | 'Desserts' | 'Combos';

export type DietaryType = 'veg' | 'non-veg';

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: number;
  dietary: DietaryType;
  calories?: string;
  prepTimeMins?: number;
  image: string;
  tags?: string[];
  isChefSpecial?: boolean;
  inStock: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  instructions?: string;
}

export type OrderStatus = 'placed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  theatre: string;
  screen: string;
  seat: string;
  customerName: string;
  phone: string;
  items: CartItem[];
  subtotal: number;
  taxes: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'upi' | 'card' | 'wallet';
  paymentStatus: 'completed' | 'processing' | 'failed';
  deliveryPreference: 'now' | 'interval';
  specialInstructions?: string;
  createdAt: number;
  estimatedDeliveryMinutes: number;
}
