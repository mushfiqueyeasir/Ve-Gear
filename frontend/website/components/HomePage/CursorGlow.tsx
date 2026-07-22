"use client";

import { useEffect, useRef } from "react";

/** Desktop cursor wash — DOM updates only (no React re-render per move). */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let x = -200;
    let y = -200;

    const flush = () => {
      raf = 0;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    };

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed z-40 hidden h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 mix-blend-screen md:block"
      style={{
        left: -200,
        top: -200,
        background:
          "radial-gradient(circle, rgb(var(--primary-rgb) / 0.18) 0%, transparent 60%)",
      }}
    />
  );
}
