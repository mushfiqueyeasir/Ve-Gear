import Link from "next/link";
import { Home, ShoppingBag, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-24 pt-32 md:px-10">
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="font-display text-8xl font-bold text-primary/30 lg:text-9xl">
            404
          </h1>
          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Page Not Found
            </h2>
            <p className="mx-auto max-w-md text-sm text-muted-foreground lg:text-base">
              The page you&apos;re looking for doesn&apos;t exist. It might have
              been moved, deleted, or the URL might be incorrect.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider text-background transition hover:bg-primary hover:text-primary-foreground"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Link>
          <Link
            href="/product"
            className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold uppercase tracking-wider transition hover:border-primary hover:text-primary"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
        </div>

        <div className="pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to previous page
          </Link>
        </div>
      </div>
    </section>
  );
}
