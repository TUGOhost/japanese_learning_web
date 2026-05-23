import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { filterVisibleContent } from "../src/lib/contentVisibility";
import {
  japaneseNoteIntermediateDir,
  normalizeReportPath,
  parseLessonRange,
  readJsonFile,
  reportsDir
} from "./lib/japaneseNoteUtils";
import type { ImportedLearningItem, LessonRange, LessonSegment } from "./types";

type LessonStats = {
  textbookLesson: number;
  unitId: string;
  vocabulary: number;
  grammar: number;
  sentence: number;
  expression: number;
  needsReview: number;
  skipped: number;
  privateOnly: number;
  doNotPublish: number;
  missingFields: string[];
  duplicates: string[];
  lowConfidence: string[];
};

const expectedSourceByKindAndBook = {
  vocabulary: {
    "初级上": "content/sources/japanese-note/新版标准日本语初级词汇表_上册.md",
    "初级下": "content/sources/japanese-note/新版标准日本语初级词汇表_下册.md",
    "中级上": "content/sources/japanese-note/新版标准日本语中级词汇表_上册.md",
    "中级下": "content/sources/japanese-note/新版标准日本语中级词汇表_下册.md",
    "高级上": "content/sources/japanese-note/新版标准日本语高级词汇表_上册.md",
    "高级下": "content/sources/japanese-note/新版标准日本语高级词汇表_下册.md"
  },
  grammar: {
    "初级上": "content/sources/japanese-note/新版标准日本语初级语法总结_上册.md",
    "初级下": "content/sources/japanese-note/新版标准日本语初级语法总结_下册.md",
    "中级上": "content/sources/japanese-note/新版标准日本语中级语法总结_上册.md",
    "中级下": "content/sources/japanese-note/新版标准日本语中级语法总结_下册.md",
    "高级上": "content/sources/japanese-note/新版标准日本语高级语法总结_上册.md",
    "高级下": "content/sources/japanese-note/新版标准日本语高级语法总结_下册.md"
  }
} as const;

const importedRawPath = path.join(
  japaneseNoteIntermediateDir,
  "imported.raw.json"
);
const segmentsPath = path.join(
  japaneseNoteIntermediateDir,
  "lesson-segments.json"
);
const reportPath = path.join(reportsDir, "japanese-note-import-report.md");

const getLessonStats = (
  lesson: number,
  items: ImportedLearningItem[],
  segments: LessonSegment[]
): LessonStats => {
  const lessonItems = items.filter((item) => item.textbookLesson === lesson);
  const lessonSegments = segments.filter(
    (segment) => segment.textbookLesson === lesson
  );
  const unitIds = [
    ...new Set(
      [
        ...lessonSegments.map((segment) => segment.unitId),
        ...lessonItems.map((item) => item.unitId)
      ].filter((unitId): unitId is string => Boolean(unitId))
    )
  ];
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  const missingFields = new Set<string>();
  const lowConfidence = new Set<string>();

  for (const item of lessonItems) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);

    if (!item.unitId) {
      missingFields.add(`${item.id}: unitId`);
    }

    if (item.type === "vocabulary") {
      if (!item.word) missingFields.add(`${item.id}: word`);
      if (!item.meaning) missingFields.add(`${item.id}: meaning`);
      if (!item.partOfSpeech) missingFields.add(`${item.id}: partOfSpeech`);
    }

    if (item.type === "grammar") {
      if (!item.structure) missingFields.add(`${item.id}: structure`);
      if (!item.explanation) missingFields.add(`${item.id}: explanation`);
    }

    if (item.type === "sentence") {
      if (!item.japanese) missingFields.add(`${item.id}: japanese`);
      if (!item.chinese) missingFields.add(`${item.id}: chinese`);
    }

    for (const reason of item.lowConfidenceReasons ?? []) {
      lowConfidence.add(`${item.id}: ${reason}`);
    }
  }

  return {
    textbookLesson: lesson,
    unitId: unitIds.join(", ") || `missing: unit-sbj2-shokyu-${lesson}`,
    vocabulary: lessonItems.filter((item) => item.type === "vocabulary").length,
    grammar: lessonItems.filter((item) => item.type === "grammar").length,
    sentence: lessonItems.filter((item) => item.type === "sentence").length,
    expression: lessonItems.filter((item) => item.type === "expression").length,
    needsReview: lessonItems.filter((item) => item.importStatus === "needs_review").length,
    skipped: lessonItems.filter((item) => item.importStatus === "skipped").length,
    privateOnly: lessonItems.filter((item) => item.publishStatus === "private_only").length,
    doNotPublish: lessonItems.filter((item) => item.publishStatus === "do_not_publish").length,
    missingFields: [...missingFields],
    duplicates: [...duplicates],
    lowConfidence: [...lowConfidence]
  };
};

const getExpectedLessons = (lessonRange?: LessonRange) => {
  const start = lessonRange?.start ?? 1;
  const end = lessonRange?.end ?? 48;

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const formatList = (values: Array<string | number>): string =>
  values.length > 0 ? values.join(", ") : "无";

const getSourceFilesByType = (
  items: ImportedLearningItem[],
  type: "vocabulary" | "grammar"
): string[] => [
  ...new Set(
    items
      .filter((item) => item.type === type)
      .map((item) => item.source.filePath)
      .filter(Boolean)
  )
].sort();

const getExpectedSourcePath = (
  item: ImportedLearningItem,
  type: "vocabulary" | "grammar"
): string | undefined => {
  if (!item.textbookBook) {
    return undefined;
  }

  return expectedSourceByKindAndBook[type][item.textbookBook];
};

const getUnexpectedSources = (
  items: ImportedLearningItem[],
  type: "vocabulary" | "grammar"
): string[] =>
  items
    .filter((item) => item.type === type)
    .flatMap((item) => {
      const expectedSourcePath = getExpectedSourcePath(item, type);

      if (!expectedSourcePath || item.source.filePath === expectedSourcePath) {
        return [];
      }

      return [`${item.id}: ${item.source.filePath}`];
    });

const getContentGapReasons = ({
  expectedLessons,
  stats,
  segments
}: {
  expectedLessons: number[];
  stats: LessonStats[];
  segments: LessonSegment[];
}): string[] => {
  const statsByLesson = new Map(
    stats.map((entry) => [entry.textbookLesson, entry])
  );

  return expectedLessons.flatMap((lesson) => {
    const entry = statsByLesson.get(lesson);
    const lessonSegments = segments.filter(
      (segment) => segment.textbookLesson === lesson
    );
    const reasons: string[] = [];

    if (!entry || lessonSegments.length === 0) {
      return [
        `第 ${lesson} 课：未识别到任何分段；请检查源文件课次标题或 LESSON_RANGE。`
      ];
    }

    const hasVocabularySegment = lessonSegments.some((segment) =>
      ["vocabulary", "mixed"].includes(segment.contentKind)
    );
    const hasGrammarSegment = lessonSegments.some((segment) =>
      ["grammar", "mixed"].includes(segment.contentKind)
    );

    if (entry.vocabulary === 0) {
      reasons.push(
        hasVocabularySegment
          ? `第 ${lesson} 课：词汇分段存在，但未解析出词汇条目。`
          : `第 ${lesson} 课：未识别到词汇分段。`
      );
    }

    if (entry.grammar === 0) {
      reasons.push(
        hasGrammarSegment
          ? `第 ${lesson} 课：语法分段存在，但未解析出语法条目。`
          : `第 ${lesson} 课：未识别到语法分段。`
      );
    }

    return reasons;
  });
};

const getPolicyCounts = (items: ImportedLearningItem[]) => ({
  privateOnly: items.filter((item) => item.publishStatus === "private_only").length,
  safeToPublish: items.filter((item) => item.publishStatus === "safe_to_publish").length,
  needsRewrite: items.filter((item) => item.publishStatus === "needs_rewrite").length,
  doNotPublish: items.filter((item) => item.publishStatus === "do_not_publish").length,
  publicVisiblePrivateOnly: filterVisibleContent(items, "public").filter(
    (item) => item.publishStatus === "private_only"
  ).length
});

export const renderReport = (
  items: ImportedLearningItem[],
  segments: LessonSegment[],
  lessonRange?: LessonRange
) => {
  const lessons = [...new Set(segments.map((segment) => segment.textbookLesson).filter(
    (lesson): lesson is number => lesson !== undefined
  ))].sort((a, b) => a - b);
  const stats = lessons.map((lesson) => getLessonStats(lesson, items, segments));
  const recognizedLessons = new Set(lessons);
  const expectedLessons = lessonRange ? getExpectedLessons(lessonRange) : lessons;
  const missingLessons = expectedLessons.filter(
    (lesson) => !recognizedLessons.has(lesson)
  );
  const lessonsWithoutVocabulary = stats
    .filter((entry) => entry.vocabulary === 0)
    .map((entry) => entry.textbookLesson);
  const lessonsWithoutGrammar = stats
    .filter((entry) => entry.grammar === 0)
    .map((entry) => entry.textbookLesson);
  const failedItems = items.filter((item) => item.importStatus !== "imported");
  const doNotPublishItems = items.filter(
    (item) => item.publishStatus === "do_not_publish"
  );
  const segmentsMissingUnitId = segments.filter((segment) => !segment.unitId);
  const itemsMissingUnitId = items.filter((item) => !item.unitId);
  const vocabularySourceFiles = getSourceFilesByType(items, "vocabulary");
  const grammarSourceFiles = getSourceFilesByType(items, "grammar");
  const unexpectedVocabularySources = getUnexpectedSources(items, "vocabulary");
  const unexpectedGrammarSources = getUnexpectedSources(items, "grammar");
  const contentGapReasons = getContentGapReasons({
    expectedLessons,
    stats,
    segments
  });
  const policyCounts = getPolicyCounts(items);
  const lines = [
    "# Japanese_Note Import Report",
    "",
    "| lesson | unitId | vocab | grammar | sentence | expression | needs_review | skipped | private_only | do_not_publish |",
    "|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|"
  ];

  for (const entry of stats) {
    lines.push(
      `| ${entry.textbookLesson} | ${entry.unitId} | ${entry.vocabulary} | ${entry.grammar} | ${entry.sentence} | ${entry.expression} | ${entry.needsReview} | ${entry.skipped} | ${entry.privateOnly} | ${entry.doNotPublish} |`
    );
  }

  lines.push(
    "",
    "## Coverage Gaps",
    "",
    `- 未识别课次：${formatList(missingLessons)}`,
    `- 无词汇课次：${formatList(lessonsWithoutVocabulary)}`,
    `- 无语法课次：${formatList(lessonsWithoutGrammar)}`,
    "",
    "## Source Checks",
    "",
    `- 词汇来源文件：${formatList(vocabularySourceFiles)}`,
    `- 语法来源文件：${formatList(grammarSourceFiles)}`,
    `- 非预期词汇来源：${formatList(unexpectedVocabularySources)}`,
    `- 非预期语法来源：${formatList(unexpectedGrammarSources)}`,
    "",
    "## Unit Checks",
    "",
    `- 分段缺少 unitId：${segmentsMissingUnitId.length}`,
    `- 条目缺少 unitId：${itemsMissingUnitId.length}`,
    segmentsMissingUnitId.length > 0
      ? `- 缺少 unitId 的分段：${formatList(
          segmentsMissingUnitId.map((segment) => segment.id)
        )}`
      : "- 缺少 unitId 的分段：无",
    itemsMissingUnitId.length > 0
      ? `- 缺少 unitId 的条目：${formatList(
          itemsMissingUnitId.map((item) => item.id)
        )}`
      : "- 缺少 unitId 的条目：无",
    "",
    "## Policy Checks",
    "",
    `- private_only：${policyCounts.privateOnly}`,
    `- safe_to_publish：${policyCounts.safeToPublish}`,
    `- needs_rewrite：${policyCounts.needsRewrite}`,
    `- do_not_publish：${policyCounts.doNotPublish}`,
    `- public 模式可见 private_only 条目：${policyCounts.publicVisiblePrivateOnly}`,
    "",
    "## Content Gap Reasons",
    "",
    contentGapReasons.length > 0
      ? contentGapReasons.map((reason) => `- ${reason}`).join("\n")
      : "- 无",
    "",
    "## Parsing Issues",
    "",
    `- 未成功解析/需复核条目：${failedItems.length}`,
    `- 可能不建议公开发布条目：${doNotPublishItems.length}`,
    ""
  );

  for (const entry of stats) {
    if (
      entry.missingFields.length === 0 &&
      entry.duplicates.length === 0 &&
      entry.lowConfidence.length === 0
    ) {
      continue;
    }

    lines.push(`### 第 ${entry.textbookLesson} 课`, "");

    for (const value of entry.missingFields) {
      lines.push(`- 缺失字段：${value}`);
    }

    for (const value of entry.duplicates) {
      lines.push(`- 重复项：${value}`);
    }

    for (const value of entry.lowConfidence) {
      lines.push(`- 低置信度：${value}`);
    }

    lines.push("");
  }

  lines.push(
    "## Next Steps",
    "",
    "- 先处理 `reports/review-queue.md` 中的 needs_review 条目。",
    "- 将确认为原创改写的解释手动标记为 `safe_to_publish`。",
    "- 新增标准教材源文件时先补 `content/source-manifest/japanese-note.ts` 策略，再运行 `npm run content:all:japanese-note`。",
    "- 公开部署前确认 `VITE_CONTENT_MODE=public npm run build` 不展示 `private_only` 内容。"
  );

  return `${lines.join("\n")}\n`;
};

export const generateJapaneseNoteImportReport = () => {
  fs.mkdirSync(reportsDir, { recursive: true });
  const items = readJsonFile<ImportedLearningItem[]>(importedRawPath, []);
  const segments = readJsonFile<LessonSegment[]>(segmentsPath, []);

  fs.writeFileSync(reportPath, renderReport(items, segments, parseLessonRange()));

  console.log(`Wrote ${normalizeReportPath(reportPath)}.`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateJapaneseNoteImportReport();
}
