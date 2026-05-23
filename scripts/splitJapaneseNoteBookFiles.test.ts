import { describe, expect, it } from "vitest";

import { createLessonSegmentsFromMarkdown } from "./splitJapaneseNoteBookFiles";
import type { JapaneseNoteSourceFile } from "../content/source-manifest/japanese-note";

const sourceFile: JapaneseNoteSourceFile = {
  id: "jnote-vocab-shokyu-ge",
  fileName: "新版标准日本语初级词汇表_下册.md",
  relativePath: "新版标准日本语初级词汇表_下册.md",
  contentKind: "vocabulary",
  textbookSeries: "标准日本语第二版",
  textbookLevel: "初级",
  textbookBook: "初级下",
  lessonStart: 25,
  lessonEnd: 48,
  lessonNumberingMode: "relative",
  globalLessonOffset: 24,
  publicImportPolicy: "private_only"
};

describe("createLessonSegmentsFromMarkdown", () => {
  it("maps relative lower-book lesson headings to global lesson numbers", () => {
    const segments = createLessonSegmentsFromMarkdown({
      sourceFile,
      sourceFilePath: "content/sources/japanese-note/新版标准日本语初级词汇表_下册.md",
      markdown: "### 第1课\nA\n### 第2课\nB",
      lessonRange: { start: 25, end: 26 }
    });

    expect(segments.map((segment) => segment.textbookLesson)).toEqual([25, 26]);
    expect(segments[0]).toMatchObject({
      unitId: "unit-sbj2-shokyu-25",
      textbookBook: "初级下",
      lineStart: 1,
      lineEnd: 2
    });
  });
});
