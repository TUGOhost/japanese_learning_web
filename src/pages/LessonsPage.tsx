import { LessonCard } from "../components/LessonCard";
import type { CurriculumUnit } from "../data/curriculum";
import { grammar } from "../data/grammar";
import { quizzes } from "../data/quizzes";
import { learningSentences } from "../data/sentences";
import { sentencePatterns } from "../data/sentencePatterns";
import { allVocabulary } from "../data/vocabulary";
import type { LearningProgress } from "../types/learning";
import {
  getCurrentUnit,
  getOrderedCurriculum,
  getUnitProgress,
  isUnitUnlocked
} from "../utils/curriculum";

type LessonsPageProps = {
  progress: LearningProgress;
};

const getContentCounts = (unit: CurriculumUnit) => ({
  vocabulary: allVocabulary.filter(
    (item) => item.unitId === unit.id || unit.vocabularyIds.includes(item.id)
  ).length,
  grammar: grammar.filter(
    (item) => item.unitId === unit.id || unit.grammarIds.includes(item.id)
  ).length,
  sentences: learningSentences.filter(
    (item) => item.unitId === unit.id || item.textbookLesson === unit.textbookLesson
  ).length,
  quizzes: quizzes.filter(
    (item) => item.unitId === unit.id || unit.quizIds.includes(item.id)
  ).length
});

export const LessonsPage = ({ progress }: LessonsPageProps) => {
  const orderedCurriculum = getOrderedCurriculum();
  const currentUnit = getCurrentUnit(progress);

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-matcha-700">Curriculum</p>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
          教材学习路线
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          默认按 0 基础顺序推进。后续课次可自由查看，但推荐和练习会优先跟随当前阶段。
        </p>
      </header>

      <div className="rounded-lg border border-matcha-100 bg-matcha-50 p-4">
        <p className="text-sm font-semibold text-matcha-800">
          当前模式：{progress.learningMode === "textbook" ? "教材模式" : "自由学习模式"}
        </p>
        <p className="mt-1 text-sm leading-6 text-matcha-700">
          教材模式会严格从五十音和入门寒暄开始；自由模式允许浏览全部内容，但仍显示建议顺序。
        </p>
      </div>

      <div className="space-y-7">
        {orderedCurriculum.map((stage) => (
          <section key={stage.id} className="relative space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-matcha-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-matcha-700">
                  {stage.level}
                </p>
                <h2 className="text-xl font-semibold text-slate-950">
                  {stage.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {stage.description}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-l border-slate-200 pl-4">
              {stage.units.map((unit) => {
                const unitProgress = getUnitProgress(unit, progress);
                return (
                  <LessonCard
                    key={unit.id}
                    unit={unit}
                    completed={unitProgress.completed}
                    unlocked={isUnitUnlocked(unit, progress)}
                    current={currentUnit?.id === unit.id}
                    progressPercent={unitProgress.percent}
                    contentCounts={getContentCounts(unit)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
