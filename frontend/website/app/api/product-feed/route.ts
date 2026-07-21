import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/utility/getProducts";
import { appConfig } from "@/lib/config";

export const runtime = "nodejs";

function escapeCsvValue(value: string): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function htmlToPlainText(description: { html?: string } | null): string {
  if (!description?.html) return "";
  return description.html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const products = await getProducts();

    const baseUrl =
      appConfig.siteUrl ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    const headers = [
      "id",
      "title",
      "description",
      "price",
      "availability",
      "image_link",
      "product_url",
    ];

    const rows = products.map((product) => {
      const totalStock = product.stock.reduce((s, i) => s + i.quantity, 0);
      return [
        escapeCsvValue(product._id),
        escapeCsvValue(product.title),
        escapeCsvValue(htmlToPlainText(product.description)),
        escapeCsvValue(product.currentPrice.toString()),
        escapeCsvValue(totalStock > 0 ? "in stock" : "out of stock"),
        escapeCsvValue(product.image || ""),
        escapeCsvValue(`${baseUrl}/product/${product.slug.current}`),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate product feed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
