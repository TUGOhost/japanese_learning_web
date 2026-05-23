import { useMemo, useState } from "react";

import type {
  VocabularyItem,
  VocabularyProgressMap,
  VocabularyStats
} from "../types/vocabulary";
import {
  getProgressEntry,
  loadVocabularyProgress,
  saveVocabularyProgress
} from "../lib/progressStorage";

export const useVocabularyProgress = (vocabulary: VocabularyItem[]) => {
  const [progress, setProgress] = useState<VocabularyProgressMap>(() =>
    loadVocabularyProgress()
  );

  const updateProgress = (
    updater: (current: VocabularyProgressMap) => VocabularyProgressMap
  ) => {
    setProgress((current) => {
      const nextProgress = updater(current);
      saveVocabularyProgress(nextProgress);
      return nextProgress;
    });
  };

  const toggleFavorite = (id: string) => {
    updateProgress((current) => {
      const entry = getProgressEntry(current, id);
      return {
        ...current,
        [id]: {
          ...entry,
          favorite: !entry.favorite
        }
      };
    });
  };

  const toggleMastered = (id: string) => {
    updateProgress((current) => {
      const entry = getProgressEntry(current, id);
      return {
        ...current,
        [id]: {
          ...entry,
          mastered: !entry.mastered
        }
      };
    });
  };

  const setMastered = (id: string, mastered: boolean) => {
    updateProgress((current) => {
      const entry = getProgressEntry(current, id);
      return {
        ...current,
        [id]: {
          ...entry,
          mastered
        }
      };
    });
  };

  const stats = useMemo<VocabularyStats>(() => {
    const vocabularyIds = new Set(vocabulary.map((item) => item.id));
    const totalVocabularyCount = vocabulary.length;
    const entries = Object.entries(progress)
      .filter(([id]) => vocabularyIds.has(id))
      .map(([, entry]) => entry);
    const masteredCount = entries.filter((entry) => entry.mastered).length;
    const favoriteCount = entries.filter((entry) => entry.favorite).length;

    return {
      totalCount: totalVocabularyCount,
      masteredCount,
      unmasteredCount: Math.max(totalVocabularyCount - masteredCount, 0),
      favoriteCount,
      masteredPercent:
        totalVocabularyCount === 0
          ? 0
          : Math.round((masteredCount / totalVocabularyCount) * 100)
    };
  }, [progress, vocabulary]);

  return {
    progress,
    stats,
    getProgress: (id: string) => getProgressEntry(progress, id),
    toggleFavorite,
    toggleMastered,
    setMastered
  };
};
