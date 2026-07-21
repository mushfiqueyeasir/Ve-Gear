export interface OrderItemInput {
  product: string; // product id (uuid)
  variantId?: string | null;
  title?: string;
  size: string;
  color?: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderFormData {
  delivery: {
    country: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode?: string;
    phone: string;
  };
  items: OrderItemInput[];
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  notes?: string;
}

export interface OrderFormResponse {
  success: boolean;
  id?: string;
  orderNumber?: string;
  message?: string;
  error?: string;
}
