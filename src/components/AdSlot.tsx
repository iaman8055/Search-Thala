"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useGptReady } from "./GptProvider";

// Google's public GPT sample ad unit — always serves a house/test creative,
// safe to request from local/dev environments, no AdSense account needed.
const TEST_AD_UNIT_PATH = "/6355419/Travel/Europe/France/Paris";
// This demo ad unit reliably fills one slot per page for a given size, but
// two simultaneous requests for the *same* unit+size come back as a
// legitimate no-fill. Google's own multi-ad sample for this exact unit only
// maps creatives to two sizes — 300x250 and 728x90 — so those are the only
// two that reliably fill; other IAB sizes (250x250, 320x250, ...) come back
// empty because the demo line item was never configured for them.
export const IN_CONTENT_SIZES: [number, number][] = [
  [300, 250], // Medium Rectangle
  [728, 90], // Leaderboard
];
// GPT calls slotRenderEnded even on a genuine fill, but if the ad request
// itself never fires (script blocked by an ad blocker, offline, etc.) we'd
// otherwise sit on a blank box forever — fall back to a message instead.
const NO_FILL_TIMEOUT_MS = 4000;

function GptSlot({ size, className }: { size: [number, number]; className?: string }) {
  const ready = useGptReady();
  const reactId = useId();
  const divId = `gpt-ad-${reactId.replace(/[:]/g, "")}`;
  const slotRef = useRef<ReturnType<Window["googletag"]["defineSlot"]> | null>(null);
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === "loading" ? "empty" : s));
    }, NO_FILL_TIMEOUT_MS);

    window.googletag.cmd.push(() => {
      const slot = window.googletag.defineSlot(TEST_AD_UNIT_PATH, [size[0], size[1]], divId);
      if (!slot) return;
      slot.addService(window.googletag.pubads());
      slotRef.current = slot;

      window.googletag.pubads().addEventListener("slotRenderEnded", (event) => {
        if (cancelled || event.slot.getSlotElementId() !== divId) return;
        setStatus(event.isEmpty ? "empty" : "filled");
      });

      window.googletag.display(divId);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      window.googletag?.cmd.push(() => {
        if (slotRef.current) {
          window.googletag.destroySlots([slotRef.current]);
        }
      });
    };
  }, [ready, divId, size]);

  return (
    <div className={`relative flex items-center justify-center ${className ?? ""}`}>
      <div
        id={divId}
        style={{ width: size[0], height: size[1], maxWidth: "100%" }}
      />
      {status !== "filled" && (
        <div
          className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs text-slate-500"
          style={{ maxWidth: size[0], maxHeight: size[1] }}
        >
          {status === "loading" ? "Loading ad…" : "No ad to show right now"}
        </div>
      )}
    </div>
  );
}

/**
 * In-content unit shown inside the article grid. Pass an increasing
 * `variant` for each simultaneous instance on the page (0, 1, 2, ...) so
 * concurrent slots rotate through different sizes instead of colliding.
 */
export function AdCard({ className, variant = 0 }: { className?: string; variant?: number }) {
  const size = IN_CONTENT_SIZES[variant % IN_CONTENT_SIZES.length];
  const isBanner = size[1] <= 100;
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#141d2f] ${
        isBanner ? "min-h-[7rem] justify-center py-4" : "h-full min-h-[19rem]"
      } ${className ?? ""}`}
    >
      <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-200">
        Advertisement
      </span>
      <div className={`flex w-full items-center justify-center ${isBanner ? "" : "h-full min-h-[19rem]"}`}>
        <GptSlot size={size} />
      </div>
    </div>
  );
}

/** Full-screen 300x250 ad gate shown between swipes on mobile. */
export function AdInterstitial({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-[#0b1120] p-8 text-center">
      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Advertisement
      </span>
      <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-[#141d2f]">
        <GptSlot size={[300, 250]} />
      </div>
      <p className="text-xs text-slate-500">Ad closes automatically, or continue now</p>
      <button
        onClick={onClose}
        className="rounded-full bg-white px-6 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-200"
      >
        Continue
      </button>
    </div>
  );
}
