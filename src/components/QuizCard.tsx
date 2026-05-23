import { CheckCircle2, XCircle } from "lucide-react";

import type { QuizQuestion } from "../types/learning";
import type { QuizAnswerResult } from "../lib/quizEngine";

type QuizCardProps = {
  question: QuizQuestion;
  selectedAnswer: string | null;
  result: QuizAnswerResult | null;
  onSelect: (answer: string) => void;
  onNext: () => void;
};

export const QuizCard = ({
  question,
  selectedAnswer,
  result,
  onSelect,
  onNext
}: QuizCardProps) => {
  return (
    <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-matcha-50 px-3 py-1 text-xs font-semibold text-matcha-700">
          {question.type}
        </span>
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-8 text-slate-950">
        {question.question}
      </h2>

      <div className="mt-5 grid gap-3">
        {question.options.map((option) => {
          const selected = selectedAnswer === option;
          const correct = result && option === question.answer;
          const wrong = result && selected && option !== question.answer;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              disabled={result !== null}
              className={`min-h-12 rounded-lg border px-4 text-left text-base font-semibold transition active:scale-[0.98] ${
                correct
                  ? "border-matcha-300 bg-matcha-50 text-matcha-800"
                  : wrong
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : selected
                      ? "border-slate-300 bg-slate-100 text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {result ? (
        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <p
            className={`flex items-center gap-2 text-base font-semibold ${
              result.isCorrect ? "text-matcha-700" : "text-rose-700"
            }`}
          >
            {result.isCorrect ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            {result.isCorrect ? "回答正确" : `正确答案：${result.answer}`}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {result.explanation}
          </p>
          <button
            type="button"
            onClick={onNext}
            className="mt-4 min-h-11 w-full rounded-lg bg-matcha-600 px-4 text-base font-semibold text-white transition hover:bg-matcha-700 active:scale-[0.98]"
          >
            下一题
          </button>
        </div>
      ) : null}
    </section>
  );
};
