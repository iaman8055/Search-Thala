import Image from "next/image";

export function AdCard({ seed = "ad" }: { seed?: string | number }) {
  return (
    <div className="relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#141d2f]">
      <div className="relative h-full min-h-[19rem] w-full">
        <Image
          src={`https://picsum.photos/seed/${seed}/600/400`}
          alt="Advertisement"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-200">
        Advertisement
      </span>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-sm font-semibold text-white">Your ad could be here</p>
        <p className="text-xs text-slate-300">Sponsored placement · 300x250</p>
      </div>
    </div>
  );
}

export function AdInterstitial({ onClose, seed = "interstitial" }: { onClose: () => void; seed?: string | number }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-[#0b1120] p-8 text-center">
      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Advertisement
      </span>
      <div className="relative h-56 w-full max-w-xs overflow-hidden rounded-2xl border border-dashed border-white/20 bg-[#141d2f]">
        <Image
          src={`https://picsum.photos/seed/${seed}/400/400`}
          alt="Advertisement"
          fill
          sizes="320px"
          className="object-cover"
        />
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
