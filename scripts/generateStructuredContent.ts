import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  generatedContentDir,
  japaneseNoteIntermediateDir,
  normalizeReportPath,
  readJsonFile,
  reportsDir,
  stableHash
} from "./lib/japaneseNoteUtils";
import type {
  ImportedExpressionItem,
  ImportedGrammarItem,
  ImportedLearningItem,
  ImportedSentencePatternItem,
  ImportedSentenceItem,
  ImportedVocabularyItem
} from "./types";

const importedRawPath = path.join(
  japaneseNoteIntermediateDir,
  "imported.raw.json"
);

const reviewQueuePath = path.join(reportsDir, "review-queue.md");

const toGeneratedItem = <T extends ImportedLearningItem>(item: T) => {
  const { type, hash, lowConfidenceReasons, ...rest } = item;

  return {
    ...rest,
    contentSource: "标准日本语第二版初级",
    importHash: item.importHash ?? hash
  };
};

const writeTsArray = ({
  fileName,
  importStatement,
  exportName,
  typeName,
  items
}: {
  fileName: string;
  importStatement: string;
  exportName: string;
  typeName: string;
  items: unknown[];
}) => {
  fs.mkdirSync(generatedContentDir, { recursive: true });
  const serializedItems =
    items.length === 0
      ? ""
      : items
          .map((item) =>
            `${JSON.stringify(item, null, 2)
              .split("\n")
              .map((line) => `  ${line}`)
              .join("\n")} as ${typeName}`
          )
          .join(",\n");
  const content = `${importStatement}

export const ${exportName}: ${typeName}[] = [
${serializedItems}
];
`;

  fs.writeFileSync(path.join(generatedContentDir, fileName), content);
};

const uniqueById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
};

const createGeneratedQuizzes = (
  vocabularyItems: ImportedVocabularyItem[]
) => {
  const byLesson = new Map<number, ImportedVocabularyItem[]>();

  for (const item of vocabularyItems) {
    if (item.textbookLesson === undefined || item.importStatus !== "imported") {
      continue;
    }

    byLesson.set(item.textbookLesson, [
      ...(byLesson.get(item.textbookLesson) ?? []),
      item
    ]);
  }

  return [...byLesson.entries()].flatMap(([lesson, items]) => {
    const firstItem = items[0];
    const meanings = [...new Set(items.map((item) => item.meaning).filter(Boolean))];

    if (!firstItem || meanings.length < 2) {
      return [];
    }

    const options = [
      firstItem.meaning,
      ...meanings.filter((meaning) => meaning !== firstItem.meaning).slice(0, 3)
    ];
    const hash = stableHash(`${firstItem.id}:quiz:${options.join("|")}`);

    return [
      {
        id: `quiz-sbj2-${String(lesson).padStart(2, "0")}-jnote-001`,
        type: "vocabulary",
        level: firstItem.level,
        unitId: firstItem.unitId,
        textbookLesson: firstItem.textbookLesson,
        difficulty: "简单",
        question: `${firstItem.display ?? firstItem.word} 的中文意思是？`,
        options,
        answer: firstItem.meaning,
        explanation: `${firstItem.display ?? firstItem.word}：${firstItem.meaning}`,
        source: firstItem.source,
        contentSource: "标准日本语第二版初级",
        publishStatus: firstItem.publishStatus,
        importStatus: "imported",
        importHash: hash
      }
    ];
  });
};

const expressionLikeStructures = new Set([
  "どうぞ",
  "おやすみなさい",
  "どうもありがとうございます",
  "はじめまして",
  "あのう",
  "隣",
  "階",
  "方",
  "おいくつ"
]);

const shouldCreateSentencePattern = (item: ImportedGrammarItem): boolean => {
  if (
    item.importStatus !== "imported" ||
    item.category === "补充说明" ||
    item.isCore === false ||
    !item.structure ||
    !item.unitId ||
    item.textbookLesson === undefined
  ) {
    return false;
  }

  if (expressionLikeStructures.has(item.structure.replace(/\s+/g, ""))) {
    return false;
  }

  return /名|動|形|は|が|を|に|で|の|も|です|ます|か|~|～|\[/.test(
    item.structure
  );
};

const isSentenceLikeExample = (japanese: string): boolean =>
  /[。？！?]$/.test(japanese) ||
  /(です|ます|ません|ました|でした|ください|でしょうか|あります|います|か)$/.test(
    japanese
  );

const getSentencePatternExamples = (item: ImportedGrammarItem) => {
  const sentenceExamples = item.examples.filter((example) =>
    isSentenceLikeExample(example.japanese)
  );
  const shouldPreferSentences = /(です|ます|ません|か|あります|います)/.test(
    item.structure
  );

  return shouldPreferSentences && sentenceExamples.length > 0
    ? sentenceExamples
    : item.examples;
};

export const createGeneratedSentencePatternsFromGrammar = (
  grammarItems: ImportedGrammarItem[]
) => {
  const countsByLesson = new Map<number, number>();

  return grammarItems
    .filter(shouldCreateSentencePattern)
    .map((item) => {
      const lesson = item.textbookLesson ?? 0;
      const nextCount = (countsByLesson.get(lesson) ?? 0) + 1;
      countsByLesson.set(lesson, nextCount);
      const hash = stableHash(`${item.id}:sentence-pattern`);
      const pattern: Omit<
        ImportedSentencePatternItem,
        "type" | "hash" | "lowConfidenceReasons"
      > = {
        id: `pattern-sbj2-${String(lesson).padStart(2, "0")}-${String(
          nextCount
        ).padStart(3, "0")}`,
        pattern: item.structure,
        meaning: item.meaning,
        explanation: item.explanation,
        level: item.level,
        source: item.source,
        contentSource: "标准日本语第二版初级",
        textbookBook: item.textbookBook,
        textbookLesson: item.textbookLesson,
        unitId: item.unitId,
        isCore: item.isCore,
        publishStatus: item.publishStatus,
        importStatus: item.importStatus,
        importHash: hash,
        sourceText: item.sourceText,
        examples: getSentencePatternExamples(item)
      };

      return pattern;
    });
};

const renderReviewQueue = (items: ImportedLearningItem[]) => {
  const reviewItems = items.filter(
    (item) =>
      item.importStatus !== "imported" ||
      item.publishStatus === "do_not_publish" ||
      (item.lowConfidenceReasons?.length ?? 0) > 0
  );
  const lines = [
    "# Japanese_Note Review Queue",
    "",
    `待复核条目：${reviewItems.length}`,
    ""
  ];

  for (const item of reviewItems) {
    lines.push(
      `## ${item.id}`,
      "",
      `- type: ${item.type}`,
      `- status: ${item.importStatus}`,
      `- publishStatus: ${item.publishStatus}`,
      `- lesson: ${item.textbookLesson ?? ""}`,
      `- file: ${item.source.filePath}:${item.source.lineStart}`,
      `- reasons: ${(item.lowConfidenceReasons ?? []).join(", ") || "needs review"}`,
      "",
      "```",
      item.sourceText ?? item.source.rawText ?? "",
      "```",
      ""
    );
  }

  return `${lines.join("\n")}\n`;
};

export const generateStructuredContent = () => {
  fs.mkdirSync(reportsDir, { recursive: true });
  const rawItems = readJsonFile<ImportedLearningItem[]>(importedRawPath, []);
  const importedItems = rawItems.filter(
    (item) => item.importStatus === "imported"
  );
  const vocabulary = uniqueById(
    importedItems
      .filter((item): item is ImportedVocabularyItem => item.type === "vocabulary")
      .map(toGeneratedItem)
  );
  const grammar = uniqueById(
    importedItems
      .filter((item): item is ImportedGrammarItem => item.type === "grammar")
      .map(toGeneratedItem)
  );
  const sentences = uniqueById(
    importedItems
      .filter((item): item is ImportedSentenceItem => item.type === "sentence")
      .map(toGeneratedItem)
  );
  const expressions = uniqueById(
    importedItems
      .filter((item): item is ImportedExpressionItem => item.type === "expression")
      .map(toGeneratedItem)
  );
  const sentencePatterns = uniqueById(
    createGeneratedSentencePatternsFromGrammar(
      importedItems.filter(
        (item): item is ImportedGrammarItem => item.type === "grammar"
      )
    )
  );
  const quizzes = createGeneratedQuizzes(
    importedItems.filter(
      (item): item is ImportedVocabularyItem => item.type === "vocabulary"
    )
  );

  writeTsArray({
    fileName: "vocabulary.generated.ts",
    importStatement: 'import type { VocabularyItem } from "../../src/types/vocabulary";',
    exportName: "generatedVocabulary",
    typeName: "VocabularyItem",
    items: vocabulary
  });
  writeTsArray({
    fileName: "grammar.generated.ts",
    importStatement: 'import type { GrammarItem } from "../../src/types/learning";',
    exportName: "generatedGrammar",
    typeName: "GrammarItem",
    items: grammar
  });
  writeTsArray({
    fileName: "sentences.generated.ts",
    importStatement: 'import type { LearningSentence } from "../../src/types/learning";',
    exportName: "generatedSentences",
    typeName: "LearningSentence",
    items: sentences
  });
  writeTsArray({
    fileName: "expressions.generated.ts",
    importStatement: 'import type { ExpressionItem } from "../../src/types/learning";',
    exportName: "generatedExpressions",
    typeName: "ExpressionItem",
    items: expressions
  });
  writeTsArray({
    fileName: "sentencePatterns.generated.ts",
    importStatement: 'import type { SentencePattern } from "../../src/types/learning";',
    exportName: "generatedSentencePatterns",
    typeName: "SentencePattern",
    items: sentencePatterns
  });
  writeTsArray({
    fileName: "quizzes.generated.ts",
    importStatement: 'import type { QuizQuestion } from "../../src/types/learning";',
    exportName: "generatedQuizzes",
    typeName: "QuizQuestion",
    items: quizzes
  });

  fs.writeFileSync(reviewQueuePath, renderReviewQueue(rawItems));

  console.log(
    [
      `Generated ${vocabulary.length} vocabulary items`,
      `${grammar.length} grammar items`,
      `${sentences.length} sentences`,
      `${expressions.length} expressions`,
      `${sentencePatterns.length} sentence patterns`,
      `${quizzes.length} quizzes`,
      `review queue: ${normalizeReportPath(reviewQueuePath)}`
    ].join(", ")
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateStructuredContent();
}
