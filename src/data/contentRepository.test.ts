import { describe, expect, it } from "vitest";

import {
  generatedGrammarFromJson,
  generatedQuizzesFromJson,
  generatedVocabularyFromJson
} from "./contentRepository";
import { curriculum } from "./curriculum";

const curriculumUnitIds = new Set(
  curriculum.flatMap((stage) => stage.units.map((unit) => unit.id))
);

describe("content repository", () => {
  it("loads generated JSON vocabulary and grammar", () => {
    expect(generatedVocabularyFromJson.length).toBeGreaterThan(0);
    expect(generatedGrammarFromJson.length).toBeGreaterThan(0);
  });

  it("keeps generated JSON ids unique", () => {
    const ids = [
      ...generatedVocabularyFromJson.map((item) => item.id),
      ...generatedGrammarFromJson.map((item) => item.id),
      ...generatedQuizzesFromJson.map((item) => item.id)
    ];

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references existing curriculum units and valid quiz answers", () => {
    for (const item of [...generatedVocabularyFromJson, ...generatedGrammarFromJson]) {
      expect(curriculumUnitIds.has(item.unitId ?? ""), item.id).toBe(true);
    }

    for (const quiz of generatedQuizzesFromJson) {
      expect(quiz.options.includes(quiz.answer), quiz.id).toBe(true);
    }
  });
});
