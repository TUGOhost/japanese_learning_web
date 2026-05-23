import { describe, expect, it } from "vitest";

import { importJapaneseNoteSegment } from "./importJapaneseNoteSegments";
import type { LessonSegment } from "./types";

const createSegment = (
  contentKind: LessonSegment["contentKind"],
  rawMarkdown: string
): LessonSegment => ({
  id: `jnote-${contentKind}-shokyu-jou-lesson-4`,
  sourceFileId: `jnote-${contentKind}-shokyu-jou`,
  sourceFilePath: `content/sources/japanese-note/新版标准日本语初级${
    contentKind === "grammar" ? "语法总结" : "词汇表"
  }_上册.md`,
  contentKind,
  textbookBook: "初级上",
  textbookLesson: 4,
  unitId: "unit-sbj2-shokyu-4",
  headingText: "第4课",
  headingLevel: 3,
  lineStart: 1,
  lineEnd: 3,
  rawMarkdown,
  hash: "segment-hash"
});

describe("importJapaneseNoteSegment", () => {
  it("puts an unparsed vocabulary segment into the review queue", () => {
    const items = importJapaneseNoteSegment(
      createSegment("vocabulary", "### 第4课\n\n这里没有词汇表格。")
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "review-jnote-vocabulary-shokyu-jou-lesson-4",
      type: "review",
      importStatus: "needs_review",
      publishStatus: "private_only",
      textbookLesson: 4,
      unitId: "unit-sbj2-shokyu-4",
      reason: "未能从 vocabulary 分段解析出条目"
    });
  });

  it("puts an unparsed grammar segment into the review queue", () => {
    const items = importJapaneseNoteSegment(
      createSegment("grammar", "### 第4课\n\n这里没有编号语法结构。")
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "review-jnote-grammar-shokyu-jou-lesson-4",
      type: "review",
      importStatus: "needs_review",
      publishStatus: "private_only",
      textbookLesson: 4,
      unitId: "unit-sbj2-shokyu-4",
      reason: "未能从 grammar 分段解析出条目"
    });
  });
});
