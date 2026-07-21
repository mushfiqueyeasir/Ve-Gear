import Link from "next/link";
import ProductCard from "@/components/Common/ProductCard";
import type { TransformedProduct } from "@/type/productType";

interface FeaturedProductsProps {
  products: TransformedProduct[];
  title?: string | null;
  subtitle?: string | null;
  eyebrow?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string;
}

export default function FeaturedProducts({
  products,
  title,
  subtitle,
  eyebrow,
  ctaLabel,
  ctaHref = "/product",
}: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section id="drops" className="relative py-24 md:py-40">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              {eyebrow || "Featured"}
            </div>
            <h2 className="font-display text-5xl font-bold leading-[0.9] tracking-tight md:text-7xl">
              {title ? (
                <>
                  {title.split(".")[0]}
                  {title.includes(".") && (
                    <>
                      .{" "}
                      <span className="text-primary">
                        {title.split(".").slice(1).join(".").trim() ||
                          "Worn everywhere."}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  Built <span className="text-primary">different.</span>
                  <br />
                  Worn everywhere.
                </>
              )}
            </h2>
            {subtitle && !title?.includes(subtitle) && (
              <p className="mt-4 max-w-md text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {ctaLabel ? (
            <Link
              href={ctaHref}
              className="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground md:block"
            >
              {ctaLabel} →
            </Link>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              image={product.image}
              hoverImage={product.hoverImage}
              images={product.images}
              originalPrice={product.originalPrice}
              currentPrice={product.currentPrice}
              discount={product.discount}
              href={product.href}
              stock={product.stock}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
