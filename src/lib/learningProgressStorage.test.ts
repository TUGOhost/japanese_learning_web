import { beforeEach, describe, expect, it } from "vitest";

import {
  createDefaultLearningProgress,
  LEARNING_PROGRESS_KEY,
  loadLearningProgress,
  N3_VOCABULARY_PROGRESS_KEY,
  saveLearningProgress
} from "./learningProgressStorage";

describe("learningProgressStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns a complete default progress object when storage is empty", () => {
    expect(loadLearningProgress()).toEqual(createDefaultLearningProgress());
  });

  it("migrates old N3 vocabulary progress into the new learning progress shape", () => {
    window.localStorage.setItem(
      N3_VOCABULARY_PROGRESS_KEY,
      JSON.stringify({
        "n3-001": { mastered: true, favorite: false },
        "n3-002": { mastered: false, favorite: true }
      })
    );

    const progress = loadLearningProgress();

    expect(progress.masteredVocabularyIds).toEqual(["n3-001"]);
    expect(progress.favoriteVocabularyIds).toEqual(["n3-002"]);
    expect(progress.completedLessonIds).toEqual([]);
    expect(progress.learningMode).toBe("textbook");
    expect(progress.completedUnitIds).toEqual([]);
    expect(progress.quizStats.totalAnswered).toBe(0);
    expect(progress.currentStageId).toBeUndefined();
  });

  it("normalizes partial stored progress without throwing", () => {
    window.localStorage.setItem(
      LEARNING_PROGRESS_KEY,
      JSON.stringify({
        completedLessonIds: ["lesson-001"],
        completedPracticeIds: ["quiz-001"],
        quiz: { completedCount: 3, correctCount: 2 },
        currentStage: 2,
        recentLessonId: "lesson-001"
      })
    );

    expect(loadLearningProgress()).toMatchObject({
      learningMode: "textbook",
      completedUnitIds: [],
      completedLessonIds: ["lesson-001"],
      masteredVocabularyIds: [],
      favoriteGrammarIds: [],
      completedQuizIds: ["quiz-001"],
      quizStats: { totalAnswered: 3, correctAnswered: 2 },
      lastStudiedUnitId: "lesson-001",
      currentStageId: "stage-shokyu-jou"
    });
  });

  it("persists the normalized progress object", () => {
    const progress = createDefaultLearningProgress();
    progress.completedUnitIds = ["unit-pre-writing-system"];
    progress.completedLessonIds = ["lesson-001"];
    progress.currentUnitId = "unit-pre-kana-hiragana";

    saveLearningProgress(progress);

    expect(loadLearningProgress().completedUnitIds).toEqual([
      "unit-pre-writing-system"
    ]);
    expect(loadLearningProgress().completedLessonIds).toEqual(["lesson-001"]);
    expect(loadLearningProgress().currentUnitId).toBe("unit-pre-kana-hiragana");
  });

  it("normalizes invalid learning modes and quiz stats", () => {
    window.localStorage.setItem(
      LEARNING_PROGRESS_KEY,
      JSON.stringify({
        learningMode: "random",
        completedQuizIds: ["quiz-001", "quiz-001", 3],
        quizStats: { totalAnswered: -1, correctAnswered: 2.4 }
      })
    );

    expect(loadLearningProgress()).toMatchObject({
      learningMode: "textbook",
      completedQuizIds: ["quiz-001"],
      quizStats: { totalAnswered: 0, correctAnswered: 2 }
    });
  });
});
