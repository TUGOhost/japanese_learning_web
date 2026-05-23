import type {
  ContentLevel,
  ContentSource,
  ImportStatus,
  PublishStatus,
  SourceReference,
  TextbookBook
} from "./learning";

export type VocabularyItem = {
  id: string;
  word: string;
  kana: string;
  display?: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleMeaning: string;
  level: ContentLevel;
  source?: SourceReference;
  contentSource?: ContentSource;
  textbookBook?: TextbookBook;
  textbookLesson?: number;
  unitId?: string;
  isCore?: boolean;
  tags?: string[];
  publishStatus?: PublishStatus;
  importStatus?: ImportStatus;
  importHash?: string;
  sourceText?: string;
};

export type VocabularyProgressEntry = {
  mastered: boolean;
  favorite: boolean;
};

export type VocabularyProgressMap = Record<string, VocabularyProgressEntry>;

export type VocabularyStatusFilter =
  | "all"
  | "unmastered"
  | "mastered"
  | "favorite";

export type PartOfSpeechFilter = "all" | string;

export type VocabularyFilterOptions = {
  searchTerm: string;
  statusFilter: VocabularyStatusFilter;
  partOfSpeechFilter: PartOfSpeechFilter;
};

export type FlashcardScope = "all" | "unmastered" | "favorite";

export type VocabularyStats = {
  totalCount: number;
  masteredCount: number;
  unmasteredCount: number;
  favoriteCount: number;
  masteredPercent: number;
};
