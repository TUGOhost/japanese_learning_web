import { describe, expect, it } from "vitest";

import { createGeneratedSentencePatternsFromGrammar } from "./generateStructuredContent";
import type { ImportedGrammarItem } from "./types";

const source = {
  sourceRepo: "fukangwei/Japanese_Note" as const,
  sourceUrl: "https://github.com/fukangwei/Japanese_Note",
  filePath: "content/sources/japanese-note/新版标准日本语初级语法总结_上册.md",
  sourceFileId: "jnote-grammar-shokyu-jou",
  headingPath: ["第2课"],
  lineStart: 64,
  lineEnd: 80,
  hash: "source-hash"
};

const createGrammar = (
  overrides: Partial<ImportedGrammarItem>
): ImportedGrammarItem => ({
  id: "grammar-sbj2-02-001",
  type: "grammar",
  title: "これ/それ/あれは 名です",
  structure: "これ/それ/あれは 名です",
  meaning: "这、这个",
  explanation: "指示事物的结构。",
  examples: [{ japanese: "これは本です", chinese: "这是书" }],
  level: "N5",
  textbookBook: "初级上",
  textbookLesson: 2,
  unitId: "unit-sbj2-shokyu-2",
  isCore: true,
  category: "教材第2课",
  source,
  publishStatus: "private_only",
  importStatus: "imported",
  hash: "item-hash",
  importHash: "item-hash",
  sourceText: "raw grammar",
  ...overrides
});

describe("createGeneratedSentencePatternsFromGrammar", () => {
  it("turns imported core grammar structures into sentence patterns", () => {
    const patterns = createGeneratedSentencePatternsFromGrammar([
      createGrammar({}),
      createGrammar({
        id: "grammar-sbj2-03-001",
        title: "ここ/そこ/あそこは 名です",
        structure: "ここ/そこ/あそこは 名です",
        textbookLesson: 3,
        unitId: "unit-sbj2-shokyu-3",
        examples: [{ japanese: "ここはデパートです", chinese: "这里是百货商店" }]
      }),
      createGrammar({
        id: "grammar-sbj2-02-006",
        title: "どうぞ",
        structure: "どうぞ",
        category: "补充说明",
        importStatus: "needs_review"
      })
    ]);

    expect(patterns).toHaveLength(2);
    expect(patterns[0]).toMatchObject({
      id: "pattern-sbj2-02-001",
      pattern: "これ/それ/あれは 名です",
      unitId: "unit-sbj2-shokyu-2",
      textbookLesson: 2,
      publishStatus: "private_only",
      importStatus: "imported"
    });
    expect(patterns[1]).toMatchObject({
      id: "pattern-sbj2-03-001",
      pattern: "ここ/そこ/あそこは 名です",
      unitId: "unit-sbj2-shokyu-3"
    });
  });
});
