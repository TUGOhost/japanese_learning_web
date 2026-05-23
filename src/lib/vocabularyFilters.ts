import type {
  VocabularyFilterOptions,
  VocabularyItem,
  VocabularyProgressMap
} from "../types/vocabulary";
import { getProgressEntry } from "./progressStorage";

const normalizeSearchText = (value: string) => value.trim().toLocaleLowerCase();

export const filterVocabulary = (
  vocabulary: VocabularyItem[],
  progress: VocabularyProgressMap,
  options: VocabularyFilterOptions
): VocabularyItem[] => {
  const searchTerm = normalizeSearchText(options.searchTerm);

  return vocabulary.filter((item) => {
    const itemProgress = getProgressEntry(progress, item.id);
    const matchesSearch =
      searchTerm.length === 0 ||
      normalizeSearchText(item.word).includes(searchTerm) ||
      normalizeSearchText(item.kana).includes(searchTerm) ||
      normalizeSearchText(item.meaning).includes(searchTerm);

    const matchesStatus =
      options.statusFilter === "all" ||
      (options.statusFilter === "unmastered" && !itemProgress.mastered) ||
      (options.statusFilter === "mastered" && itemProgress.mastered) ||
      (options.statusFilter === "favorite" && itemProgress.favorite);

    const matchesPartOfSpeech =
      options.partOfSpeechFilter === "all" ||
      item.partOfSpeech === options.partOfSpeechFilter;

    return matchesSearch && matchesStatus && matchesPartOfSpeech;
  });
};

export const getPartOfSpeechOptions = (
  vocabulary: VocabularyItem[]
): string[] => [
  "all",
  ...Array.from(new Set(vocabulary.map((item) => item.partOfSpeech))).sort(
    (a, b) => a.localeCompare(b, "zh-CN")
  )
];
