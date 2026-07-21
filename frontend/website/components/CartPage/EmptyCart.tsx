import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="py-20 text-center">
      <h2 className="font-display text-3xl font-bold">Your cart is empty</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        Looks like you haven&apos;t added anything yet. Let&apos;s find
        something you&apos;ll love.
      </p>
      <Link
        href="/product"
        className="mt-7 inline-block rounded-full bg-foreground px-7 py-3 text-sm font-semibold uppercase tracking-wider text-background transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
      >
        Continue shopping
      </Link>
    </div>
  );
}
