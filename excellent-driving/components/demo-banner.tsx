"use client";

import { useEffect, useRef, useState } from "react";

const DISMISS_KEY = "demo-banner-dismissed";
const HEIGHT_VAR = "--demo-banner-height";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(true); // hidden until we check localStorage, avoids a flash
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  // The sidebars in the student/admin layouts are `position: fixed` and
  // span the full viewport height starting at top:0 — they don't know
  // this banner exists just from DOM order. Report our real (possibly
  // wrapped-to-two-lines) height as a CSS variable so those layouts can
  // start below it instead of behind it.
  useEffect(() => {
    function updateHeight() {
      const height = dismissed ? 0 : (ref.current?.offsetHeight ?? 0);
      document.documentElement.style.setProperty(HEIGHT_VAR, `${height}px`);
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [dismissed]);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — worst case it reappears next visit
    }
  }

  if (dismissed) return null;

  return (
    <div
      ref={ref}
      style={{
        background: "#0f1f3d",
        color: "#fff",
        fontSize: "0.82rem",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        flexWrap: "wrap",
        textAlign: "center",
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}
    >
      <span>
        🧪 <strong>Demo build</strong> — WhatsApp &amp; email notifications are simulated (not actually
        sent), and all data here is temporary and may be reset.
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss this notice"
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "none",
          color: "#fff",
          borderRadius: 6,
          width: 22,
          height: 22,
          lineHeight: 1,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
