import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createImportedSource,
  getLevelForLesson,
  japaneseNoteIntermediateDir,
  normalizeReportPath,
  readJsonFile,
  stableHash,
  writeJsonFile
} from "./lib/japaneseNoteUtils";
import { parseExpressionSegment } from "./parsers/parseExpressionSegment";
import { parseGrammarSegment } from "./parsers/parseGrammarSegment";
import { parseVocabularySegment } from "./parsers/parseVocabularySegment";
import type {
  ImportedLearningItem,
  ImportedReviewItem,
  ImportedSentenceItem,
  LessonSegment
} from "./types";

const segmentsPath = path.join(
  japaneseNoteIntermediateDir,
  "lesson-segments.json"
);

const importedRawPath = path.join(
  japaneseNoteIntermediateDir,
  "imported.raw.json"
);

const createGrammarExampleSentenceCandidates = (
  grammarItems: ImportedLearningItem[]
): ImportedSentenceItem[] =>
  grammarItems.flatMap((item) => {
    if (item.type !== "grammar") {
      return [];
    }

    return item.examples
      .filter((example) => example.japanese && example.chinese)
      .map((example, index) => {
        const rawText = `${example.japanese}(${example.chinese})`;
        const hash = stableHash(`${item.id}:${rawText}:${index}`);

        return {
          id: `sentence-candidate-${item.id}-${String(index + 1).padStart(2, "0")}`,
          type: "sentence",
          japanese: example.japanese,
          reading: example.reading,
          chinese: example.chinese,
          level: item.level,
          textbookBook: item.textbookBook,
          textbookLesson: item.textbookLesson,
          unitId: item.unitId,
          tags: item.textbookLesson ? [`第${item.textbookLesson}课`, "语法例句候选"] : [],
          grammarIds: [item.id],
          note: "从语法例句生成的候选句，默认需要人工复核以避免重复和版权风险。",
          source: {
            ...item.source,
            rawText,
            hash
          },
          publishStatus:
            rawText.length > 120 ? "do_not_publish" : "private_only",
          importStatus: "needs_review",
          hash,
          importHash: hash,
          sourceText: rawText,
          lowConfidenceReasons: ["语法例句候选默认进入复核队列"]
        };
      });
  });

const createReviewItem = (
  segment: LessonSegment,
  reason: string
): ImportedReviewItem => {
  const rawText = segment.rawMarkdown.slice(0, 800);
  const hash = stableHash(`${segment.id}:${reason}:${rawText}`);

  return {
    id: `review-${segment.id}`,
    type: "review",
    title: segment.headingText,
    reason,
    level: getLevelForLesson(segment.textbookLesson),
    textbookBook: segment.textbookBook,
    textbookLesson: segment.textbookLesson,
    unitId: segment.unitId,
    source: createImportedSource({ segment, rawText }),
    publishStatus: "private_only",
    importStatus: "needs_review",
    hash,
    sourceText: rawText,
    lowConfidenceReasons: [reason]
  };
};

const withUnparsedReviewItem = (
  segment: LessonSegment,
  items: ImportedLearningItem[]
): ImportedLearningItem[] => {
  if (items.length > 0) {
    return items;
  }

  return [
    createReviewItem(
      segment,
      `未能从 ${segment.contentKind} 分段解析出条目`
    )
  ];
};

export const importJapaneseNoteSegment = (
  segment: LessonSegment
): ImportedLearningItem[] => {
  if (segment.contentKind === "vocabulary") {
    return withUnparsedReviewItem(segment, [
      ...parseVocabularySegment(segment),
      ...parseExpressionSegment(segment)
    ]);
  }

  if (segment.contentKind === "grammar") {
    const grammarItems = parseGrammarSegment(segment);
    return withUnparsedReviewItem(segment, [
      ...grammarItems,
      ...createGrammarExampleSentenceCandidates(grammarItems)
    ]);
  }

  if (segment.contentKind === "mixed") {
    const grammarItems = parseGrammarSegment(segment);
    return withUnparsedReviewItem(segment, [
      ...parseVocabularySegment(segment),
      ...parseExpressionSegment(segment),
      ...grammarItems,
      ...createGrammarExampleSentenceCandidates(grammarItems)
    ]);
  }

  return [createReviewItem(segment, `${segment.contentKind} 内容默认需要人工复核`)];
};

export const importJapaneseNoteSegments = () => {
  const segments = readJsonFile<LessonSegment[]>(segmentsPath, []);
  const importedItems = segments.flatMap(importJapaneseNoteSegment);

  writeJsonFile(importedRawPath, importedItems);

  console.log(
    `Imported ${importedItems.length} items from ${segments.length} segments into ${normalizeReportPath(importedRawPath)}.`
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  importJapaneseNoteSegments();
}
