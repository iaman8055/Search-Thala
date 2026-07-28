export function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0b1120]/95 px-4 py-3 backdrop-blur sm:px-8">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
          ST
        </span>
        <span className="text-lg font-bold text-white">Search Thala</span>
      </div>
      <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 sm:flex">
        <a href="#" className="transition hover:text-white">
          Search
        </a>
        <a href="#" className="transition hover:text-white">
          Profile
        </a>
      </nav>
    </header>
  );
}
