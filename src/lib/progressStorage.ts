import type {
  VocabularyProgressEntry,
  VocabularyProgressMap
} from "../types/vocabulary";

export const STORAGE_KEY = "n3-vocabulary-progress-v1";

const defaultProgressEntry: VocabularyProgressEntry = {
  mastered: false,
  favorite: false
};

const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const isProgressEntry = (value: unknown): value is VocabularyProgressEntry => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<VocabularyProgressEntry>;
  return (
    typeof candidate.mastered === "boolean" &&
    typeof candidate.favorite === "boolean"
  );
};

export const normalizeProgress = (value: unknown): VocabularyProgressMap => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<VocabularyProgressMap>(
    (normalized, [id, entry]) => {
      if (isProgressEntry(entry)) {
        normalized[id] = entry;
      }

      return normalized;
    },
    {}
  );
};

export const loadVocabularyProgress = (): VocabularyProgressMap => {
  if (!hasStorage()) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    return normalizeProgress(JSON.parse(rawValue));
  } catch {
    return {};
  }
};

export const saveVocabularyProgress = (
  progress: VocabularyProgressMap
): void => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(normalizeProgress(progress))
  );
};

export const getProgressEntry = (
  progress: VocabularyProgressMap,
  id: string
): VocabularyProgressEntry => progress[id] ?? defaultProgressEntry;
