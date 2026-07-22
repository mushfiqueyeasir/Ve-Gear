export type OrderEmailItem = {
  title: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export type OrderEmailPayload = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  shippingLabel: string;
  items: OrderEmailItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currencyLabel?: string;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(amount: number, currency = "BDT") {
  return `${currency} ${Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function itemsRows(items: OrderEmailItem[], currency: string) {
  return items
    .map((item) => {
      const line = item.unitPrice * item.quantity;
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eee;font-size:14px;color:#111;">
            <div style="font-weight:600;">${escapeHtml(item.title)}</div>
            <div style="color:#666;font-size:13px;margin-top:4px;">Size: ${escapeHtml(item.size)}</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #eee;text-align:center;font-size:14px;color:#111;">
            ${item.quantity}
          </td>
          <td style="padding:14px 0;border-bottom:1px solid #eee;text-align:right;font-size:14px;color:#111;">
            ${escapeHtml(money(line, currency))}
          </td>
        </tr>`;
    })
    .join("");
}

function shell(opts: {
  title: string;
  intro: string;
  payload: OrderEmailPayload;
  footerNote: string;
}) {
  const { title, intro, payload, footerNote } = opts;
  const currency = payload.currencyLabel || "BDT";
  const year = new Date().getFullYear();

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:32px 16px;">
          <table role="presentation" style="width:100%;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e8e8;border-collapse:collapse;">
            <tr>
              <td style="padding:28px 28px 20px;border-bottom:1px solid #f0f0f0;text-align:center;">
                <div style="font-size:22px;font-weight:700;letter-spacing:-0.03em;color:#111;">VE Gear</div>
                <div style="margin-top:6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#999;">Premium Gear</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 8px;">
                <h1 style="margin:0;font-size:22px;font-weight:600;color:#111;">${escapeHtml(title)}</h1>
                <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#555;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;">
                <div style="padding:14px 16px;background:#fafafa;border:1px solid #eee;">
                  <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#999;">Order number</div>
                  <div style="margin-top:4px;font-size:18px;font-weight:600;color:#111;">${escapeHtml(payload.orderNumber)}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 4px;">
                <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:10px;">Customer</div>
                <div style="font-size:15px;color:#111;font-weight:600;">${escapeHtml(payload.customerName)}</div>
                <div style="font-size:13px;color:#666;margin-top:4px;">${escapeHtml(payload.customerEmail)}</div>
                <div style="font-size:13px;color:#666;margin-top:2px;">${escapeHtml(payload.customerPhone)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 8px;">
                <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:10px;">Items</div>
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding-bottom:8px;border-bottom:1px solid #e8e8e8;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#111;">Product</td>
                    <td style="padding-bottom:8px;border-bottom:1px solid #e8e8e8;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#111;text-align:center;">Qty</td>
                    <td style="padding-bottom:8px;border-bottom:1px solid #e8e8e8;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#111;text-align:right;">Total</td>
                  </tr>
                  ${itemsRows(payload.items, currency)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 8px;">
                <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:10px;">Delivery</div>
                <div style="padding:14px 16px;background:#fafafa;border-left:3px solid #111;">
                  <div style="font-size:14px;font-weight:600;color:#111;">${escapeHtml(payload.customerName)}</div>
                  <div style="font-size:13px;color:#666;margin-top:6px;line-height:1.5;">${escapeHtml(payload.deliveryAddress)}</div>
                  <div style="font-size:13px;color:#666;margin-top:6px;">${escapeHtml(payload.shippingLabel)}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;">
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#666;">Subtotal</td>
                    <td style="padding:6px 0;font-size:13px;color:#666;text-align:right;">${escapeHtml(money(payload.subtotal, currency))}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#666;">Delivery</td>
                    <td style="padding:6px 0;font-size:13px;color:#666;text-align:right;">${escapeHtml(money(payload.shipping, currency))}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#111;border-top:1px solid #eee;">Total</td>
                    <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#111;text-align:right;border-top:1px solid #eee;">${escapeHtml(money(payload.total, currency))}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
                <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">${escapeHtml(footerNote)}</p>
                <p style="margin:10px 0 0;font-size:11px;color:#bbb;">© ${year} VE Gear</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildCustomerOrderEmailHtml(payload: OrderEmailPayload) {
  return shell({
    title: "Order received",
    intro: `Hi ${payload.customerName}, thanks for shopping with VE Gear. We’ve received your order and will process it shortly.`,
    payload,
    footerNote:
      "This is a confirmation that we received your order. We’ll contact you on your phone if we need anything else.",
  });
}

export function buildOwnerOrderEmailHtml(payload: OrderEmailPayload) {
  return shell({
    title: "New order received",
    intro: `A customer just placed order ${payload.orderNumber}. Review the details below and process the order.`,
    payload,
    footerNote: "VE Gear store notification — new checkout order.",
  });
}
