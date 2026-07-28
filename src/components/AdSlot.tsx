export function AdCard() {
  return (
    <div className="flex h-full min-h-[19rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-[#141d2f] p-6 text-center">
      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Advertisement
      </span>
      <p className="text-sm font-semibold text-slate-300">Your ad could be here</p>
      <p className="text-xs text-slate-500">Sponsored placement · 300x250</p>
    </div>
  );
}

export function AdInterstitial({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-[#0b1120] p-8 text-center">
      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Advertisement
      </span>
      <div className="flex h-56 w-full max-w-xs items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#141d2f]">
        <p className="px-6 text-sm text-slate-400">
          Sponsored content placeholder — plug in your ad network SDK here.
        </p>
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
