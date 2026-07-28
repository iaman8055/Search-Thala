import { CATEGORIES, Category } from "@/lib/types";

export function CategoryTabs({
  active,
  onChange,
  variant = "light",
}: {
  active: Category;
  onChange: (category: Category) => void;
  variant?: "light" | "overlay";
}) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {CATEGORIES.map(({ key, label }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              isActive
                ? "bg-white text-slate-900"
                : variant === "overlay"
                ? "bg-black/40 text-white hover:bg-black/60"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
