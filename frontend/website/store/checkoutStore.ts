import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CheckoutFormData {
  emailOrPhone: string;
  emailNews: boolean;
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  saveInfo: boolean;
  shippingMethod: "inside-dhaka" | "outside-dhaka";
  paymentMethod: "cod";
  billingAddress: "same" | "different";
  billingFirstName?: string;
  billingLastName?: string;
  billingAddressLine?: string;
  billingCity?: string;
  billingPostalCode?: string;
  discountCode: string;
}

interface SavedDeliveryInfo {
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

interface CheckoutStore {
  formData: CheckoutFormData;
  updateFormData: (data: Partial<CheckoutFormData>) => void;
  resetFormData: () => void;
  saveDeliveryInfo: () => void;
  loadSavedDeliveryInfo: () => void;
}

const defaultFormData: CheckoutFormData = {
  emailOrPhone: "",
  emailNews: false,
  country: "Bangladesh",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postalCode: "",
  phone: "",
  saveInfo: false,
  shippingMethod: "inside-dhaka",
  paymentMethod: "cod",
  billingAddress: "same",
  discountCode: "",
};

const SAVED_DELIVERY_KEY = "saved-delivery-info";

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      formData: defaultFormData,

      updateFormData: (data) => {
        set((state) => ({
          formData: { ...state.formData, ...data },
        }));
      },

      resetFormData: () => {
        set({ formData: defaultFormData });
      },

      saveDeliveryInfo: () => {
        const { formData } = get();
        if (formData.saveInfo) {
          const deliveryInfo: SavedDeliveryInfo = {
            country: formData.country,
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            phone: formData.phone,
          };
          if (typeof window !== "undefined") {
            localStorage.setItem(
              SAVED_DELIVERY_KEY,
              JSON.stringify(deliveryInfo),
            );
          }
        }
      },

      loadSavedDeliveryInfo: () => {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(SAVED_DELIVERY_KEY);
          if (saved) {
            try {
              const deliveryInfo: SavedDeliveryInfo = JSON.parse(saved);
              set((state) => ({
                formData: {
                  ...state.formData,
                  ...deliveryInfo,
                  saveInfo: true,
                },
              }));
            } catch {}
          }
        }
      },
    }),
    {
      name: "checkout-storage",
    },
  ),
);
