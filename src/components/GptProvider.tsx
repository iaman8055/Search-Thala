"use client";

import Script from "next/script";
import { createContext, useContext, useEffect, useState } from "react";

interface GptSlotObject {
  addService: (service: unknown) => GptSlotObject;
  getSlotElementId: () => string;
}

interface SlotRenderEndedEvent {
  slot: GptSlotObject;
  isEmpty: boolean;
}

declare global {
  interface Window {
    googletag: {
      cmd: Array<() => void>;
      pubads: () => {
        enableSingleRequest: () => void;
        collapseEmptyDivs: () => void;
        addEventListener: (event: "slotRenderEnded", cb: (e: SlotRenderEndedEvent) => void) => void;
      };
      defineSlot: (
        adUnitPath: string,
        size: number[][] | number[],
        divId: string
      ) => GptSlotObject | null;
      enableServices: () => void;
      display: (divId: string) => void;
      destroySlots: (slots?: unknown[]) => void;
    };
  }
}

const GptReadyContext = createContext(false);

export function useGptReady() {
  return useContext(GptReadyContext);
}

// GPT only allows enableServices() to be called once for the whole page —
// calling it per-slot leaves every slot after the first with no creative.
// This provider owns that single call and hands slots a "ready" flag once
// it's done, so individual ad components just define + display their slot.
export function GptProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.googletag = window.googletag || ({ cmd: [] } as unknown as Window["googletag"]);
    window.googletag.cmd.push(() => {
      window.googletag.pubads().enableSingleRequest();
      window.googletag.pubads().collapseEmptyDivs();
      window.googletag.enableServices();
      setReady(true);
    });
  }, []);

  return (
    <>
      <Script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" strategy="afterInteractive" />
      <GptReadyContext.Provider value={ready}>{children}</GptReadyContext.Provider>
    </>
  );
}
