import { useMemo, useState } from "react";

import { FilterTabs, type FilterOption } from "../components/FilterTabs";
import { KanaTable } from "../components/KanaTable";
import { kana } from "../data/kana";
import type { KanaType } from "../types/learning";

const kanaTypeOptions: FilterOption<KanaType>[] = [
  { value: "hiragana", label: "平假名" },
  { value: "katakana", label: "片假名" }
];

export const KanaPage = () => {
  const [type, setType] = useState<KanaType>("hiragana");
  const items = useMemo(() => kana.filter((item) => item.type === type), [type]);

  return (
    <div className="space-y-5">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-matcha-700">Kana</p>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
          五十音
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          点击假名查看发音说明、中文近似提示和例词。先掌握清音，再扩展浊音、半浊音和拗音。
        </p>
      </header>

      <FilterTabs
        label="假名类型"
        options={kanaTypeOptions}
        value={type}
        onChange={setType}
      />

      <KanaTable items={items} />
    </div>
  );
};
