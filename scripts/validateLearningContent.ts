import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { curriculum } from "../src/data/curriculum";
import { filterVisibleContent } from "../src/lib/contentVisibility";
import type { LearningProgress, QuizQuestion } from "../src/types/learning";
import { getNextRecommendedUnit, getOrderedUnits } from "../src/utils/curriculum";
import {
  generatedContentDir,
  japaneseNoteIntermediateDir,
  normalizeReportPath,
  readJsonFile,
  reportsDir
} from "./lib/japaneseNoteUtils";
import type { ImportedLearningItem, LessonSegment } from "./types";

type ValidationIssue = {
  severity: "error" | "warning";
  rule: string;
  message: string;
};

const importedRawPath = path.join(
  japaneseNoteIntermediateDir,
  "imported.raw.json"
);
const segmentsPath = path.join(
  japaneseNoteIntermediateDir,
  "lesson-segments.json"
);

const validationReportPath = path.join(reportsDir, "validation-report.md");
const reviewQueuePath = path.join(reportsDir, "review-queue.md");

const loadGeneratedModule = async <T>(
  fileName: string,
  exportName: string
): Promise<T[]> => {
  const filePath = path.join(generatedContentDir, fileName);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const module = (await import(`${filePath}?t=${Date.now()}`)) as Record<
    string,
    T[]
  >;

  return module[exportName] ?? [];
};

const loadGeneratedContent = async <T>(
  jsonFileName: string,
  legacyTsFileName: string,
  legacyExportName: string
): Promise<T[]> => {
  const jsonPath = path.join(generatedContentDir, jsonFileName);

  if (fs.existsSync(jsonPath)) {
    return readJsonFile<T[]>(jsonPath, []);
  }

  return loadGeneratedModule<T>(legacyTsFileName, legacyExportName);
};

const getCurriculumUnitIds = () =>
  new Set(curriculum.flatMap((stage) => stage.units.map((unit) => unit.id)));

const addUniqueIdIssues = (
  issues: ValidationIssue[],
  items: Array<{ id: string }>
) => {
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) {
      issues.push({
        severity: "error",
        rule: "unique-id",
        message: `Duplicate id: ${item.id}`
      });
    }

    seen.add(item.id);
  }
};

const validateImportedItem = (
  item: ImportedLearningItem,
  issues: ValidationIssue[],
  unitIds: Set<string>
) => {
  if (item.unitId && !unitIds.has(item.unitId)) {
    issues.push({
      severity: "error",
      rule: "unit-exists",
      message: `${item.id} references missing unitId ${item.unitId}`
    });
  }

  if (item.textbookLesson !== undefined && item.unitId) {
    const expectedBook = getExpectedTextbookBook(item.unitId, item.textbookLesson);

    if (expectedBook && item.textbookBook !== expectedBook) {
      issues.push({
        severity: "error",
        rule: "book-lesson-range",
        message: `${item.id} lesson ${item.textbookLesson} must be ${expectedBook}`
      });
    }
  }

  if (!item.source) {
    issues.push({
      severity: "error",
      rule: "source-required",
      message: `${item.id} is missing source`
    });
  }

  if (!item.hash || !item.source?.hash) {
    issues.push({
      severity: "error",
      rule: "hash-required",
      message: `${item.id} is missing hash`
    });
  }

  if (item.type === "vocabulary") {
    if (!item.word && !item.display) {
      issues.push({
        severity: "error",
        rule: "vocabulary-word",
        message: `${item.id} is missing word/display`
      });
    }

    if (!item.meaning || !item.partOfSpeech) {
      issues.push({
        severity: "error",
        rule: "vocabulary-fields",
        message: `${item.id} is missing meaning or partOfSpeech`
      });
    }
  }

  if (item.type === "grammar" && (!item.structure || !item.explanation)) {
    issues.push({
      severity: "error",
      rule: "grammar-fields",
      message: `${item.id} is missing structure or explanation`
    });
  }

  if (item.type === "sentence" && (!item.japanese || !item.chinese)) {
    issues.push({
      severity: "error",
      rule: "sentence-fields",
      message: `${item.id} is missing japanese or chinese`
    });
  }
};

const getExpectedTextbookBook = (
  unitId: string,
  lesson: number
): string | undefined => {
  if (unitId.includes("unit-sbj2-shokyu-")) {
    return lesson <= 24 ? "初级上" : "初级下";
  }

  if (unitId.includes("unit-sbj2-chukyu-")) {
    return lesson <= 16 ? "中级上" : "中级下";
  }

  if (unitId.includes("unit-sbj2-koukyu-")) {
    return lesson <= 12 ? "高级上" : "高级下";
  }

  return undefined;
};

const validateSegments = (
  segments: LessonSegment[],
  issues: ValidationIssue[]
) => {
  for (const segment of segments) {
    if (!segment.lineStart || !segment.lineEnd || segment.lineEnd < segment.lineStart) {
      issues.push({
        severity: "error",
        rule: "segment-lines",
        message: `${segment.id} has invalid lineStart/lineEnd`
      });
    }

    if (
      segment.sourceFileId.includes("shokyu-jou") &&
      segment.textbookLesson !== undefined &&
      segment.textbookLesson > 24
    ) {
      issues.push({
        severity: "error",
        rule: "upper-book-range",
        message: `${segment.id} generated lower-book lesson from upper-book source`
      });
    }

    if (
      segment.sourceFileId.includes("shokyu-ge") &&
      segment.textbookLesson !== undefined &&
      segment.textbookLesson < 25
    ) {
      issues.push({
        severity: "error",
        rule: "lower-book-range",
        message: `${segment.id} generated upper-book lesson from lower-book source`
      });
    }
  }
};

const createProgress = (
  completedUnitIds: string[] = []
): LearningProgress => ({
  learningMode: "textbook",
  completedUnitIds,
  completedLessonIds: [],
  favoriteVocabularyIds: [],
  masteredVocabularyIds: [],
  favoriteGrammarIds: [],
  masteredGrammarIds: [],
  completedQuizIds: [],
  quizStats: {
    totalAnswered: 0,
    correctAnswered: 0
  }
});

const validateCurriculumRecommendation = (issues: ValidationIssue[]) => {
  const orderedNonN3Units = getOrderedUnits().filter(
    (unit) => unit.source !== "N3进阶"
  );

  for (let index = 0; index < orderedNonN3Units.length; index += 1) {
    const completedUnitIds = orderedNonN3Units
      .slice(0, index)
      .map((unit) => unit.id);
    const recommended = getNextRecommendedUnit(createProgress(completedUnitIds));

    if (recommended?.source === "N3进阶") {
      issues.push({
        severity: "error",
        rule: "homepage-no-n3",
        message: "Textbook mode recommended an N3 unit"
      });
    }

    if (recommended?.id !== orderedNonN3Units[index].id) {
      issues.push({
        severity: "error",
        rule: "homepage-curriculum-order",
        message: `Expected ${orderedNonN3Units[index].id}, got ${recommended?.id ?? "none"}`
      });
      return;
    }
  }

  const afterNonN3 = getNextRecommendedUnit(
    createProgress(orderedNonN3Units.map((unit) => unit.id))
  );

  if (afterNonN3?.source === "N3进阶") {
    issues.push({
      severity: "error",
      rule: "homepage-no-n3",
      message: "Textbook mode recommended N3 after the elementary/review route"
    });
  }
};

const renderReviewQueue = (items: ImportedLearningItem[]) => {
  const reviewItems = items.filter(
    (item) => item.importStatus !== "imported" || item.publishStatus === "do_not_publish"
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
      `- source: ${item.source.filePath}:${item.source.lineStart}`,
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

const renderValidationReport = (issues: ValidationIssue[]) => {
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const lines = [
    "# Learning Content Validation Report",
    "",
    `Errors: ${errors.length}`,
    `Warnings: ${warnings.length}`,
    "",
    "## Issues",
    ""
  ];

  if (issues.length === 0) {
    lines.push("- No validation issues found.");
  } else {
    for (const issue of issues) {
      lines.push(`- **${issue.severity}** [${issue.rule}] ${issue.message}`);
    }
  }

  lines.push(
    "",
    "## External Checks",
    "",
    "- `npm run typecheck`: run separately after content generation.",
    "- `npm run build`: run separately after content generation."
  );

  return `${lines.join("\n")}\n`;
};

export const validateLearningContent = async () => {
  fs.mkdirSync(reportsDir, { recursive: true });
  const issues: ValidationIssue[] = [];
  const importedItems = readJsonFile<ImportedLearningItem[]>(importedRawPath, []);
  const segments = readJsonFile<LessonSegment[]>(segmentsPath, []);
  const generatedVocabulary = await loadGeneratedContent<{ id: string }>(
    "vocabulary.json",
    "vocabulary.generated.ts",
    "generatedVocabulary"
  );
  const generatedGrammar = await loadGeneratedContent<{ id: string }>(
    "grammar.json",
    "grammar.generated.ts",
    "generatedGrammar"
  );
  const generatedSentences = await loadGeneratedContent<{ id: string }>(
    "sentences.json",
    "sentences.generated.ts",
    "generatedSentences"
  );
  const generatedExpressions = await loadGeneratedContent<{ id: string }>(
    "expressions.json",
    "expressions.generated.ts",
    "generatedExpressions"
  );
  const generatedPatterns = await loadGeneratedModule<{ id: string }>(
    "sentencePatterns.generated.ts",
    "generatedSentencePatterns"
  );
  const generatedQuizzes = await loadGeneratedContent<QuizQuestion>(
    "quizzes.json",
    "quizzes.generated.ts",
    "generatedQuizzes"
  );
  const unitIds = getCurriculumUnitIds();

  validateSegments(segments, issues);
  validateCurriculumRecommendation(issues);
  addUniqueIdIssues(issues, [
    ...generatedVocabulary,
    ...generatedGrammar,
    ...generatedSentences,
    ...generatedExpressions,
    ...generatedPatterns,
    ...generatedQuizzes
  ]);

  for (const item of importedItems) {
    validateImportedItem(item, issues, unitIds);
  }

  for (const quiz of generatedQuizzes) {
    if (!quiz.options.includes(quiz.answer)) {
      issues.push({
        severity: "error",
        rule: "quiz-answer",
        message: `${quiz.id} answer is not in options`
      });
    }
  }

  const publicVisiblePrivateItems = filterVisibleContent(
    [
      ...generatedVocabulary,
      ...generatedGrammar,
      ...generatedSentences,
      ...generatedExpressions,
      ...generatedPatterns,
      ...generatedQuizzes
    ] as Array<{
      id: string;
      publishStatus?: "private_only" | "needs_rewrite" | "safe_to_publish" | "do_not_publish";
      importStatus?: "imported" | "needs_review" | "skipped";
    }>,
    "public"
  ).filter((item) => item.publishStatus === "private_only");

  if (publicVisiblePrivateItems.length > 0) {
    issues.push({
      severity: "error",
      rule: "public-private-filter",
      message: `${publicVisiblePrivateItems.length} private_only items are visible in public mode`
    });
  }

  fs.writeFileSync(validationReportPath, renderValidationReport(issues));
  fs.writeFileSync(reviewQueuePath, renderReviewQueue(importedItems));

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  console.log(
    `Validation wrote ${normalizeReportPath(validationReportPath)} with ${errorCount} errors.`
  );

  if (errorCount > 0) {
    process.exitCode = 1;
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  validateLearningContent();
}
