import {
  BookmarkCheck,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap
} from "lucide-react";

import type { LearningStats } from "../types/learning";

type ProgressStatsProps = {
  stats: LearningStats;
};

const statItems = [
  {
    key: "completedLessons",
    label: "已完成课程",
    icon: GraduationCap,
    className: "bg-sky-50 text-sky-700"
  },
  {
    key: "masteredVocabulary",
    label: "已掌握词汇",
    icon: CheckCircle2,
    className: "bg-matcha-50 text-matcha-700"
  },
  {
    key: "favoriteCount",
    label: "已收藏内容",
    icon: BookmarkCheck,
    className: "bg-rose-50 text-rose-700"
  },
  {
    key: "completedPractice",
    label: "已完成练习",
    icon: ClipboardCheck,
    className: "bg-amber-50 text-amber-700"
  }
] as const;

export const ProgressStats = ({ stats }: ProgressStatsProps) => {
  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-100 bg-white p-5 shadow-soft">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">总体进度</p>
            <p className="mt-2 text-4xl font-semibold tracking-normal text-slate-950">
              {stats.overallPercent}%
            </p>
          </div>
          <p className="pb-1 text-sm font-medium text-slate-500">
            正确率 {stats.accuracy}%
          </p>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-matcha-500 transition-all duration-300"
            style={{ width: `${stats.overallPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          const value = stats[item.key];

          return (
            <div
              key={item.key}
              className="rounded-lg border border-slate-100 bg-white p-4 shadow-soft"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.className}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
