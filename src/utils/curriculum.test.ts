import { describe, expect, it } from "vitest";

import { curriculum } from "../data/curriculum";
import type { LearningProgress } from "../types/learning";
import {
  getAvailableUnits,
  getNextRecommendedUnit,
  getOrderedCurriculum,
  getProgressSummary,
  getUnitProgress,
  isUnitUnlocked
} from "./curriculum";

const createProgress = (
  overrides: Partial<LearningProgress> = {}
): LearningProgress => ({
  learningMode: "textbook",
  completedUnitIds: [],
  completedLessonIds: [],
  masteredVocabularyIds: [],
  favoriteVocabularyIds: [],
  masteredGrammarIds: [],
  favoriteGrammarIds: [],
  completedQuizIds: [],
  quizStats: {
    totalAnswered: 0,
    correctAnswered: 0
  },
  ...overrides
});

describe("curriculum utilities", () => {
  it("orders stages and units by their explicit order fields", () => {
    const ordered = getOrderedCurriculum();

    expect(ordered.map((stage) => stage.id)).toEqual(
      [...curriculum]
        .sort((a, b) => a.order - b.order)
        .map((stage) => stage.id)
    );
    expect(ordered[0].units.map((unit) => unit.id)).toEqual([
      "unit-pre-writing-system",
      "unit-pre-kana-hiragana",
      "unit-pre-kana-katakana",
      "unit-pre-kana-voiced",
      "unit-pre-greetings"
    ]);
  });

  it("recommends the first pre-foundation unit for a zero-basics user", () => {
    const progress = createProgress();

    expect(getNextRecommendedUnit(progress)?.id).toBe("unit-pre-writing-system");
    expect(
      getAvailableUnits(progress).some((unit) => unit.id === "unit-sbj2-shokyu-1")
    ).toBe(false);
  });

  it("does not unlock textbook or N3 units before prerequisites are complete", () => {
    const progress = createProgress({
      completedUnitIds: [
        "unit-pre-writing-system",
        "unit-pre-kana-hiragana",
        "unit-pre-kana-katakana"
      ]
    });
    const lessonOne = getOrderedCurriculum()
      .flatMap((stage) => stage.units)
      .find((unit) => unit.id === "unit-sbj2-shokyu-1");
    const n3Unit = getOrderedCurriculum()
      .flatMap((stage) => stage.units)
      .find((unit) => unit.id === "unit-n3-vocabulary");

    expect(lessonOne).toBeDefined();
    expect(n3Unit).toBeDefined();
    expect(isUnitUnlocked(lessonOne!, progress)).toBe(false);
    expect(isUnitUnlocked(n3Unit!, progress)).toBe(false);
    expect(getNextRecommendedUnit(progress)?.id).toBe("unit-pre-kana-voiced");
  });

  it("moves recommendation into textbook lessons only after pre-foundation is complete", () => {
    const progress = createProgress({
      completedUnitIds: [
        "unit-pre-writing-system",
        "unit-pre-kana-hiragana",
        "unit-pre-kana-katakana",
        "unit-pre-kana-voiced",
        "unit-pre-greetings"
      ]
    });

    expect(getNextRecommendedUnit(progress)?.id).toBe("unit-sbj2-shokyu-1");
  });

  it("treats free mode as browsable while keeping textbook recommendation ordered", () => {
    const progress = createProgress({ learningMode: "free" });

    expect(getAvailableUnits(progress).map((unit) => unit.id)).toContain(
      "unit-n3-vocabulary"
    );
    expect(getNextRecommendedUnit(progress)?.id).toBe("unit-pre-writing-system");
  });

  it("does not recommend N3 units in textbook mode", () => {
    const completedBeforeN3 = getOrderedCurriculum()
      .flatMap((stage) => stage.units)
      .filter((unit) => unit.source !== "N3进阶")
      .map((unit) => unit.id);
    const progress = createProgress({
      completedUnitIds: completedBeforeN3
    });

    expect(getNextRecommendedUnit(progress)?.source).not.toBe("N3进阶");
  });

  it("calculates unit and book summaries from completed unit ids", () => {
    const progress = createProgress({
      completedUnitIds: [
        "unit-pre-writing-system",
        "unit-pre-kana-hiragana",
        "unit-pre-kana-katakana",
        "unit-pre-kana-voiced",
        "unit-pre-greetings",
        "unit-sbj2-shokyu-1"
      ],
      completedLessonIds: ["lesson-002"]
    });
    const lessonOne = getOrderedCurriculum()
      .flatMap((stage) => stage.units)
      .find((unit) => unit.id === "unit-sbj2-shokyu-1")!;

    expect(getUnitProgress(lessonOne, progress)).toMatchObject({
      completed: true,
      percent: 100
    });
    expect(getProgressSummary(progress)).toMatchObject({
      currentStageId: "stage-shokyu-jou",
      currentUnitId: "unit-sbj2-shokyu-2",
      shokyuJouPercent: 4,
      n3Unlocked: false
    });
  });
});
