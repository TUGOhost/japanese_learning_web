import { useState } from "react";

import type { KanaItem } from "../types/learning";

type KanaTableProps = {
  items: KanaItem[];
};

export const KanaTable = ({ items }: KanaTableProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setSelectedId((current) => (current === item.id ? null : item.id))
            }
            className={`min-h-20 rounded-lg border p-2 text-center shadow-sm transition active:scale-95 ${
              selectedId === item.id
                ? "border-matcha-300 bg-matcha-50"
                : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <span className="block text-3xl font-semibold leading-none text-slate-950">
              {item.kana}
            </span>
            <span className="mt-2 block text-xs font-semibold text-matcha-700">
              {item.romaji}
            </span>
          </button>
        ))}
      </div>

      {selectedItem ? (
        <div className="rounded-lg border border-matcha-100 bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-4xl font-semibold text-slate-950">
                {selectedItem.kana}
              </p>
              <p className="mt-1 text-sm font-semibold text-matcha-700">
                {selectedItem.romaji} · {selectedItem.row}
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {selectedItem.column}
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">发音说明：</span>
              {selectedItem.pronunciationTip}
            </p>
            <p>
              <span className="font-semibold text-slate-800">中文近似：</span>
              {selectedItem.chineseHint}
            </p>
            <p>
              <span className="font-semibold text-slate-800">例词：</span>
              {selectedItem.exampleWord}（{selectedItem.exampleReading}）：
              {selectedItem.exampleMeaning}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
};
