"use client";

import { useEffect, useState } from "react";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Input from "@/components/Common/Input";
import Select from "@/components/Common/Select";
import { submitOrder } from "@/utility/submitOrder";
import { sendEmail } from "@/utility/sendEmail";
import { trackPurchase } from "@/utility/analytics/facebookPixelEvents";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export default function CheckoutForm() {
  const router = useRouter();
  const { formData, updateFormData, saveDeliveryInfo, loadSavedDeliveryInfo } =
    useCheckoutStore();
  const { items, getTotal, clearCart } = useCartStore();
  const { code } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSavedDeliveryInfo();
  }, [loadSavedDeliveryInfo]);

  const handleCompleteOrder = async () => {
    if (!formData.emailOrPhone) {
      toast.error("Please enter your email or phone number");
      return;
    }
    if (!formData.firstName || !formData.lastName) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.address || !formData.city || !formData.phone) {
      toast.error("Please complete all delivery information");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const subtotal = getTotal();
      const shippingCost = 0;
      const total = subtotal;

      const orderData = {
        delivery: {
          country: formData.country,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
        },
        items: items.map((item) => ({
          product: item.id,
          title: item.title,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.currentPrice,
        })),
        totals: {
          subtotal,
          shipping: shippingCost,
          total,
        },
      };

      await submitOrder(orderData);

      if (formData.saveInfo) {
        saveDeliveryInfo();
      }

      const checkoutTemplateId =
        process.env.NEXT_PUBLIC_EMAIL_CHECKOUT_TEMPLATE || "";

      if (checkoutTemplateId) {
        try {
          const escapeHtml = (text: string) => {
            return text
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
          };

          const deliveryAddress = [
            formData.address,
            formData.city,
            formData.postalCode,
            formData.country,
          ]
            .filter(Boolean)
            .join(", ");

          const itemsHtml = items
            .map(
              (item) =>
                `<tr>
                  <td style="padding: 20px 0; border-bottom: 1px solid #e8e8e8;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 60%; vertical-align: top;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="width: 80px; padding-right: 16px; vertical-align: top;">
                                <img src="${item.image}" alt="${escapeHtml(item.title)}" style="width: 80px; height: 80px; object-fit: cover; display: block; border: 1px solid #e8e8e8;" />
                              </td>
                              <td style="vertical-align: top;">
                                <div style="font-size: 11px; color: #999999; margin-bottom: 4px; text-transform: uppercase;">VE Gear</div>
                                <div style="font-size: 15px; font-weight: 400; color: #000000; margin-bottom: 6px; line-height: 1.4;">${escapeHtml(item.title)}</div>
                                <div style="font-size: 14px; color: #000000; margin-bottom: 4px;">Tk ${item.currentPrice.toLocaleString()}.00</div>
                                <div style="font-size: 13px; color: #666666;">Size: ${item.size}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td style="width: 20%; text-align: center; vertical-align: top; padding-top: 8px;">
                          <div style="font-size: 15px; color: #000000; font-weight: 400;">${item.quantity}</div>
                        </td>
                        <td style="width: 20%; text-align: right; vertical-align: top; padding-top: 8px;">
                          <div style="font-size: 15px; color: #000000; font-weight: 400;">Tk ${(item.currentPrice * item.quantity).toLocaleString()}.00 BDT</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`,
            )
            .join("");

          const orderSummaryHtml = `
            <div style="text-align: right;">
              <div style="font-size: 13px; color: #666666; margin-bottom: 8px;">Estimated total</div>
              <div style="font-size: 20px; font-weight: 400; color: #000000; margin-bottom: 8px;">Tk ${total.toLocaleString()}.00 BDT</div>
              <div style="font-size: 11px; color: #999999; margin-bottom: 16px;">Local fulfillment — no shipping charge</div>
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px; border-top: 1px solid #e8e8e8; padding-top: 16px;">
                <tr>
                  <td style="padding: 6px 0; color: #666666; font-size: 13px; text-align: left;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; color: #666666; font-size: 13px;">Tk ${subtotal.toLocaleString()}.00</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666666; font-size: 13px; text-align: left;">Shipping</td>
                  <td style="padding: 6px 0; text-align: right; color: #666666; font-size: 13px;">Local · Free</td>
                </tr>
              </table>
            </div>
          `;

          await sendEmail({
            subject: `New Order Received - ${formData.firstName} ${formData.lastName}`,
            body: {
              customer_name: `${formData.firstName} ${formData.lastName}`,
              customer_phone: formData.phone,
              delivery_address: deliveryAddress,
              order_items_html: itemsHtml,
              order_summary_html: orderSummaryHtml,
              subtotal: subtotal.toString(),
              shipping: shippingCost.toString(),
              total: total.toString(),
            },
            emailJsTemplateId: checkoutTemplateId,
          });
        } catch {}
      }

      // Track Purchase event for Meta catalog ads
      const productIds = items.map((item) => item.id);
      const numItems = items.reduce((sum, item) => sum + item.quantity, 0);
      trackPurchase(productIds, total, code, numItems);

      toast.success("Order placed successfully!", {
        description:
          "Your order has been received and will be processed shortly.",
      });
      clearCart();
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Contact</h2>
        <Input
          type="text"
          placeholder="Email or mobile phone number"
          value={formData.emailOrPhone}
          onChange={(e) => updateFormData({ emailOrPhone: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Delivery</h2>
        <Select
          value={formData.country}
          onChange={(e) => updateFormData({ country: e.target.value })}
        >
          <option value="Bangladesh">Bangladesh</option>
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
          />
          <Input
            type="text"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
          />
        </div>
        <Input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => updateFormData({ address: e.target.value })}
        />
        <Input
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={(e) => updateFormData({ city: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Postal code (optional)"
          value={formData.postalCode}
          onChange={(e) => updateFormData({ postalCode: e.target.value })}
        />
        <Input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={formData.saveInfo}
            onChange={(e) => updateFormData({ saveInfo: e.target.checked })}
            className="h-4 w-4 accent-primary"
          />
          <span>Save this information for next time</span>
        </label>
      </div>

      <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        Local fulfillment only — no shipping charge for now.
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Payment</h2>
        <button
          type="button"
          className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors ${
            formData.paymentMethod === "cod"
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-card hover:border-primary/50"
          }`}
          onClick={() => updateFormData({ paymentMethod: "cod" })}
        >
          Cash on Delivery (COD)
        </button>
      </div>

      <button
        type="button"
        onClick={handleCompleteOrder}
        disabled={isSubmitting}
        className="w-full rounded-full bg-primary px-4 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Complete order
      </button>
    </div>
  );
}
