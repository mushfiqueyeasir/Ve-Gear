"use client";

import { useEffect } from "react";

/**
 * Storefront anti-inspect / anti–right-click guard.
 * Mount only when SECURITY_ENABLED is true (checked in the store layout).
 *
 * Note: client-side guards deter casual users; they cannot fully stop
 * determined inspection (browser tools always have a way around).
 */
export function CustomSecurity() {
  useEffect(() => {
    const block = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key?.toLowerCase?.() ?? "";
      const code = event.code?.toLowerCase?.() ?? "";
      const ctrlOrMeta = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // F12 — DevTools
      if (key === "f12" || event.keyCode === 123) {
        block(event);
        return;
      }

      // Ctrl/Cmd + Shift + I / J / C  (Inspect / Console / Elements)
      if (
        ctrlOrMeta &&
        shift &&
        (key === "i" ||
          key === "j" ||
          key === "c" ||
          code === "keyi" ||
          code === "keyj" ||
          code === "keyc")
      ) {
        block(event);
        return;
      }

      // Ctrl/Cmd + U  (View source)
      if (ctrlOrMeta && !shift && !alt && (key === "u" || code === "keyu")) {
        block(event);
        return;
      }

      // macOS Chrome/Safari: Cmd + Option + I / J / C / U
      if (
        event.metaKey &&
        alt &&
        (key === "i" ||
          key === "j" ||
          key === "c" ||
          key === "u" ||
          code === "keyi" ||
          code === "keyj" ||
          code === "keyc" ||
          code === "keyu")
      ) {
        block(event);
      }
    };

    // Right-click / long-press context menu (desktop + mobile browsers)
    document.addEventListener("contextmenu", block, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("contextmenu", block, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return null;
}
