import { Search, X } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor="vocabulary-search">
        搜索词汇
      </label>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        id="vocabulary-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索日语、假名或中文释义"
        className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-12 text-base text-slate-900 shadow-soft outline-none transition placeholder:text-slate-400 focus:border-matcha-400 focus:ring-4 focus:ring-matcha-100"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95"
          aria-label="清空搜索"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
};
