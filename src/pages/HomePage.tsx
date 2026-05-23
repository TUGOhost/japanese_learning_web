import { BookOpen, ClipboardCheck, Layers3 } from "lucide-react";

import { quizzes } from "../data/quizzes";
import { allVocabulary } from "../data/vocabulary";
import type { LearningProgress, LearningStats } from "../types/learning";
import {
  getNextRecommendedUnit,
  getOrderedCurriculum,
  getProgressSummary
} from "../utils/curriculum";

type HomePageProps = {
  progress: LearningProgress;
  stats: LearningStats;
};

export const HomePage = ({ progress, stats }: HomePageProps) => {
  const summary = getProgressSummary(progress);
  const recommendedUnit = getNextRecommendedUnit(progress);
  const unitVocabulary = recommendedUnit
    ? allVocabulary.filter(
        (item) =>
          item.unitId === recommendedUnit.id ||
          recommendedUnit.vocabularyIds.includes(item.id)
      )
    : [];
  const unitQuizzes = recommendedUnit
    ? quizzes.filter(
        (quiz) =>
          quiz.unitId === recommendedUnit.id ||
          recommendedUnit.quizIds.includes(quiz.id)
      )
    : [];
  const recommendedQuiz =
    unitQuizzes.find((quiz) => !progress.completedQuizIds.includes(quiz.id)) ??
    unitQuizzes[0];

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-gradient-to-br from-matcha-600 to-teal-500 p-5 text-white shadow-soft">
        <p className="text-sm font-semibold text-white/80">
          {progress.learningMode === "textbook" ? "教材模式" : "自由学习模式"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">
          从五十音开始的日语路线
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/85">
          首页推荐会按五十音、入门寒暄、初级上、初级下、N5/N4 巩固、N3 进阶的顺序推进。
        </p>
        <a
          href={recommendedUnit ? `#/lessons/${recommendedUnit.id}` : "#/lessons"}
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-4 text-sm font-semibold text-matcha-700 transition active:scale-95"
        >
          继续学习
        </a>
      </section>

      <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-soft">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">当前进度</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {summary.currentUnitTitle}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-matcha-50 px-3 py-1 text-sm font-semibold text-matcha-700">
            阶段 {stats.currentStage}
          </span>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-matcha-500 transition-all"
            style={{ width: `${summary.overallUnitPercent}%` }}
          />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xl font-semibold text-slate-950">
              {summary.completedUnitCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">已完成课次</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xl font-semibold text-slate-950">
              {stats.masteredVocabulary}
            </p>
            <p className="mt-1 text-xs text-slate-500">掌握词汇</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xl font-semibold text-slate-950">
              {stats.completedPractice}
            </p>
            <p className="mt-1 text-xs text-slate-500">练习题</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">今日推荐学习</h2>
        {recommendedUnit ? (
          <div className="grid gap-3">
            <a
              href={`#/lessons/${recommendedUnit.id}`}
              className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-soft transition active:scale-[0.99]"
            >
              <BookOpen className="h-5 w-5 text-matcha-600" />
              <div>
                <p className="font-semibold text-slate-950">
                  {recommendedUnit.title}
                </p>
                <p className="text-sm text-slate-500">当前未完成的最早单元</p>
              </div>
            </a>
            <a
              href="#/practice"
              className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-soft transition active:scale-[0.99]"
            >
              <Layers3 className="h-5 w-5 text-sky-600" />
              <div>
                <p className="font-semibold text-slate-950">
                  本单元词汇复习 {unitVocabulary.length} 个
                </p>
                <p className="text-sm text-slate-500">
                  闪卡默认跟随当前和已解锁内容
                </p>
              </div>
            </a>
            <a
              href="#/practice"
              className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-soft transition active:scale-[0.99]"
            >
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-slate-950">
                  {recommendedQuiz ? recommendedQuiz.question : "本单元练习待补充"}
                </p>
                <p className="text-sm text-slate-500">
                  {recommendedQuiz ? "推荐练习题" : "请在 src/data/quizzes.ts 补充"}
                </p>
              </div>
            </a>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-5 text-center shadow-soft">
            <p className="font-semibold text-slate-900">路线已完成</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">学习路线概览</h2>
        <div className="space-y-2">
          {getOrderedCurriculum().map((stage) => {
            const active = stage.id === summary.currentStageId;
            const completedCount = stage.units.filter((unit) =>
              progress.completedUnitIds.includes(unit.id)
            ).length;

            return (
              <a
                key={stage.id}
                href="#/lessons"
                className={`flex min-h-16 w-full items-center gap-3 rounded-lg border p-3 text-left transition active:scale-[0.99] ${
                  active
                    ? "border-matcha-200 bg-matcha-50"
                    : "border-slate-100 bg-white"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    active
                      ? "bg-matcha-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {stage.order}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium text-slate-800">
                    {stage.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {completedCount}/{stage.units.length} 个课次完成
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
};
