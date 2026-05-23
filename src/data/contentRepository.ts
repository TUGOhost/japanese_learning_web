import generatedExpressionsJson from "../../content/generated/expressions.json";
import generatedGrammarJson from "../../content/generated/grammar.json";
import generatedQuizzesJson from "../../content/generated/quizzes.json";
import generatedSentencesJson from "../../content/generated/sentences.json";
import generatedVocabularyJson from "../../content/generated/vocabulary.json";
import { filterVisibleContent } from "../lib/contentVisibility";
import type { VisibilityControlledContent } from "../lib/contentVisibility";
import type {
  ExpressionItem,
  GrammarItem,
  LearningSentence,
  QuizQuestion,
  SentencePattern
} from "../types/learning";
import type { VocabularyItem } from "../types/vocabulary";

const toVisibleGeneratedContent = <T extends { id: string } & VisibilityControlledContent>(
  items: T[]
): T[] =>
  filterVisibleContent(items);

const grammarToSentencePattern = (
  item: GrammarItem,
  index: number
): SentencePattern => ({
  id: `pattern-json-${item.id || index + 1}`,
  pattern: item.structure,
  meaning: item.meaning,
  explanation: item.explanation,
  level: item.level,
  source: item.source,
  contentSource: item.contentSource,
  textbookBook: item.textbookBook,
  textbookLesson: item.textbookLesson,
  unitId: item.unitId,
  isCore: item.isCore,
  publishStatus: item.publishStatus,
  importStatus: item.importStatus,
  importHash: item.importHash,
  sourceText: item.sourceText,
  examples: item.examples
});

export const generatedVocabularyFromJson: VocabularyItem[] =
  toVisibleGeneratedContent(generatedVocabularyJson as VocabularyItem[]);

export const generatedGrammarFromJson: GrammarItem[] =
  toVisibleGeneratedContent(generatedGrammarJson as GrammarItem[]);

export const generatedSentencesFromJson: LearningSentence[] =
  toVisibleGeneratedContent(generatedSentencesJson as LearningSentence[]);

export const generatedExpressionsFromJson: ExpressionItem[] =
  toVisibleGeneratedContent(generatedExpressionsJson as ExpressionItem[]);

export const generatedQuizzesFromJson: QuizQuestion[] =
  toVisibleGeneratedContent(generatedQuizzesJson as QuizQuestion[]);

export const generatedSentencePatternsFromJson: SentencePattern[] =
  generatedGrammarFromJson
    .filter((item) => item.isCore !== false && item.examples.length > 0)
    .map(grammarToSentencePattern);
