import { CheckCircle2, ChevronDown, Circle, Heart } from "lucide-react";
import { useState } from "react";

import type {
  VocabularyItem,
  VocabularyProgressEntry
} from "../types/vocabulary";

type VocabularyCardProps = {
  item: VocabularyItem;
  progress: VocabularyProgressEntry;
  onToggleFavorite: (id: string) => void;
  onToggleMastered: (id: string) => void;
  initiallyExpanded?: boolean;
};

export const VocabularyCard = ({
  item,
  progress,
  onToggleFavorite,
  onToggleMastered,
  initiallyExpanded = false
}: VocabularyCardProps) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="w-full px-4 pb-3 pt-4 text-left transition active:bg-slate-50"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold leading-tight tracking-normal text-slate-950">
                {item.word}
              </h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {item.partOfSpeech}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  item.level === "N3"
                    ? "bg-violet-50 text-violet-700"
                    : "bg-matcha-50 text-matcha-700"
                }`}
              >
                {item.level === "N3" ? "进阶" : item.level}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-matcha-700">
              {item.kana}
            </p>
          </div>
          <ChevronDown
            className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
        <p className="mt-3 text-base leading-7 text-slate-700">
          {item.meaning}
        </p>
      </button>

      <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
        <button
          type="button"
          onClick={() => onToggleMastered(item.id)}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition active:scale-[0.98] ${
            progress.mastered
              ? "bg-matcha-600 text-white hover:bg-matcha-700"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          aria-label={progress.mastered ? "取消已掌握" : "标记为已掌握"}
        >
          {progress.mastered ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Circle className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{progress.mastered ? "已掌握" : "未掌握"}</span>
        </button>
        <button
          type="button"
          onClick={() => onToggleFavorite(item.id)}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition active:scale-[0.98] ${
            progress.favorite
              ? "bg-rose-500 text-white hover:bg-rose-600"
              : "bg-rose-50 text-rose-600 hover:bg-rose-100"
          }`}
          aria-label={progress.favorite ? "取消收藏" : "收藏词汇"}
        >
          <Heart
            className={`h-4 w-4 ${progress.favorite ? "fill-current" : ""}`}
            aria-hidden="true"
          />
          <span>{progress.favorite ? "已收藏" : "收藏"}</span>
        </button>
      </div>

      {expanded ? (
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-4">
          <div className="rounded-lg bg-white p-4">
            <p className="text-sm font-semibold text-slate-500">例句</p>
            <p className="mt-2 text-lg leading-8 text-slate-950">
              {item.example}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.exampleMeaning}
            </p>
          </div>
          {item.tags && item.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};
