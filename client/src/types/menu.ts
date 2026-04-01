export type MenuCategory = 'drinks' | 'food';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  image: string;
  description?: string;
}

export type DrinkType = 'hot' | 'iced' | 'frappe';
export type SweetnessLevel = '0' | '25' | '50' | '100' | '150';

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface DrinkCustomization {
  drinkType: DrinkType;
  sweetnessLevel: SweetnessLevel;
  toppings: Topping[];
}

export interface CartItem {
  cartLineId: string; // Unique ID for each cart line (to handle multiple customized variants of same drink)
  menuItem: MenuItem;
  quantity: number;
  customization?: DrinkCustomization;
}

export interface Cart {
  items: CartItem[];
}

export interface Order {
  id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  totalPrice: number;
  totalItems?: number;
  tableNumber: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  specialRequests?: string;
  specialNotes?: string | null;
}
