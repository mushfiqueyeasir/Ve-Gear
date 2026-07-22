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
    /** Customer email for order confirmation */
    email?: string;
    shippingMethod?: "inside-dhaka" | "outside-dhaka";
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

export interface TrackOrderItem {
  title: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPrice: number;
}

export interface TrackOrderResult {
  orderNumber: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: string;
  paymentMethod: string;
  items: TrackOrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  delivery: {
    name: string;
    city: string | null;
    zone: string;
  };
}
