import { useMemo, useState } from "react";

import { allVocabulary } from "../data/vocabulary";
import { quizzes } from "../data/quizzes";
import {
  calculateQuizAccuracy
} from "../lib/quizEngine";
import {
  clearLearningProgress,
  createDefaultLearningProgress,
  loadLearningProgress,
  saveLearningProgress
} from "../lib/learningProgressStorage";
import type {
  LearningMode,
  LearningProgress,
  LearningProgressActions,
  LearningStats
} from "../types/learning";
import {
  getNextRecommendedUnit,
  getOrderedCurriculum,
  getOrderedUnits,
  getProgressSummary,
  getStageForUnit,
  getUnitById
} from "../utils/curriculum";

const toggleId = (ids: string[], id: string): string[] =>
  ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];

const setIdIncluded = (ids: string[], id: string, included: boolean): string[] => {
  if (included) {
    return ids.includes(id) ? ids : [...ids, id];
  }

  return ids.filter((item) => item !== id);
};

export const useLearningProgress = () => {
  const [progress, setProgress] = useState<LearningProgress>(() =>
    loadLearningProgress()
  );

  const updateProgress = (
    updater: (current: LearningProgress) => LearningProgress
  ) => {
    setProgress((current) => {
      const nextProgress = updater(current);
      saveLearningProgress(nextProgress);
      return nextProgress;
    });
  };

  const actions: LearningProgressActions = {
    markLessonComplete: (lessonId) => {
      updateProgress((current) => ({
        ...current,
        completedLessonIds: setIdIncluded(
          current.completedLessonIds,
          lessonId,
          true
        ),
        lastStudiedUnitId: lessonId
      }));
    },
    setRecentLesson: (lessonId) => {
      updateProgress((current) =>
        current.lastStudiedUnitId === lessonId
          ? current
          : {
              ...current,
              lastStudiedUnitId: lessonId
            }
      );
    },
    toggleVocabularyFavorite: (id) => {
      updateProgress((current) => ({
        ...current,
        favoriteVocabularyIds: toggleId(current.favoriteVocabularyIds, id)
      }));
    },
    toggleVocabularyMastered: (id) => {
      updateProgress((current) => ({
        ...current,
        masteredVocabularyIds: toggleId(current.masteredVocabularyIds, id)
      }));
    },
    setVocabularyMastered: (id, mastered) => {
      updateProgress((current) => ({
        ...current,
        masteredVocabularyIds: setIdIncluded(
          current.masteredVocabularyIds,
          id,
          mastered
        )
      }));
    },
    toggleGrammarFavorite: (id) => {
      updateProgress((current) => ({
        ...current,
        favoriteGrammarIds: toggleId(current.favoriteGrammarIds, id)
      }));
    },
    toggleGrammarMastered: (id) => {
      updateProgress((current) => ({
        ...current,
        masteredGrammarIds: toggleId(current.masteredGrammarIds, id)
      }));
    },
    recordQuizAnswer: (questionId, correct) => {
      updateProgress((current) => ({
        ...current,
        completedQuizIds: setIdIncluded(
          current.completedQuizIds,
          questionId,
          true
        ),
        quizStats: {
          totalAnswered: current.quizStats.totalAnswered + 1,
          correctAnswered: current.quizStats.correctAnswered + (correct ? 1 : 0)
        }
      }));
    },
    setCurrentStage: (stage) => {
      const orderedStage = getOrderedCurriculum().find(
        (item) => item.order === Math.round(stage)
      );

      updateProgress((current) => ({
        ...current,
        currentStageId: orderedStage?.id ?? current.currentStageId
      }));
    },
    setLearningMode: (mode: LearningMode) => {
      updateProgress((current) => ({
        ...current,
        learningMode: mode
      }));
    },
    completeUnit: (unitId) => {
      updateProgress((current) => {
        const unit = getUnitById(unitId);
        const completedUnitIds = setIdIncluded(
          current.completedUnitIds,
          unitId,
          true
        );
        const completedLessonIds = unit
          ? Array.from(new Set([...current.completedLessonIds, ...unit.lessonIds]))
          : current.completedLessonIds;
        const nextProgress = {
          ...current,
          completedUnitIds,
          completedLessonIds,
          lastStudiedUnitId: unitId
        };
        const nextUnit = getNextRecommendedUnit(nextProgress);
        const nextStage = nextUnit ? getStageForUnit(nextUnit.id) : undefined;

        return {
          ...nextProgress,
          currentUnitId: nextUnit?.id,
          currentStageId: nextStage?.id
        };
      });
    },
    setCurrentUnit: (unitId) => {
      updateProgress((current) => {
        if (
          current.currentUnitId === unitId &&
          current.lastStudiedUnitId === unitId
        ) {
          return current;
        }

        const stage = getStageForUnit(unitId);

        return {
          ...current,
          currentUnitId: unitId,
          currentStageId: stage?.id ?? current.currentStageId,
          lastStudiedUnitId: unitId
        };
      });
    },
    resetProgress: () => {
      clearLearningProgress();
      setProgress(createDefaultLearningProgress());
    }
  };

  const stats = useMemo<LearningStats>(() => {
    const orderedUnits = getOrderedUnits();
    const summary = getProgressSummary(progress);
    const vocabularyPercent =
      allVocabulary.length === 0
        ? 0
        : progress.masteredVocabularyIds.length / allVocabulary.length;
    const quizPercent =
      quizzes.length === 0
        ? 0
        : Math.min(progress.completedQuizIds.length / quizzes.length, 1);
    const currentStage = summary.currentStageId
      ? getOrderedCurriculum().find((stage) => stage.id === summary.currentStageId)
      : undefined;

    return {
      completedLessons: progress.completedUnitIds.length,
      totalLessons: orderedUnits.length,
      masteredVocabulary: progress.masteredVocabularyIds.length,
      totalVocabulary: allVocabulary.length,
      favoriteCount:
        progress.favoriteVocabularyIds.length + progress.favoriteGrammarIds.length,
      completedPractice: progress.completedQuizIds.length,
      quizCorrectCount: progress.quizStats.correctAnswered,
      accuracy: calculateQuizAccuracy(
        progress.quizStats.correctAnswered,
        progress.quizStats.totalAnswered
      ),
      overallPercent: Math.round(
        (summary.overallUnitPercent + vocabularyPercent * 100 + quizPercent * 100) / 3
      ),
      currentStage: currentStage?.order ?? 0,
      currentStageTitle: summary.currentStageTitle,
      currentUnitTitle: summary.currentUnitTitle
    };
  }, [progress]);

  return {
    progress,
    stats,
    getProgressSummary: () => getProgressSummary(progress),
    ...actions
  };
};
