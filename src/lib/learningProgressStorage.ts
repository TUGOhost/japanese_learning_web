import type { LearningProgress } from "../types/learning";
import { normalizeProgress as normalizeVocabularyProgress } from "./progressStorage";

export const LEARNING_PROGRESS_KEY = "japanese-learning-progress-v2";
export const N3_VOCABULARY_PROGRESS_KEY = "n3-vocabulary-progress-v1";

const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const uniqueStrings = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string"))
  );
};

const safeCount = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(Math.round(value), 0);
};

const safeLearningMode = (value: unknown): LearningProgress["learningMode"] =>
  value === "free" ? "free" : "textbook";

const stageIdFromLegacyStage = (value: unknown): string | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const stage = Math.round(value);

  if (stage <= 1) {
    return "stage-pre";
  }

  if (stage <= 3) {
    return "stage-shokyu-jou";
  }

  if (stage === 4) {
    return "stage-shokyu-ge";
  }

  if (stage === 5) {
    return "stage-review-n5-n4";
  }

  return "stage-n3";
};

export const createDefaultLearningProgress = (): LearningProgress => ({
  learningMode: "textbook",
  completedUnitIds: [],
  completedLessonIds: [],
  favoriteVocabularyIds: [],
  masteredVocabularyIds: [],
  favoriteGrammarIds: [],
  masteredGrammarIds: [],
  completedQuizIds: [],
  quizStats: {
    totalAnswered: 0,
    correctAnswered: 0
  },
  currentUnitId: undefined,
  currentStageId: undefined,
  lastStudiedUnitId: undefined
});

const loadOldVocabularyProgress = (): Pick<
  LearningProgress,
  "favoriteVocabularyIds" | "masteredVocabularyIds"
> => {
  if (!hasStorage()) {
    return {
      favoriteVocabularyIds: [],
      masteredVocabularyIds: []
    };
  }

  try {
    const rawValue = window.localStorage.getItem(N3_VOCABULARY_PROGRESS_KEY);
    if (!rawValue) {
      return {
        favoriteVocabularyIds: [],
        masteredVocabularyIds: []
      };
    }

    const oldProgress = normalizeVocabularyProgress(JSON.parse(rawValue));
    return {
      favoriteVocabularyIds: Object.entries(oldProgress)
        .filter(([, entry]) => entry.favorite)
        .map(([id]) => id),
      masteredVocabularyIds: Object.entries(oldProgress)
        .filter(([, entry]) => entry.mastered)
        .map(([id]) => id)
    };
  } catch {
    return {
      favoriteVocabularyIds: [],
      masteredVocabularyIds: []
    };
  }
};

export const normalizeLearningProgress = (
  value: unknown,
  fallbackVocabulary = loadOldVocabularyProgress()
): LearningProgress => {
  const defaults = createDefaultLearningProgress();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...defaults,
      ...fallbackVocabulary
    };
  }

  const candidate = value as Partial<LearningProgress>;
  const legacyCandidate = value as Partial<{
    completedPracticeIds: unknown;
    quiz: { completedCount?: unknown; correctCount?: unknown };
    recentLessonId: unknown;
    currentStage: unknown;
  }>;
  const quizStats = candidate.quizStats;
  const legacyQuiz = legacyCandidate.quiz;
  const completedQuizIds = uniqueStrings(candidate.completedQuizIds);
  const legacyCompletedQuizIds = uniqueStrings(legacyCandidate.completedPracticeIds);

  return {
    learningMode: safeLearningMode(candidate.learningMode),
    completedUnitIds: uniqueStrings(candidate.completedUnitIds),
    completedLessonIds: uniqueStrings(candidate.completedLessonIds),
    favoriteVocabularyIds:
      uniqueStrings(candidate.favoriteVocabularyIds).length > 0
        ? uniqueStrings(candidate.favoriteVocabularyIds)
        : fallbackVocabulary.favoriteVocabularyIds,
    masteredVocabularyIds:
      uniqueStrings(candidate.masteredVocabularyIds).length > 0
        ? uniqueStrings(candidate.masteredVocabularyIds)
        : fallbackVocabulary.masteredVocabularyIds,
    favoriteGrammarIds: uniqueStrings(candidate.favoriteGrammarIds),
    masteredGrammarIds: uniqueStrings(candidate.masteredGrammarIds),
    completedQuizIds:
      completedQuizIds.length > 0 ? completedQuizIds : legacyCompletedQuizIds,
    quizStats:
      quizStats && typeof quizStats === "object"
        ? {
            totalAnswered: safeCount(quizStats.totalAnswered),
            correctAnswered: safeCount(quizStats.correctAnswered)
          }
        : legacyQuiz && typeof legacyQuiz === "object"
          ? {
              totalAnswered: safeCount(legacyQuiz.completedCount),
              correctAnswered: safeCount(legacyQuiz.correctCount)
            }
          : defaults.quizStats,
    currentUnitId:
      typeof candidate.currentUnitId === "string"
        ? candidate.currentUnitId
        : undefined,
    currentStageId:
      typeof candidate.currentStageId === "string"
        ? candidate.currentStageId
        : stageIdFromLegacyStage(legacyCandidate.currentStage),
    lastStudiedUnitId:
      typeof candidate.lastStudiedUnitId === "string"
        ? candidate.lastStudiedUnitId
        : typeof legacyCandidate.recentLessonId === "string"
          ? legacyCandidate.recentLessonId
          : undefined
  };
};

export const loadLearningProgress = (): LearningProgress => {
  if (!hasStorage()) {
    return createDefaultLearningProgress();
  }

  try {
    const rawValue = window.localStorage.getItem(LEARNING_PROGRESS_KEY);
    if (!rawValue) {
      return normalizeLearningProgress(undefined);
    }

    return normalizeLearningProgress(JSON.parse(rawValue));
  } catch {
    return normalizeLearningProgress(undefined);
  }
};

export const saveLearningProgress = (progress: LearningProgress): void => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(
    LEARNING_PROGRESS_KEY,
    JSON.stringify(normalizeLearningProgress(progress))
  );
};

export const clearLearningProgress = (): void => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.removeItem(LEARNING_PROGRESS_KEY);
  window.localStorage.removeItem(N3_VOCABULARY_PROGRESS_KEY);
};
