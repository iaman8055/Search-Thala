// Static placeholder ad card — no ad network involved, just a real
// outbound link styled like a sponsored card.
export function AdCard({ className }: { className?: string }) {
  return (
    <a
      href="https://ads.google.com/intl/en/home/"
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`relative flex h-full min-h-[19rem] flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#141d2f] p-5 transition hover:border-white/30 ${className ?? ""}`}
    >
      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-200">
        Advertisement
      </span>
      <div className="mt-10">
        <p className="text-lg font-semibold text-white">Your ad could be here</p>
        <p className="mt-2 text-sm text-slate-400">
          Reach readers browsing Search Thala. Test placement — click to see how Google Ads works.
        </p>
      </div>
      <span className="text-xs font-semibold text-blue-400">ads.google.com &rarr;</span>
    </a>
  );
}

/** Full-screen ad gate shown between swipes on mobile. */
export function AdInterstitial({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-[#0b1120] p-8 text-center">
      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Advertisement
      </span>
      <a
        href="https://ads.google.com/intl/en/home/"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex w-full max-w-xs flex-col justify-between gap-3 rounded-2xl border border-dashed border-white/20 bg-[#141d2f] p-6 transition hover:border-white/30"
      >
        <p className="text-lg font-semibold text-white">Your ad could be here</p>
        <p className="text-sm text-slate-400">
          Reach readers browsing Search Thala. Test placement — click to see how Google Ads works.
        </p>
        <span className="text-xs font-semibold text-blue-400">ads.google.com &rarr;</span>
      </a>
      <p className="text-xs text-slate-500">Continue to keep browsing</p>
      <button
        onClick={onClose}
        className="rounded-full bg-white px-6 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-200"
      >
        Continue
      </button>
    </div>
  );
}
