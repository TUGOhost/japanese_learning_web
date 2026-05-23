import { ArrowLeft, CheckCircle2, ClipboardCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { GrammarCard } from "../components/GrammarCard";
import { QuizCard } from "../components/QuizCard";
import { SentencePatternCard } from "../components/SentencePatternCard";
import { VocabularyCard } from "../components/VocabularyCard";
import { expressions } from "../data/expressions";
import { grammar } from "../data/grammar";
import { quizzes } from "../data/quizzes";
import { learningSentences } from "../data/sentences";
import { sentencePatterns } from "../data/sentencePatterns";
import { allVocabulary } from "../data/vocabulary";
import {
  filterVisibleContent,
  hasPrivateImportedContent
} from "../lib/contentVisibility";
import {
  getNextQuestionIndex,
  gradeQuizAnswer,
  type QuizAnswerResult
} from "../lib/quizEngine";
import {
  getVocabularyProgressEntry,
  type LearningProgress
} from "../types/learning";
import {
  getStageForUnit,
  getUnitById,
  getUnitProgress,
  isUnitUnlocked
} from "../utils/curriculum";

type LessonDetailPageProps = {
  lessonId: string;
  progress: LearningProgress;
  completeUnit: (unitId: string) => void;
  setCurrentUnit: (unitId: string) => void;
  recordQuizAnswer: (questionId: string, correct: boolean) => void;
  toggleVocabularyFavorite: (id: string) => void;
  toggleVocabularyMastered: (id: string) => void;
  toggleGrammarFavorite: (id: string) => void;
  toggleGrammarMastered: (id: string) => void;
};

const uniqueById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

const EmptyContent = ({
  title,
  file,
  unitId,
  textbookLesson
}: {
  title: string;
  file: string;
  unitId: string;
  textbookLesson?: number;
}) => (
  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500 shadow-soft">
    <p className="font-semibold text-slate-800">{title}</p>
    <p className="mt-1">
      本课内容待补充。你可以在{" "}
      <span className="font-mono text-xs text-slate-700">
        content/sources/japanese-note
      </span>{" "}
      中放入对应 Markdown，或在{" "}
      <span className="font-mono text-xs text-slate-700">src/data</span>{" "}
      中手动添加内容。
    </p>
  </div>
);

export const LessonDetailPage = ({
  lessonId,
  progress,
  completeUnit,
  setCurrentUnit,
  recordQuizAnswer,
  toggleVocabularyFavorite,
  toggleVocabularyMastered,
  toggleGrammarFavorite,
  toggleGrammarMastered
}: LessonDetailPageProps) => {
  const unit = getUnitById(lessonId);
  const unitId = unit?.id;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<QuizAnswerResult | null>(null);

  useEffect(() => {
    if (unitId) {
      setCurrentUnit(unitId);
    }
  }, [setCurrentUnit, unitId]);

  const unitVocabulary = useMemo(
    () =>
      unit
        ? filterVisibleContent(
            uniqueById(
              allVocabulary.filter(
                (item) => item.unitId === unit.id || unit.vocabularyIds.includes(item.id)
              )
            )
          )
        : [],
    [unit]
  );
  const unitGrammar = useMemo(
    () =>
      unit
        ? filterVisibleContent(
            uniqueById(
              grammar.filter(
                (item) => item.unitId === unit.id || unit.grammarIds.includes(item.id)
              )
            )
          )
        : [],
    [unit]
  );
  const unitPatterns = useMemo(
    () =>
      unit
        ? filterVisibleContent(
            uniqueById(
              sentencePatterns.filter(
                (item) =>
                  item.unitId === unit.id || unit.sentencePatternIds.includes(item.id)
              )
            )
          )
        : [],
    [unit]
  );
  const unitExpressions = useMemo(
    () =>
      unit
        ? filterVisibleContent(
            uniqueById(
              expressions.filter(
                (item) =>
                  item.unitId === unit.id ||
                  (item.textbookLesson === unit.textbookLesson &&
                    item.textbookBook === unit.textbookBook)
              )
            )
          )
        : [],
    [unit]
  );
  const unitSentences = useMemo(
    () =>
      unit
        ? filterVisibleContent(
            uniqueById(
              learningSentences.filter(
                (item) =>
                  item.unitId === unit.id ||
                  (item.textbookLesson === unit.textbookLesson &&
                    item.textbookBook === unit.textbookBook)
              )
            )
          )
        : [],
    [unit]
  );
  const unitQuizzes = useMemo(
    () =>
      unit
        ? filterVisibleContent(
            uniqueById(
              quizzes.filter(
                (item) => item.unitId === unit.id || unit.quizIds.includes(item.id)
              )
            )
          )
        : [],
    [unit]
  );
  const privateImportedContentVisible = hasPrivateImportedContent([
    ...unitVocabulary,
    ...unitGrammar,
    ...unitPatterns,
    ...unitExpressions,
    ...unitSentences,
    ...unitQuizzes
  ]);

  const currentQuestion = unitQuizzes[questionIndex] ?? unitQuizzes[0];

  if (!unit) {
    return (
      <div className="space-y-4">
        <a href="#/lessons" className="text-sm font-semibold text-matcha-700">
          返回课程
        </a>
        <div className="rounded-lg bg-white p-6 text-center shadow-soft">
          <p className="font-semibold text-slate-900">没有找到课程单元</p>
        </div>
      </div>
    );
  }

  const stage = getStageForUnit(unit.id);
  const unlocked = isUnitUnlocked(unit, progress);
  const unitProgress = getUnitProgress(unit, progress);
  const completed = unitProgress.completed;

  const handleSelectAnswer = (answer: string) => {
    if (!currentQuestion || result) {
      return;
    }

    const answerResult = gradeQuizAnswer(currentQuestion, answer);
    setSelectedAnswer(answer);
    setResult(answerResult);
    recordQuizAnswer(currentQuestion.id, answerResult.isCorrect);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setResult(null);
    setQuestionIndex((index) => getNextQuestionIndex(index, unitQuizzes.length));
  };

  return (
    <div className="space-y-5">
      <a
        href="#/lessons"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-matcha-700 transition hover:bg-matcha-50"
      >
        <ArrowLeft className="h-4 w-4" />
        返回课程路线
      </a>

      <header className="rounded-lg bg-white p-5 shadow-soft">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-matcha-50 px-3 py-1 text-xs font-semibold text-matcha-700">
            {stage?.level ?? "课程"}
          </span>
          {unit.textbookLesson ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              第 {unit.textbookLesson} 课
            </span>
          ) : null}
          {unit.source === "N3进阶" ? (
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              进阶
            </span>
          ) : null}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {unit.estimatedMinutes} 分钟
          </span>
        </div>
        <h1 className="mt-4 text-2xl font-semibold leading-9 text-slate-950">
          {unit.title}
        </h1>
        {unit.subtitle ? (
          <p className="mt-1 text-sm font-semibold text-matcha-700">
            {unit.subtitle}
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {unit.description}
        </p>
        {!unlocked ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            本课可以查看，但教材模式下建议先完成前置单元再学习。
          </p>
        ) : null}
        {privateImportedContentVisible ? (
          <p className="mt-4 rounded-lg bg-sky-50 p-3 text-sm leading-6 text-sky-800">
            该内容来自本地导入源，仅供个人学习使用。
          </p>
        ) : null}
      </header>

      <section className="rounded-lg bg-white p-4 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-950">学习目标</h2>
        <div className="mt-3 space-y-2">
          {unit.objectives.map((objective) => (
            <p key={objective} className="flex gap-2 text-sm text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-matcha-600" />
              {objective}
            </p>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">本课核心单词</h2>
        {unitVocabulary.length > 0 ? (
          unitVocabulary.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              progress={getVocabularyProgressEntry(progress, item.id)}
              onToggleFavorite={toggleVocabularyFavorite}
              onToggleMastered={toggleVocabularyMastered}
            />
          ))
        ) : (
          <EmptyContent
            title="本课单词待补充"
            file="src/data/vocabulary.ts"
            unitId={unit.id}
            textbookLesson={unit.textbookLesson}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">本课核心语法</h2>
        {unitGrammar.length > 0 ? (
          unitGrammar.map((item) => (
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
          <EmptyContent
            title="本课语法待补充"
            file="src/data/grammar.ts"
            unitId={unit.id}
            textbookLesson={unit.textbookLesson}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">本课句型</h2>
        {unitPatterns.length > 0 ? (
          unitPatterns.map((pattern) => (
            <SentencePatternCard key={pattern.id} pattern={pattern} />
          ))
        ) : (
          <EmptyContent
            title="本课句型待补充"
            file="src/data/sentencePatterns.ts"
            unitId={unit.id}
            textbookLesson={unit.textbookLesson}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">本课表达</h2>
        {unitExpressions.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {unitExpressions.map((expression) => (
              <article
                key={expression.id}
                className="rounded-lg border border-slate-100 bg-white p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold leading-7 text-slate-950">
                      {expression.expression}
                    </p>
                    {expression.reading ? (
                      <p className="mt-1 text-sm text-matcha-700">
                        {expression.reading}
                      </p>
                    ) : null}
                  </div>
                  {expression.category ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {expression.category}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {expression.meaning}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyContent
            title="本课表达待补充"
            file="src/data/expressions.ts"
            unitId={unit.id}
            textbookLesson={unit.textbookLesson}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">本课句子</h2>
        {unitSentences.length > 0 ? (
          <div className="space-y-3">
            {unitSentences.map((sentence) => (
              <article
                key={sentence.id}
                className="rounded-lg border border-slate-100 bg-white p-4 shadow-soft"
              >
                <p className="text-lg font-semibold leading-8 text-slate-950">
                  {sentence.japanese}
                </p>
                {sentence.reading ? (
                  <p className="mt-1 text-sm text-matcha-700">
                    {sentence.reading}
                  </p>
                ) : null}
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {sentence.chinese}
                </p>
                {sentence.note ? (
                  <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                    {sentence.note}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyContent
            title="本课句子待补充"
            file="src/data/sentences.ts"
            unitId={unit.id}
            textbookLesson={unit.textbookLesson}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">本课练习</h2>
        {currentQuestion ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-soft">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <ClipboardCheck className="h-4 w-4 text-matcha-600" />
                已完成 {unitQuizzes.filter((quiz) => progress.completedQuizIds.includes(quiz.id)).length}/{unitQuizzes.length} 题
              </div>
            </div>
            <QuizCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              result={result}
              onSelect={handleSelectAnswer}
              onNext={handleNextQuestion}
            />
          </div>
        ) : (
          <EmptyContent
            title="本课练习待补充"
            file="src/data/quizzes.ts"
            unitId={unit.id}
            textbookLesson={unit.textbookLesson}
          />
        )}
      </section>

      <button
        type="button"
        onClick={() => completeUnit(unit.id)}
        className={`min-h-12 w-full rounded-lg px-4 text-base font-semibold transition active:scale-[0.98] ${
          completed
            ? "bg-matcha-100 text-matcha-800"
            : "bg-matcha-600 text-white hover:bg-matcha-700"
        }`}
      >
        {completed ? "本课已完成" : "标记本课已完成"}
      </button>
    </div>
  );
};
