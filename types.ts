
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderDetails {
  id: string;
  cart: CartItem[];
  recipientName: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  subtotal: number;
  shippingCost: number;
  total: number;
}

export type Step = 'selection' | 'summary' | 'delivery' | 'confirmation';