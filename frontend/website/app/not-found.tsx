import type { Metadata } from "next";
import NotFoundScreen from "@/components/Common/NotFoundScreen";

export const metadata: Metadata = {
  title: "Page not found | VE Gear",
  description:
    "This page doesn't exist. Head home or browse the VE Gear collection.",
  robots: "noindex, follow",
};

export default function NotFound() {
  return <NotFoundScreen variant="standalone" />;
}
