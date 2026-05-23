import { describe, expect, it } from "vitest";

import type { QuizQuestion } from "../types/learning";
import {
  calculateQuizAccuracy,
  gradeQuizAnswer,
  getNextQuestionIndex
} from "./quizEngine";

const question: QuizQuestion = {
  id: "quiz-001",
  type: "kana",
  level: "预备",
  difficulty: "简单",
  question: "あ 的罗马音是？",
  options: ["a", "i", "u", "e"],
  answer: "a",
  explanation: "あ 读作 a。"
};

describe("quizEngine", () => {
  it("grades answers and exposes the explanation", () => {
    expect(gradeQuizAnswer(question, "a")).toEqual({
      isCorrect: true,
      answer: "a",
      explanation: "あ 读作 a。"
    });

    expect(gradeQuizAnswer(question, "i").isCorrect).toBe(false);
  });

  it("calculates quiz accuracy safely", () => {
    expect(calculateQuizAccuracy(0, 0)).toBe(0);
    expect(calculateQuizAccuracy(8, 10)).toBe(80);
  });

  it("wraps to the first question after the final question", () => {
    expect(getNextQuestionIndex(0, 3)).toBe(1);
    expect(getNextQuestionIndex(2, 3)).toBe(0);
    expect(getNextQuestionIndex(0, 0)).toBe(0);
  });
});
