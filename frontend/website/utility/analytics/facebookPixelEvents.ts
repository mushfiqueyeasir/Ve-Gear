/**
 * Facebook Pixel Dynamic Product Ads (DPA) Event Tracking
 *
 * These events are required for Meta catalog ads to match website events
 * with catalog products. The content_ids must match the product IDs in your
 * catalog feed exactly.
 */

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, any>) => void;
  }
}

/**
 * Track ViewContent event - fires when a product page is viewed
 * @param productId - Product ID that matches catalog feed (must be exact match)
 * @param price - Product price
 * @param currency - Currency code (e.g., 'BDT', 'USD')
 */
export function trackViewContent(
  productId: string,
  price: number,
  currency: string = "BDT",
) {
  if (typeof window === "undefined" || !window.fbq) {
    return;
  }

  window.fbq("track", "ViewContent", {
    content_ids: [productId], // Must match catalog feed product ID exactly
    content_type: "product",
    value: price,
    currency: currency.toUpperCase(),
  });
}

/**
 * Track AddToCart event - fires when a product is added to cart
 * @param productId - Product ID that matches catalog feed (must be exact match)
 * @param price - Product price
 * @param currency - Currency code (e.g., 'BDT', 'USD')
 * @param quantity - Quantity added (optional)
 */
export function trackAddToCart(
  productId: string,
  price: number,
  currency: string = "BDT",
  quantity: number = 1,
) {
  if (typeof window === "undefined" || !window.fbq) {
    return;
  }

  window.fbq("track", "AddToCart", {
    content_ids: [productId], // Must match catalog feed product ID exactly
    content_type: "product",
    value: price * quantity,
    currency: currency.toUpperCase(),
  });
}

/**
 * Track InitiateCheckout event - fires when user reaches checkout page
 * @param productIds - Array of product IDs in cart
 * @param totalValue - Total cart value
 * @param currency - Currency code (e.g., 'BDT', 'USD')
 * @param numItems - Number of items in cart
 */
export function trackInitiateCheckout(
  productIds: string[],
  totalValue: number,
  currency: string = "BDT",
  numItems: number = 0,
) {
  if (typeof window === "undefined" || !window.fbq) {
    return;
  }

  window.fbq("track", "InitiateCheckout", {
    content_ids: productIds, // Array of product IDs that match catalog feed
    content_type: "product",
    value: totalValue,
    currency: currency.toUpperCase(),
    num_items: numItems,
  });
}

/**
 * Track Purchase event - fires when order is successfully completed
 * @param productIds - Array of product IDs in the order
 * @param totalValue - Total order value (including shipping)
 * @param currency - Currency code (e.g., 'BDT', 'USD')
 * @param numItems - Number of items in order
 */
export function trackPurchase(
  productIds: string[],
  totalValue: number,
  currency: string = "BDT",
  numItems: number = 0,
) {
  if (typeof window === "undefined" || !window.fbq) {
    return;
  }

  window.fbq("track", "Purchase", {
    content_ids: productIds, // Array of product IDs that match catalog feed
    content_type: "product",
    value: totalValue,
    currency: currency.toUpperCase(),
    num_items: numItems,
  });
}
