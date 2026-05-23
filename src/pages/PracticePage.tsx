import { useMemo, useState } from "react";

import { FilterTabs, type FilterOption } from "../components/FilterTabs";
import { QuizCard } from "../components/QuizCard";
import { SearchBar } from "../components/SearchBar";
import { VocabularyCard } from "../components/VocabularyCard";
import { quizzes } from "../data/quizzes";
import { allVocabulary } from "../data/vocabulary";
import {
  filterVocabulary,
  getPartOfSpeechOptions
} from "../lib/vocabularyFilters";
import {
  getNextQuestionIndex,
  gradeQuizAnswer,
  type QuizAnswerResult
} from "../lib/quizEngine";
import {
  getVocabularyProgressEntry,
  toVocabularyProgressMap,
  type LearningProgress
} from "../types/learning";
import type { PartOfSpeechFilter, VocabularyStatusFilter } from "../types/vocabulary";
import {
  getAvailableUnits,
  getCurrentUnit
} from "../utils/curriculum";

type PracticePageProps = {
  progress: LearningProgress;
  recordQuizAnswer: (questionId: string, correct: boolean) => void;
  toggleVocabularyFavorite: (id: string) => void;
  toggleVocabularyMastered: (id: string) => void;
  setVocabularyMastered: (id: string, mastered: boolean) => void;
};

const quizTypeOptions: FilterOption<string>[] = [
  { value: "all", label: "全部题型" },
  { value: "kana", label: "五十音" },
  { value: "vocabulary", label: "词汇" },
  { value: "grammar", label: "语法" },
  { value: "sentence", label: "句子" },
  { value: "conjugation", label: "动词变形" }
];

const vocabularyStatusOptions: FilterOption<VocabularyStatusFilter>[] = [
  { value: "all", label: "全部" },
  { value: "unmastered", label: "未掌握" },
  { value: "mastered", label: "已掌握" },
  { value: "favorite", label: "已收藏" }
];

type VocabularyStageFilter =
  | "current"
  | "unlocked"
  | "预备"
  | "N5"
  | "N4"
  | "N3"
  | "all";

const vocabularyStageOptions: FilterOption<VocabularyStageFilter>[] = [
  { value: "current", label: "当前阶段" },
  { value: "unlocked", label: "已解锁" },
  { value: "预备", label: "预备" },
  { value: "N5", label: "N5" },
  { value: "N4", label: "N4" },
  { value: "N3", label: "N3" },
  { value: "all", label: "全部" }
];

export const PracticePage = ({
  progress,
  recordQuizAnswer,
  toggleVocabularyFavorite,
  toggleVocabularyMastered,
  setVocabularyMastered
}: PracticePageProps) => {
  const [quizType, setQuizType] = useState("all");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<QuizAnswerResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<VocabularyStatusFilter>("all");
  const [stageFilter, setStageFilter] =
    useState<VocabularyStageFilter>("current");
  const [partOfSpeechFilter, setPartOfSpeechFilter] =
    useState<PartOfSpeechFilter>("all");
  const [flashIndex, setFlashIndex] = useState(0);
  const [showFlashAnswer, setShowFlashAnswer] = useState(false);

  const availableUnits = useMemo(() => getAvailableUnits(progress), [progress]);
  const currentUnit = useMemo(() => getCurrentUnit(progress), [progress]);
  const availableUnitIds = useMemo(
    () => new Set(availableUnits.map((unit) => unit.id)),
    [availableUnits]
  );
  const currentUnitVocabularyIds = useMemo(
    () => new Set(currentUnit?.vocabularyIds ?? []),
    [currentUnit]
  );
  const availableVocabularyIds = useMemo(
    () =>
      new Set(availableUnits.flatMap((unit) => [unit.id, ...unit.vocabularyIds])),
    [availableUnits]
  );

  const scopedQuizzes = useMemo(
    () =>
      progress.learningMode === "free"
        ? quizzes
        : quizzes.filter((question) =>
            question.unitId ? availableUnitIds.has(question.unitId) : false
          ),
    [availableUnitIds, progress.learningMode]
  );
  const filteredQuizzes = useMemo(
    () =>
      scopedQuizzes.filter(
        (question) => quizType === "all" || question.type === quizType
      ),
    [quizType, scopedQuizzes]
  );
  const currentQuestion = filteredQuizzes[questionIndex] ?? filteredQuizzes[0];

  const vocabularyProgressMap = useMemo(
    () => toVocabularyProgressMap(progress),
    [progress]
  );
  const stageScopedVocabulary = useMemo(() => {
    if (stageFilter === "all") {
      return allVocabulary;
    }

    if (stageFilter === "current") {
      return allVocabulary.filter(
        (item) =>
          item.unitId === currentUnit?.id || currentUnitVocabularyIds.has(item.id)
      );
    }

    if (stageFilter === "unlocked") {
      return allVocabulary.filter(
        (item) =>
          (item.unitId ? availableUnitIds.has(item.unitId) : false) ||
          availableVocabularyIds.has(item.id)
      );
    }

    return allVocabulary.filter((item) => item.level === stageFilter);
  }, [
    availableUnitIds,
    availableVocabularyIds,
    currentUnit?.id,
    currentUnitVocabularyIds,
    stageFilter
  ]);

  const filteredVocabulary = useMemo(
    () =>
      filterVocabulary(stageScopedVocabulary, vocabularyProgressMap, {
        searchTerm,
        statusFilter,
        partOfSpeechFilter
      }),
    [
      partOfSpeechFilter,
      searchTerm,
      stageScopedVocabulary,
      statusFilter,
      vocabularyProgressMap
    ]
  );
  const partOfSpeechOptions = useMemo<FilterOption<PartOfSpeechFilter>[]>(
    () =>
      getPartOfSpeechOptions(stageScopedVocabulary).map((option) => ({
        value: option,
        label: option === "all" ? "全部词性" : option
      })),
    [stageScopedVocabulary]
  );
  const flashcardPool = useMemo(
    () =>
      stageScopedVocabulary.filter(
        (item) => !progress.masteredVocabularyIds.includes(item.id)
      ),
    [progress.masteredVocabularyIds, stageScopedVocabulary]
  );
  const flashcard = flashcardPool[flashIndex] ?? flashcardPool[0] ?? null;

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
    setQuestionIndex((index) => getNextQuestionIndex(index, filteredQuizzes.length));
  };

  const advanceFlashcard = (mastered: boolean) => {
    if (!flashcard) {
      return;
    }
    setVocabularyMastered(flashcard.id, mastered);
    setShowFlashAnswer(false);
    setFlashIndex((index) =>
      flashcardPool.length <= 1 ? 0 : (index + 1) % flashcardPool.length
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2 pt-1">
        <p className="text-sm font-semibold text-matcha-700">Practice</p>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
          练习
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          默认只练当前或已解锁内容，避免 0 基础阶段过早遇到 N3。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">小测验</h2>
        <FilterTabs
          label="题型筛选"
          options={quizTypeOptions}
          value={quizType}
          onChange={(value) => {
            setQuizType(value);
            setQuestionIndex(0);
            setSelectedAnswer(null);
            setResult(null);
          }}
        />
        {currentQuestion ? (
          <QuizCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            result={result}
            onSelect={handleSelectAnswer}
            onNext={handleNextQuestion}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-5 text-center shadow-soft">
            <p className="font-semibold text-slate-900">当前范围暂无练习题</p>
            <p className="mt-2 text-sm text-slate-500">
              可以在 src/data/quizzes.ts 中补充当前 unitId 的题目。
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">闪卡复习</h2>
        {flashcard ? (
          <div className="rounded-lg bg-white p-5 text-center shadow-soft">
            <p className="text-sm font-semibold text-matcha-700">
              当前范围未掌握词汇 {flashcardPool.length} 个
            </p>
            <h3 className="mt-5 text-4xl font-semibold text-slate-950">
              {flashcard.word}
            </h3>
            <p className="mt-2 text-lg font-medium text-matcha-700">
              {flashcard.kana}
            </p>
            {showFlashAnswer ? (
              <div className="mt-5 rounded-lg bg-slate-50 p-4 text-left">
                <p className="font-semibold text-slate-950">
                  {flashcard.meaning}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {flashcard.example}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {flashcard.exampleMeaning}
                </p>
              </div>
            ) : null}
            {showFlashAnswer ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => advanceFlashcard(false)}
                  className="min-h-12 rounded-lg bg-slate-100 font-semibold text-slate-700"
                >
                  不认识
                </button>
                <button
                  type="button"
                  onClick={() => advanceFlashcard(true)}
                  className="min-h-12 rounded-lg bg-matcha-600 font-semibold text-white"
                >
                  认识
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowFlashAnswer(true)}
                className="mt-5 min-h-12 w-full rounded-lg bg-matcha-600 font-semibold text-white"
              >
                显示答案
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center shadow-soft">
            <p className="font-semibold text-slate-900">暂时没有待复习词汇</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">
          词汇筛选
        </h2>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <FilterTabs
          label="学习阶段"
          options={vocabularyStageOptions}
          value={stageFilter}
          onChange={setStageFilter}
        />
        <FilterTabs
          label="词汇状态"
          options={vocabularyStatusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <FilterTabs
          label="词性"
          options={partOfSpeechOptions}
          value={partOfSpeechFilter}
          onChange={setPartOfSpeechFilter}
        />
        <div className="space-y-3">
          {filteredVocabulary.slice(0, 20).map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              progress={getVocabularyProgressEntry(progress, item.id)}
              onToggleFavorite={toggleVocabularyFavorite}
              onToggleMastered={toggleVocabularyMastered}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
