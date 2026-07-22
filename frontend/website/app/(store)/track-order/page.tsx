import { Suspense } from "react";
import type { Metadata } from "next";
import TrackOrderPageScreen from "@/components/TrackOrderPage/TrackOrderPageScreen";
import { generateMetadata as generateSeoMetadata } from "@/utility/generateMetadata";
import { getSeoItem } from "@/utility/getSeoSettings";

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata(await getSeoItem("track"));
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-3xl px-6 pb-24 pt-24 md:px-10 md:pt-36">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </section>
      }
    >
      <TrackOrderPageScreen />
    </Suspense>
  );
}
