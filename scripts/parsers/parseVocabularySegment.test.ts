import { describe, expect, it } from "vitest";

import { parseVocabularySegment } from "./parseVocabularySegment";
import type { LessonSegment } from "../types";

const createSegment = (rawMarkdown: string): LessonSegment => ({
  id: "jnote-vocab-shokyu-jou-lesson-1",
  sourceFileId: "jnote-vocab-shokyu-jou",
  sourceFilePath: "content/sources/japanese-note/新版标准日本语初级词汇表_上册.md",
  contentKind: "vocabulary",
  textbookBook: "初级上",
  textbookLesson: 1,
  unitId: "unit-sbj2-shokyu-1",
  headingText: "第1课",
  headingLevel: 3,
  lineStart: 6,
  lineEnd: 12,
  rawMarkdown,
  hash: "segment-hash"
});

describe("parseVocabularySegment", () => {
  it("parses Japanese_Note six-column vocabulary rows into two imported items", () => {
    const items = parseVocabularySegment(
      createSegment(`
### 第1课

单词 | 词性 | 解释 | 单词 | 词性 | 解释
---|---|---|---|---|---
\`ちゅうごくじん\` (中国人) | 名 | 中国人 | \`にほんじん\` (日本人) | 名 | 日本人
`)
    );

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: "vocab-sbj2-01-001",
      type: "vocabulary",
      word: "中国人",
      kana: "ちゅうごくじん",
      display: "中国人",
      meaning: "中国人",
      partOfSpeech: "名词",
      textbookLesson: 1,
      textbookBook: "初级上",
      unitId: "unit-sbj2-shokyu-1",
      importStatus: "imported",
      publishStatus: "private_only"
    });
    expect(items[0].source).toMatchObject({
      sourceRepo: "fukangwei/Japanese_Note",
      sourceUrl: "https://github.com/fukangwei/Japanese_Note",
      sourceFileId: "jnote-vocab-shokyu-jou",
      lineStart: 11,
      lineEnd: 11
    });
    expect(items[1]).toMatchObject({
      id: "vocab-sbj2-01-002",
      word: "日本人",
      kana: "にほんじん"
    });
  });

  it("keeps raw text and marks entries for review when kana and word cannot be split confidently", () => {
    const items = parseVocabularySegment(
      createSegment(`
### 第1课

单词 | 词性 | 解释
---|---|---
不明項目 | 名 | 待确认
`)
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      word: "不明項目",
      kana: "",
      importStatus: "needs_review",
      sourceText: "不明項目 | 名 | 待确认"
    });
  });
});
