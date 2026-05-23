import { CheckCircle2, Heart } from "lucide-react";
import { useState } from "react";

import type { GrammarItem } from "../types/learning";

type GrammarCardProps = {
  item: GrammarItem;
  favorite?: boolean;
  mastered?: boolean;
  onToggleFavorite?: (id: string) => void;
  onToggleMastered?: (id: string) => void;
};

export const GrammarCard = ({
  item,
  favorite = false,
  mastered = false,
  onToggleFavorite,
  onToggleMastered
}: GrammarCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-lg border border-slate-100 bg-white p-4 shadow-soft">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-matcha-50 px-2.5 py-1 text-xs font-semibold text-matcha-700">
            {item.level}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {item.category}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-950">
          {item.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-matcha-700">
          {item.structure}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{item.meaning}</p>
      </button>

      {expanded ? (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
          <p>{item.explanation}</p>
          {item.tipsForChineseSpeakers ? (
            <p className="rounded-lg bg-amber-50 p-3 text-amber-800">
              {item.tipsForChineseSpeakers}
            </p>
          ) : null}
          {item.examples.map((example) => (
            <div key={example.japanese} className="rounded-lg bg-slate-50 p-3">
              <p className="font-semibold text-slate-950">{example.japanese}</p>
              {example.reading ? (
                <p className="mt-1 text-xs text-slate-500">{example.reading}</p>
              ) : null}
              <p className="mt-1 text-slate-600">{example.chinese}</p>
            </div>
          ))}
        </div>
      ) : null}

      {(onToggleFavorite || onToggleMastered) && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onToggleMastered?.(item.id)}
            className={`min-h-11 rounded-lg text-sm font-semibold transition active:scale-[0.98] ${
              mastered ? "bg-matcha-600 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            <CheckCircle2 className="mr-1 inline h-4 w-4" />
            {mastered ? "已掌握" : "标记掌握"}
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite?.(item.id)}
            className={`min-h-11 rounded-lg text-sm font-semibold transition active:scale-[0.98] ${
              favorite ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600"
            }`}
          >
            <Heart className={`mr-1 inline h-4 w-4 ${favorite ? "fill-current" : ""}`} />
            {favorite ? "已收藏" : "收藏"}
          </button>
        </div>
      )}
    </article>
  );
};
