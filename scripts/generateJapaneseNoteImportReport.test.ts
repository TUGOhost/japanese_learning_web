import { describe, expect, it } from "vitest";

import { renderReport } from "./generateJapaneseNoteImportReport";
import type { ImportedLearningItem, LessonSegment } from "./types";

const createSegment = (lesson: number): LessonSegment => ({
  id: `segment-${lesson}`,
  sourceFileId: "jnote-vocab-shokyu-jou",
  sourceFilePath: "content/sources/japanese-note/新版标准日本语初级词汇表_上册.md",
  contentKind: "vocabulary",
  textbookBook: "初级上",
  textbookLesson: lesson,
  unitId: `unit-sbj2-shokyu-${lesson}`,
  headingText: `第${lesson}课`,
  headingLevel: 3,
  lineStart: 1,
  lineEnd: 2,
  rawMarkdown: "",
  hash: `hash-${lesson}`
});

const createVocabularyItem = (lesson: number): ImportedLearningItem => ({
  id: `vocab-${lesson}`,
  type: "vocabulary",
  word: "本",
  kana: "ほん",
  display: "本",
  meaning: "书",
  partOfSpeech: "名词",
  example: "「本」",
  exampleMeaning: "书",
  level: "N5",
  textbookBook: "初级上",
  textbookLesson: lesson,
  unitId: `unit-sbj2-shokyu-${lesson}`,
  isCore: true,
  tags: [`第${lesson}课`],
  source: {
    sourceRepo: "fukangwei/Japanese_Note",
    sourceUrl: "https://github.com/fukangwei/Japanese_Note",
    filePath: "content/sources/japanese-note/新版标准日本语初级词汇表_上册.md",
    sourceFileId: "jnote-vocab-shokyu-jou",
    headingPath: [`第${lesson}课`],
    lineStart: 1,
    lineEnd: 1,
    hash: "source-hash",
    rawText: "raw"
  },
  publishStatus: "private_only",
  importStatus: "imported",
  hash: "item-hash",
  importHash: "item-hash",
  sourceText: "raw",
  lowConfidenceReasons: []
});

describe("renderReport", () => {
  it("limits missing lessons to the active lesson range", () => {
    const report = renderReport(
      [createVocabularyItem(1)],
      [createSegment(1)],
      { start: 1, end: 3 }
    );

    expect(report).toContain("- 未识别课次：2, 3");
    expect(report).not.toContain("25, 26");
  });

  it("reports source files, unitId coverage, policy checks, and content gap reasons", () => {
    const vocabularyItem = createVocabularyItem(1);
    const grammarItem: ImportedLearningItem = {
      id: "grammar-1",
      type: "grammar",
      title: "名は 名です",
      structure: "名は 名です",
      meaning: "是",
      explanation: "判断句。",
      examples: [],
      level: "N5",
      textbookBook: "初级上",
      textbookLesson: 1,
      unitId: "unit-sbj2-shokyu-1",
      isCore: true,
      category: "教材第1课",
      source: {
        ...vocabularyItem.source,
        filePath: "content/sources/japanese-note/新版标准日本语初级语法总结_上册.md",
        sourceFileId: "jnote-grammar-shokyu-jou"
      },
      publishStatus: "private_only",
      importStatus: "imported",
      hash: "grammar-hash",
      importHash: "grammar-hash",
      sourceText: "raw grammar",
      lowConfidenceReasons: []
    };
    const report = renderReport(
      [vocabularyItem, grammarItem],
      [
        createSegment(1),
        {
          ...createSegment(1),
          id: "grammar-segment-1",
          sourceFileId: "jnote-grammar-shokyu-jou",
          sourceFilePath:
            "content/sources/japanese-note/新版标准日本语初级语法总结_上册.md",
          contentKind: "grammar"
        },
        createSegment(2)
      ],
      { start: 1, end: 2 }
    );

    expect(report).toContain("## Source Checks");
    expect(report).toContain(
      "- 词汇来源文件：content/sources/japanese-note/新版标准日本语初级词汇表_上册.md"
    );
    expect(report).toContain(
      "- 语法来源文件：content/sources/japanese-note/新版标准日本语初级语法总结_上册.md"
    );
    expect(report).toContain("- 非预期词汇来源：无");
    expect(report).toContain("- 非预期语法来源：无");
    expect(report).toContain("## Unit Checks");
    expect(report).toContain("- 分段缺少 unitId：0");
    expect(report).toContain("- 条目缺少 unitId：0");
    expect(report).toContain("## Policy Checks");
    expect(report).toContain("- public 模式可见 private_only 条目：0");
    expect(report).toContain("## Content Gap Reasons");
    expect(report).toContain("- 第 2 课：未识别到语法分段。");
  });
});
