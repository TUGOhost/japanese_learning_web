import type {
  ContentLevel,
  ExpressionItem,
  GrammarExample,
  GrammarItem,
  ImportedSourceSpan,
  ImportStatus,
  LearningSentence,
  PublishStatus,
  SentencePattern,
  TextbookBook
} from "../src/types/learning";
import type { VocabularyItem } from "../src/types/vocabulary";
import type { JapaneseNoteContentKind } from "../content/source-manifest/japanese-note";

export type LessonSegment = {
  id: string;
  sourceFileId: string;
  sourceFilePath: string;
  contentKind: JapaneseNoteContentKind;
  textbookBook?: "初级上" | "初级下";
  textbookLesson?: number;
  unitId?: string;
  headingText: string;
  headingLevel: number;
  lineStart: number;
  lineEnd: number;
  rawMarkdown: string;
  hash: string;
};

export type ImportedItemBase = {
  id: string;
  type:
    | "vocabulary"
    | "grammar"
    | "sentence"
    | "expression"
    | "sentencePattern"
    | "quiz"
    | "review";
  textbookBook?: TextbookBook;
  textbookLesson?: number;
  unitId?: string;
  level: ContentLevel;
  source: ImportedSourceSpan;
  publishStatus: PublishStatus;
  importStatus: ImportStatus;
  hash: string;
  importHash?: string;
  sourceText?: string;
  lowConfidenceReasons?: string[];
};

export type ImportedVocabularyItem = ImportedItemBase &
  Omit<
    VocabularyItem,
    | "id"
    | "level"
    | "source"
    | "textbookBook"
    | "textbookLesson"
    | "unitId"
    | "publishStatus"
    | "importStatus"
  > & {
    type: "vocabulary";
  };

export type ImportedGrammarItem = ImportedItemBase &
  Omit<
    GrammarItem,
    | "id"
    | "level"
    | "source"
    | "textbookBook"
    | "textbookLesson"
    | "unitId"
    | "publishStatus"
    | "importStatus"
  > & {
    type: "grammar";
    examples: GrammarExample[];
  };

export type ImportedSentenceItem = ImportedItemBase &
  Omit<
    LearningSentence,
    | "id"
    | "level"
    | "source"
    | "textbookBook"
    | "textbookLesson"
    | "unitId"
    | "publishStatus"
    | "importStatus"
  > & {
    type: "sentence";
    category?: "sentence" | "phrase";
  };

export type ImportedExpressionItem = ImportedItemBase &
  Omit<
    ExpressionItem,
    | "id"
    | "level"
    | "source"
    | "textbookBook"
    | "textbookLesson"
    | "unitId"
    | "publishStatus"
    | "importStatus"
  > & {
    type: "expression";
  };

export type ImportedSentencePatternItem = ImportedItemBase &
  Omit<
    SentencePattern,
    | "id"
    | "level"
    | "source"
    | "textbookBook"
    | "textbookLesson"
    | "unitId"
    | "publishStatus"
    | "importStatus"
  > & {
    type: "sentencePattern";
  };

export type ImportedReviewItem = ImportedItemBase & {
  type: "review";
  title: string;
  reason: string;
};

export type ImportedLearningItem =
  | ImportedVocabularyItem
  | ImportedGrammarItem
  | ImportedSentenceItem
  | ImportedExpressionItem
  | ImportedSentencePatternItem
  | ImportedReviewItem;

export type LessonRange = {
  start: number;
  end: number;
};
