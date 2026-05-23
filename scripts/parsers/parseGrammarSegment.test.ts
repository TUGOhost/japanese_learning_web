import { describe, expect, it } from "vitest";

import { parseGrammarSegment } from "./parseGrammarSegment";
import type { LessonSegment } from "../types";

const segment: LessonSegment = {
  id: "jnote-grammar-shokyu-jou-lesson-1",
  sourceFileId: "jnote-grammar-shokyu-jou",
  sourceFilePath: "content/sources/japanese-note/新版标准日本语初级语法总结_上册.md",
  contentKind: "grammar",
  textbookBook: "初级上",
  textbookLesson: 1,
  unitId: "unit-sbj2-shokyu-1",
  headingText: "第1课",
  headingLevel: 3,
  lineStart: 6,
  lineEnd: 20,
  hash: "segment-hash",
  rawMarkdown: `
### 第1课

&emsp;&emsp;1. \`名は 名です\`：相当于汉语的\`~是~\`。

- \`李さんは中国人です\`(小李是中国人)
- \`わたしは日本人です\`：我是日本人

&emsp;&emsp;2. \`はじめまして\`：初次见面时的寒暄语。

- \`はじめまして，李です\`(初次见面，我姓李)
`
};

describe("parseGrammarSegment", () => {
  it("parses numbered grammar structures and their following bullet examples", () => {
    const items = parseGrammarSegment(segment);

    expect(items[0]).toMatchObject({
      id: "grammar-sbj2-01-001",
      type: "grammar",
      title: "名は 名です",
      structure: "名は 名です",
      explanation: "相当于汉语的`~是~`。",
      textbookLesson: 1,
      unitId: "unit-sbj2-shokyu-1",
      importStatus: "imported",
      publishStatus: "private_only",
      examples: [
        { japanese: "李さんは中国人です", chinese: "小李是中国人" },
        { japanese: "わたしは日本人です", chinese: "我是日本人" }
      ]
    });
  });

  it("does not publish greeting or cultural notes as grammar without review", () => {
    const items = parseGrammarSegment(segment);

    expect(items[1]).toMatchObject({
      title: "はじめまして",
      category: "补充说明",
      importStatus: "needs_review"
    });
  });

  it("derives explanations from numbered prose without treating inline code as empty examples", () => {
    const items = parseGrammarSegment({
      ...segment,
      textbookLesson: 5,
      unitId: "unit-sbj2-shokyu-5",
      rawMarkdown: `
### 第5课

&emsp;&emsp;2. \`动ます/动ません/动ました/动ませんでした\`：

1. 肯定地叙述现在的习惯性动作、状态以及未来的动作、状态时，用\`~ます\`，其否定形式是\`~ません\`。
2. 肯定地叙述过去的动作时，\`ます\`要变成\`ました\`，其否定形式是\`~ませんでした\`。

- \`森さんは毎日働きます\`(森先生每天工作)
`
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "grammar-sbj2-05-001",
      structure: "动ます/动ません/动ました/动ませんでした",
      importStatus: "imported",
      examples: [{ japanese: "森さんは毎日働きます", chinese: "森先生每天工作" }]
    });
    expect(items[0].explanation).toContain("肯定地叙述现在");
    expect(items[0].examples).not.toContainEqual({
      japanese: "~ます",
      chinese: ""
    });
  });

  it("keeps numbered dialogue examples when they include a translation", () => {
    const items = parseGrammarSegment({
      ...segment,
      rawMarkdown: `
### 第3课

&emsp;&emsp;1. \`ここ/そこ/あそこは 名です\`：表示场所。

1. 甲：\`ぼくは来月またここへ来ますよ\`(我下个月还来这里)
2. 乙：\`どうしてですか\`(为什么？)
`
    });

    expect(items[0].examples).toEqual([
      { japanese: "ぼくは来月またここへ来ますよ", chinese: "我下个月还来这里" },
      { japanese: "どうしてですか", chinese: "为什么？" }
    ]);
  });
});
