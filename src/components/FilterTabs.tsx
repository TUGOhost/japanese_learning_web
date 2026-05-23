export type FilterOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type FilterTabsProps<T extends string> = {
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export const FilterTabs = <T extends string>({
  label,
  options,
  value,
  onChange
}: FilterTabsProps<T>) => {
  return (
    <div aria-label={label} className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-2">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex min-h-11 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition active:scale-95 ${
                active
                  ? "border-matcha-300 bg-matcha-100 text-matcha-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{option.label}</span>
              {typeof option.count === "number" ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                    active
                      ? "bg-white/70 text-matcha-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {option.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
