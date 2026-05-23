import type { VocabularyProgressEntry, VocabularyProgressMap } from "./vocabulary";

export type ContentLevel = "预备" | "N5" | "N4" | "N3" | "N2" | "N1";

export type CurriculumStageLevel =
  | "预备"
  | "初级上"
  | "初级下"
  | "中级上"
  | "中级下"
  | "高级上"
  | "高级下"
  | "N5"
  | "N4"
  | "N3"
  | "N2"
  | "N1";

export type TextbookBook =
  | "初级上"
  | "初级下"
  | "中级上"
  | "中级下"
  | "高级上"
  | "高级下";

export type ContentSource =
  | "原创"
  | "标准日本语第二版初级"
  | "标准日本语第二版中级"
  | "标准日本语第二版高级"
  | "自定义";

export type PublishStatus =
  | "private_only"
  | "needs_rewrite"
  | "safe_to_publish"
  | "do_not_publish";

export type ImportStatus = "imported" | "needs_review" | "skipped";

export type ImportedSourceSpan = {
  sourceRepo: "fukangwei/Japanese_Note";
  sourceUrl: "https://github.com/fukangwei/Japanese_Note";
  filePath: string;
  sourceFileId: string;
  headingPath: string[];
  lineStart: number;
  lineEnd: number;
  hash: string;
  rawText?: string;
};

export type SourceReference = ContentSource | ImportedSourceSpan;

export type LearningMode = "textbook" | "free";

export type KanaType = "hiragana" | "katakana";

export type KanaItem = {
  id: string;
  type: KanaType;
  kana: string;
  romaji: string;
  row: string;
  column: string;
  pronunciationTip: string;
  chineseHint: string;
  exampleWord: string;
  exampleReading: string;
  exampleMeaning: string;
};

export type GrammarExample = {
  japanese: string;
  reading?: string;
  chinese: string;
};

export type GrammarItem = {
  id: string;
  title: string;
  level: ContentLevel;
  source?: SourceReference;
  contentSource?: ContentSource;
  textbookBook?: TextbookBook;
  textbookLesson?: number;
  unitId?: string;
  isCore?: boolean;
  publishStatus?: PublishStatus;
  importStatus?: ImportStatus;
  importHash?: string;
  sourceText?: string;
  category: string;
  structure: string;
  meaning: string;
  explanation: string;
  examples: GrammarExample[];
  tipsForChineseSpeakers?: string;
  commonMistakes?: string[];
};

export type SentencePattern = {
  id: string;
  pattern: string;
  meaning: string;
  explanation: string;
  level: ContentLevel;
  source?: SourceReference;
  contentSource?: ContentSource;
  textbookBook?: TextbookBook;
  textbookLesson?: number;
  unitId?: string;
  isCore?: boolean;
  publishStatus?: PublishStatus;
  importStatus?: ImportStatus;
  importHash?: string;
  sourceText?: string;
  examples: GrammarExample[];
};

export type LearningSentence = {
  id: string;
  japanese: string;
  reading?: string;
  chinese: string;
  level: ContentLevel;
  unitId?: string;
  textbookBook?: TextbookBook;
  textbookLesson?: number;
  tags?: string[];
  grammarIds?: string[];
  vocabularyIds?: string[];
  note?: string;
  source?: SourceReference;
  contentSource?: ContentSource;
  publishStatus?: PublishStatus;
  importStatus?: ImportStatus;
  importHash?: string;
  sourceText?: string;
};

export type ExpressionItem = {
  id: string;
  expression: string;
  reading?: string;
  meaning: string;
  level: ContentLevel;
  unitId?: string;
  textbookBook?: TextbookBook;
  textbookLesson?: number;
  category?: "寒暄" | "固定表达" | "短语" | "课堂用语" | "其他";
  source?: SourceReference;
  contentSource?: ContentSource;
  publishStatus?: PublishStatus;
  importStatus?: ImportStatus;
  importHash?: string;
  sourceText?: string;
};

export type ConjugationItem = {
  id: string;
  verbDictionaryForm: string;
  reading: string;
  meaning: string;
  verbGroup: "一类动词" | "二类动词" | "三类动词";
  forms: {
    masu: string;
    masen: string;
    mashita: string;
    masenDeshita: string;
    te?: string;
    nai?: string;
    ta?: string;
  };
  examples: {
    form: string;
    japanese: string;
    chinese: string;
  }[];
};

export type QuizQuestion = {
  id: string;
  type: "kana" | "vocabulary" | "grammar" | "sentence" | "conjugation";
  level: ContentLevel;
  source?: SourceReference;
  contentSource?: ContentSource;
  publishStatus?: PublishStatus;
  importStatus?: ImportStatus;
  importHash?: string;
  unitId?: string;
  textbookLesson?: number;
  difficulty: "简单" | "普通" | "较难";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  relatedLessonId?: string;
};

export type Lesson = {
  id: string;
  title: string;
  category: string;
  level: ContentLevel;
  order?: number;
  unitId?: string;
  textbookBook?: TextbookBook;
  textbookLesson?: number;
  stage: number;
  description: string;
  estimatedMinutes: number;
  objectives: string[];
  explanation: string;
  vocabularyIds?: string[];
  grammarIds?: string[];
  sentencePatternIds?: string[];
  conjugationIds?: string[];
  quizIds?: string[];
};

export type LearningProgress = {
  learningMode: LearningMode;
  completedUnitIds: string[];
  completedLessonIds: string[];
  favoriteVocabularyIds: string[];
  masteredVocabularyIds: string[];
  favoriteGrammarIds: string[];
  masteredGrammarIds: string[];
  completedQuizIds: string[];
  quizStats: {
    totalAnswered: number;
    correctAnswered: number;
  };
  currentUnitId?: string;
  currentStageId?: string;
  lastStudiedUnitId?: string;
};

export type LearningStats = {
  completedLessons: number;
  totalLessons: number;
  masteredVocabulary: number;
  totalVocabulary: number;
  favoriteCount: number;
  completedPractice: number;
  quizCorrectCount: number;
  accuracy: number;
  overallPercent: number;
  currentStage: number;
  currentStageTitle: string;
  currentUnitTitle: string;
};

export type LearningProgressActions = {
  markLessonComplete: (lessonId: string) => void;
  setRecentLesson: (lessonId: string) => void;
  toggleVocabularyFavorite: (id: string) => void;
  toggleVocabularyMastered: (id: string) => void;
  setVocabularyMastered: (id: string, mastered: boolean) => void;
  toggleGrammarFavorite: (id: string) => void;
  toggleGrammarMastered: (id: string) => void;
  recordQuizAnswer: (questionId: string, correct: boolean) => void;
  setCurrentStage: (stage: number) => void;
  setLearningMode: (mode: LearningMode) => void;
  completeUnit: (unitId: string) => void;
  setCurrentUnit: (unitId: string) => void;
  resetProgress: () => void;
};

export const toVocabularyProgressMap = (
  progress: LearningProgress
): VocabularyProgressMap => {
  const ids = new Set([
    ...progress.favoriteVocabularyIds,
    ...progress.masteredVocabularyIds
  ]);

  return Array.from(ids).reduce<VocabularyProgressMap>((map, id) => {
    map[id] = {
      favorite: progress.favoriteVocabularyIds.includes(id),
      mastered: progress.masteredVocabularyIds.includes(id)
    };
    return map;
  }, {});
};

export const getVocabularyProgressEntry = (
  progress: LearningProgress,
  id: string
): VocabularyProgressEntry => ({
  favorite: progress.favoriteVocabularyIds.includes(id),
  mastered: progress.masteredVocabularyIds.includes(id)
});
