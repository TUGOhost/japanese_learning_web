import type { SentencePattern } from "../types/learning";

type SentencePatternCardProps = {
  pattern: SentencePattern;
};

export const SentencePatternCard = ({ pattern }: SentencePatternCardProps) => {
  return (
    <article className="rounded-lg border border-slate-100 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-950">
            {pattern.pattern}
          </p>
          <p className="mt-1 text-sm font-semibold text-matcha-700">
            {pattern.meaning}
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          {pattern.level}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {pattern.explanation}
      </p>
      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
        <p className="font-semibold text-slate-950">
          {pattern.examples[0]?.japanese}
        </p>
        <p className="mt-1 text-slate-600">{pattern.examples[0]?.chinese}</p>
      </div>
    </article>
  );
};
