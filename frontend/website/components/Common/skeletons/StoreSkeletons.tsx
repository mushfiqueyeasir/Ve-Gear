import { Skeleton } from "@/components/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <div className="bg-background text-foreground" aria-busy="true" aria-label="Loading">
      <div className="relative h-[100dvh] w-full overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-6 pb-8 pt-28 md:px-10">
          <div className="max-w-xl space-y-4">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-14 w-full max-w-md" />
            <Skeleton className="h-14 w-4/5 max-w-sm" />
            <Skeleton className="mt-2 h-4 w-72" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-11 w-40 rounded-full" />
              <Skeleton className="h-11 w-44 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-5 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] space-y-16 px-6 py-16 md:px-10">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  );
}

export function ShopPageSkeleton() {
  return (
    <section
      className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36"
      aria-busy="true"
      aria-label="Loading shop"
    >
      <div className="mb-10 space-y-3 border-b border-border pb-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-56 md:h-16 md:w-72" />
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function ProductDetailSkeleton() {
  return (
    <section
      className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-[30%] max-w-[120px] rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-24" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-12" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="size-12 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-36 rounded-full" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CartPageSkeleton() {
  return (
    <section
      className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36"
      aria-busy="true"
      aria-label="Loading cart"
    >
      <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-2xl border border-border p-4"
          >
            <Skeleton className="size-24 shrink-0 rounded-xl sm:size-28" />
            <div className="flex flex-1 flex-col justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-3 rounded-2xl border border-border p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-4 h-12 w-full rounded-full" />
      </div>
    </section>
  );
}

export function GenericPageSkeleton() {
  return (
    <section
      className="mx-auto max-w-[900px] px-6 pb-24 pt-28 md:px-10 md:pt-36"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="mb-10 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" style={{ width: `${92 - i * 6}%` }} />
        ))}
      </div>
    </section>
  );
}

export function WishlistPageSkeleton() {
  return (
    <section
      className="mx-auto max-w-[1600px] px-6 pb-24 pt-28 md:px-10 md:pt-36"
      aria-busy="true"
      aria-label="Loading favorites"
    >
      <div className="mb-8 space-y-2 border-b border-border pb-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function AdminPanelSkeleton() {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
