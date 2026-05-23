import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Radio
} from "lucide-react";

import type { CurriculumUnit } from "../data/curriculum";

type LessonCardProps = {
  unit: CurriculumUnit;
  completed: boolean;
  unlocked: boolean;
  current: boolean;
  progressPercent: number;
  contentCounts: {
    vocabulary: number;
    grammar: number;
    sentences: number;
    quizzes: number;
  };
};

export const LessonCard = ({
  unit,
  completed,
  unlocked,
  current,
  progressPercent,
  contentCounts
}: LessonCardProps) => {
  const statusLabel = completed
    ? "已完成"
    : current
      ? "当前课次"
      : unlocked
        ? "已解锁"
        : "未解锁";

  return (
    <a
      href={`#/lessons/${unit.id}`}
      className={`block rounded-lg border bg-white p-4 shadow-soft transition active:scale-[0.99] ${
        current
          ? "border-matcha-300 ring-2 ring-matcha-100"
          : completed
            ? "border-matcha-100"
            : unlocked
              ? "border-slate-100 hover:-translate-y-0.5 hover:shadow-lg"
              : "border-slate-100 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-matcha-50 px-2.5 py-1 text-xs font-semibold text-matcha-700">
              {unit.textbookLesson ? `第 ${unit.textbookLesson} 课` : unit.source}
            </span>
            {unit.source === "N3进阶" ? (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                进阶
              </span>
            ) : null}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                completed
                  ? "bg-matcha-100 text-matcha-800"
                  : current
                    ? "bg-sky-50 text-sky-700"
                    : unlocked
                      ? "bg-slate-100 text-slate-600"
                      : "bg-slate-100 text-slate-500"
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
            {unit.title}
          </h2>
          {unit.subtitle ? (
            <p className="mt-1 text-sm font-medium text-matcha-700">
              {unit.subtitle}
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {unit.description}
          </p>
        </div>
        {completed ? (
          <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-matcha-600" />
        ) : unlocked ? (
          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
        ) : (
          <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
        )}
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            completed ? "bg-matcha-500" : current ? "bg-sky-500" : "bg-slate-300"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
          <Clock3 className="h-3.5 w-3.5" />
          {unit.estimatedMinutes} 分钟
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
          <Radio className="h-3.5 w-3.5" />
          词汇 {contentCounts.vocabulary}
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1">
          语法 {contentCounts.grammar}
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1">
          句子 {contentCounts.sentences}
        </span>
        <span className="rounded-full bg-slate-50 px-2.5 py-1">
          练习 {contentCounts.quizzes}
        </span>
      </div>
    </a>
  );
};
