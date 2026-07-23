"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

/**
 * Native document scroll (compositor-smooth) + branded primary overlay thumb.
 * Avoids full-page Radix ScrollArea, which feels laggy on long pages.
 */
export default function StoreScrollShell({
  children,
}: {
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    startScrollTop: number;
  } | null>(null);
  const rafRef = useRef(0);
  const scrollableRef = useRef(false);

  const syncThumb = useCallback(() => {
    rafRef.current = 0;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const root = document.documentElement;
    const scrollHeight = root.scrollHeight;
    const clientHeight = root.clientHeight;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    const canScroll = maxScroll > 1;

    if (scrollableRef.current !== canScroll) {
      scrollableRef.current = canScroll;
      track.style.opacity = canScroll ? "1" : "0";
      track.style.pointerEvents = canScroll ? "auto" : "none";
      track.setAttribute("aria-hidden", canScroll ? "false" : "true");
    }

    if (!canScroll) {
      thumb.style.height = "0px";
      thumb.style.transform = "translate3d(0,0,0)";
      return;
    }

    const trackHeight = track.clientHeight;
    const thumbHeight = Math.max(
      40,
      (clientHeight / scrollHeight) * trackHeight,
    );
    const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
    const ratio = maxScroll > 0 ? root.scrollTop / maxScroll : 0;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translate3d(0, ${ratio * maxThumbTop}px, 0)`;
  }, []);

  const scheduleSync = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(syncThumb);
  }, [syncThumb]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("store-scroll");

    scheduleSync();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });

    const ro = new ResizeObserver(scheduleSync);
    ro.observe(document.body);

    return () => {
      root.classList.remove("store-scroll");
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleSync]);

  const scrollFromThumbY = (clientY: number) => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const root = document.documentElement;
    const rect = track.getBoundingClientRect();
    const trackHeight = track.clientHeight;
    const thumbHeight = thumb.offsetHeight || 40;
    const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
    const y = clientY - rect.top - thumbHeight / 2;
    const ratio =
      maxThumbTop > 0 ? Math.min(1, Math.max(0, y / maxThumbTop)) : 0;
    const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
    root.scrollTop = ratio * maxScroll;
  };

  return (
    <>
      {children}

      <div
        ref={trackRef}
        aria-hidden="true"
        className="fixed inset-y-0 right-0 z-[60] w-3 p-0.5 opacity-0 transition-opacity duration-200"
        style={{ pointerEvents: "none" }}
        onPointerDown={(e) => {
          if (!scrollableRef.current) return;
          if (e.target !== e.currentTarget) return;
          e.preventDefault();
          scrollFromThumbY(e.clientY);
          scheduleSync();
        }}
      >
        <div
          ref={thumbRef}
          className="w-full cursor-pointer rounded-full bg-primary/80 will-change-transform hover:bg-primary active:bg-primary"
          style={{ height: 0, transform: "translate3d(0,0,0)" }}
          onPointerDown={(e) => {
            if (!scrollableRef.current) return;
            e.preventDefault();
            e.stopPropagation();
            const root = document.documentElement;
            dragRef.current = {
              pointerId: e.pointerId,
              startY: e.clientY,
              startScrollTop: root.scrollTop,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const drag = dragRef.current;
            const track = trackRef.current;
            const thumb = thumbRef.current;
            if (!drag || drag.pointerId !== e.pointerId || !track || !thumb) {
              return;
            }
            const root = document.documentElement;
            const trackHeight = track.clientHeight;
            const thumbHeight = thumb.offsetHeight;
            const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
            const maxScroll = Math.max(
              0,
              root.scrollHeight - root.clientHeight,
            );
            if (maxThumbTop <= 0 || maxScroll <= 0) return;

            const deltaY = e.clientY - drag.startY;
            root.scrollTop = Math.min(
              maxScroll,
              Math.max(
                0,
                drag.startScrollTop + (deltaY / maxThumbTop) * maxScroll,
              ),
            );
          }}
          onPointerUp={(e) => {
            if (dragRef.current?.pointerId === e.pointerId) {
              dragRef.current = null;
            }
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
        />
      </div>
    </>
  );
}
