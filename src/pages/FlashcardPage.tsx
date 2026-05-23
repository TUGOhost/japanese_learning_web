import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FilterTabs, type FilterOption } from "../components/FilterTabs";
import { n3Vocabulary } from "../data/n3Vocabulary";
import { getProgressEntry } from "../lib/progressStorage";
import type {
  FlashcardScope,
  VocabularyProgressMap
} from "../types/vocabulary";

type FlashcardPageProps = {
  progress: VocabularyProgressMap;
  setMastered: (id: string, mastered: boolean) => void;
};

const scopeOptions: FilterOption<FlashcardScope>[] = [
  { value: "all", label: "全部" },
  { value: "unmastered", label: "未掌握" },
  { value: "favorite", label: "已收藏" }
];

export const FlashcardPage = ({ progress, setMastered }: FlashcardPageProps) => {
  const [scope, setScope] = useState<FlashcardScope>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const practicePool = useMemo(
    () =>
      n3Vocabulary.filter((item) => {
        const itemProgress = getProgressEntry(progress, item.id);

        if (scope === "unmastered") {
          return !itemProgress.mastered;
        }

        if (scope === "favorite") {
          return itemProgress.favorite;
        }

        return true;
      }),
    [progress, scope]
  );

  const currentItem = practicePool[currentIndex] ?? null;

  useEffect(() => {
    setShowAnswer(false);
    setCurrentIndex((index) =>
      practicePool.length === 0 ? 0 : Math.min(index, practicePool.length - 1)
    );
  }, [practicePool.length, scope]);

  const advance = () => {
    setShowAnswer(false);
    setCurrentIndex((index) =>
      practicePool.length <= 1 ? 0 : (index + 1) % practicePool.length
    );
  };

  const handleKnown = () => {
    if (!currentItem) {
      return;
    }

    setMastered(currentItem.id, true);
    advance();
  };

  const handleUnknown = () => {
    if (!currentItem) {
      return;
    }

    setMastered(currentItem.id, false);
    advance();
  };

  return (
    <div className="space-y-5">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-matcha-700">Flashcards</p>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
          闪卡学习
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          当前范围 {practicePool.length} 个词
        </p>
      </header>

      <FilterTabs
        label="闪卡练习范围"
        options={scopeOptions}
        value={scope}
        onChange={setScope}
      />

      {currentItem ? (
        <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-matcha-50 px-3 py-1 text-sm font-medium text-matcha-700">
              {currentIndex + 1}/{practicePool.length}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              {currentItem.partOfSpeech}
            </span>
          </div>

          <div className="flex min-h-64 flex-col items-center justify-center py-8 text-center">
            <h2 className="text-5xl font-semibold tracking-normal text-slate-950">
              {currentItem.word}
            </h2>
            <p className="mt-4 text-lg font-medium text-matcha-700">
              {currentItem.kana}
            </p>

            {showAnswer ? (
              <div className="mt-8 w-full rounded-lg bg-slate-50 p-4 text-left">
                <p className="text-base font-semibold text-slate-900">
                  {currentItem.meaning}
                </p>
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="text-base leading-7 text-slate-900">
                    {currentItem.example}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {currentItem.exampleMeaning}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {showAnswer ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleUnknown}
                className="min-h-12 rounded-lg bg-slate-100 px-4 text-base font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                不认识
              </button>
              <button
                type="button"
                onClick={handleKnown}
                className="min-h-12 rounded-lg bg-matcha-600 px-4 text-base font-semibold text-white transition hover:bg-matcha-700 active:scale-[0.98]"
              >
                认识
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className="min-h-12 w-full rounded-lg bg-matcha-600 px-4 text-base font-semibold text-white transition hover:bg-matcha-700 active:scale-[0.98]"
            >
              显示答案
            </button>
          )}
        </section>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white px-5 py-10 text-center shadow-soft">
          <RotateCcw
            className="mx-auto h-9 w-9 text-matcha-600"
            aria-hidden="true"
          />
          <p className="mt-4 text-base font-semibold text-slate-800">
            暂无可练习词汇
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            当前范围没有词汇，可以切换练习范围。
          </p>
        </div>
      )}
    </div>
  );
};
