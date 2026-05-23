import { ProgressStats } from "../components/ProgressStats";
import type { LearningStats } from "../types/learning";

type StatsPageProps = {
  stats: LearningStats;
};

export const StatsPage = ({ stats }: StatsPageProps) => {
  return (
    <div className="space-y-5">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-matcha-700">Progress</p>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
          学习统计
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          数据保存在当前浏览器中。
        </p>
      </header>

      <ProgressStats stats={stats} />
    </div>
  );
};
