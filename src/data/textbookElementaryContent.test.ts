import { describe, expect, it } from "vitest";

import type { SourceReference } from "../types/learning";
import { grammar } from "./grammar";
import { allVocabulary } from "./vocabulary";

const importedPilotLessons = [1, 2, 3];

const getBookForLesson = (lesson: number) =>
  lesson <= 24 ? "初级上" : "初级下";

const getSourceName = (source?: SourceReference) =>
  typeof source === "string" ? source : undefined;

const isTextbookSource = (item: {
  source?: SourceReference;
  contentSource?: SourceReference;
}) =>
  getSourceName(item.contentSource) === "标准日本语第二版初级" ||
  getSourceName(item.source) === "标准日本语第二版初级";

describe("textbook elementary content", () => {
  it("provides imported pilot vocabulary for lessons 1-3", () => {
    for (const lesson of importedPilotLessons) {
      const items = allVocabulary.filter(
        (item) =>
          isTextbookSource(item) &&
          item.textbookLesson === lesson &&
          item.unitId === `unit-sbj2-shokyu-${lesson}`
      );

      expect(items.length, `lesson ${lesson}`).toBeGreaterThan(0);
      expect(
        items.every((item) => item.textbookBook === getBookForLesson(lesson))
      ).toBe(true);
    }
  });

  it("provides imported pilot grammar for lessons 1-3", () => {
    for (const lesson of importedPilotLessons) {
      const items = grammar.filter(
        (item) =>
          isTextbookSource(item) &&
          item.textbookLesson === lesson &&
          item.unitId === `unit-sbj2-shokyu-${lesson}`
      );

      expect(items.length, `lesson ${lesson}`).toBeGreaterThan(0);
      expect(
        items.every((item) => item.textbookBook === getBookForLesson(lesson))
      ).toBe(true);
    }
  });

  it("keeps generated textbook ids unique", () => {
    const vocabularyIds = allVocabulary.map((item) => item.id);
    const grammarIds = grammar.map((item) => item.id);

    expect(new Set(vocabularyIds).size).toBe(vocabularyIds.length);
    expect(new Set(grammarIds).size).toBe(grammarIds.length);
  });
});
