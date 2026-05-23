import { AlertTriangle, RotateCcw } from "lucide-react";
import { useState } from "react";

import { GrammarCard } from "../components/GrammarCard";
import { ProgressStats } from "../components/ProgressStats";
import { grammar } from "../data/grammar";
import type {
  LearningMode,
  LearningProgress,
  LearningStats
} from "../types/learning";
import { getProgressSummary } from "../utils/curriculum";

type ProfilePageProps = {
  progress: LearningProgress;
  stats: LearningStats;
  resetProgress: () => void;
  setLearningMode: (mode: LearningMode) => void;
  toggleGrammarFavorite: (id: string) => void;
  toggleGrammarMastered: (id: string) => void;
};

export const ProfilePage = ({
  progress,
  stats,
  resetProgress,
  setLearningMode,
  toggleGrammarFavorite,
  toggleGrammarMastered
}: ProfilePageProps) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const summary = getProgressSummary(progress);
  const favoriteGrammar = grammar.filter((item) =>
    progress.favoriteGrammarIds.includes(item.id)
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-matcha-700">Profile</p>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
          我的
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          学习记录保存在当前浏览器本地，不会上传服务器。
        </p>
      </header>

      <ProgressStats stats={stats} />

      <section className="rounded-lg bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-950">学习模式</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLearningMode("textbook")}
            className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
              progress.learningMode === "textbook"
                ? "bg-matcha-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            教材模式
          </button>
          <button
            type="button"
            onClick={() => setLearningMode("free")}
            className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
              progress.learningMode === "free"
                ? "bg-matcha-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            自由学习
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          教材模式严格按照课程路线推荐；自由学习模式可以浏览全部内容，但页面仍保留难度标签。
        </p>
      </section>

      <section className="rounded-lg bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-950">当前进度</h2>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-matcha-500"
            style={{ width: `${summary.overallUnitPercent}%` }}
          />
        </div>
        <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <p>当前学习模式：{progress.learningMode === "textbook" ? "教材模式" : "自由学习模式"}</p>
          <p>当前阶段：{summary.currentStageTitle}</p>
          <p>
            你正在学习：
            <a
              className="font-semibold text-matcha-700"
              href={summary.currentUnitId ? `#/lessons/${summary.currentUnitId}` : "#/lessons"}
            >
              {summary.currentUnitTitle}
            </a>
          </p>
          <p>
            下一步建议：继续学习 {summary.nextUnitTitle}
            ，完成本课单词和语法后再进入下一课。
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">已完成课次数</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {summary.completedUnitCount}/{summary.totalUnitCount}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">N3 内容</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {summary.n3Unlocked ? "已解锁" : "未解锁"}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">初级上完成度</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {summary.shokyuJouPercent}%
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">初级下完成度</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {summary.shokyuGePercent}%
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">收藏语法</h2>
        {favoriteGrammar.length > 0 ? (
          favoriteGrammar.map((item) => (
            <GrammarCard
              key={item.id}
              item={item}
              favorite={progress.favoriteGrammarIds.includes(item.id)}
              mastered={progress.masteredGrammarIds.includes(item.id)}
              onToggleFavorite={toggleGrammarFavorite}
              onToggleMastered={toggleGrammarMastered}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-5 text-center shadow-soft">
            <p className="text-sm text-slate-500">还没有收藏语法。</p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-amber-100 bg-amber-50 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h2 className="font-semibold text-amber-900">数据管理</h2>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              清空后会删除课程、词汇、语法和练习记录。
            </p>
          </div>
        </div>
        {confirmingReset ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="min-h-11 rounded-lg bg-white font-semibold text-slate-700"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                resetProgress();
                setConfirmingReset(false);
              }}
              className="min-h-11 rounded-lg bg-rose-600 font-semibold text-white"
            >
              确认清空
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white font-semibold text-rose-600"
          >
            <RotateCcw className="h-4 w-4" />
            清空学习进度
          </button>
        )}
      </section>
    </div>
  );
};
