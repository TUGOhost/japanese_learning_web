import type { QuizQuestion } from "../types/learning";

export type QuizAnswerResult = {
  isCorrect: boolean;
  answer: string;
  explanation: string;
};

export const gradeQuizAnswer = (
  question: QuizQuestion,
  selectedAnswer: string
): QuizAnswerResult => ({
  isCorrect: selectedAnswer === question.answer,
  answer: question.answer,
  explanation: question.explanation
});

export const calculateQuizAccuracy = (
  correctCount: number,
  completedCount: number
): number => {
  if (completedCount <= 0) {
    return 0;
  }

  return Math.round((correctCount / completedCount) * 100);
};

export const getNextQuestionIndex = (
  currentIndex: number,
  questionCount: number
): number => {
  if (questionCount <= 0) {
    return 0;
  }

  return (currentIndex + 1) % questionCount;
};
