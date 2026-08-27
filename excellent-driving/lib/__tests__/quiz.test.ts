import { scoreQuiz } from "@/lib/quiz";

describe("scoreQuiz", () => {
  const questions = [{ correct: 1 }, { correct: 1 }, { correct: 1 }, { correct: 1 }, { correct: 1 }];

  it("passes with a perfect score", () => {
    const result = scoreQuiz(questions, [1, 1, 1, 1, 1]);
    expect(result).toEqual({ score: 100, correctCount: 5, total: 5, passed: true });
  });

  it("fails with a zero score", () => {
    const result = scoreQuiz(questions, [0, 0, 0, 0, 0]);
    expect(result).toEqual({ score: 0, correctCount: 0, total: 5, passed: false });
  });

  it("passes exactly at the 70% threshold (4 of 5 questions is 80%, which passes)", () => {
    const result = scoreQuiz(questions, [1, 1, 1, 1, 0]);
    expect(result.score).toBe(80);
    expect(result.passed).toBe(true);
  });

  it("fails just below the passing threshold (2 of 5 is 40%)", () => {
    const result = scoreQuiz(questions, [1, 1, 0, 0, 0]);
    expect(result.score).toBe(40);
    expect(result.passed).toBe(false);
  });

  it("respects a custom passing score", () => {
    // 3 of 5 = 60% — fails against the default 70% threshold...
    const failing = scoreQuiz(questions, [1, 1, 1, 0, 0], 70);
    expect(failing.passed).toBe(false);
    // ...but passes against a lowered 50% threshold.
    const passing = scoreQuiz(questions, [1, 1, 1, 0, 0], 50);
    expect(passing.passed).toBe(true);
  });

  it("treats unanswered questions (null/undefined) as wrong, not a crash", () => {
    const result = scoreQuiz(questions, [1, null, undefined, 1, 1]);
    expect(result.correctCount).toBe(3);
    expect(result.score).toBe(60);
    expect(result.passed).toBe(false);
  });

  it("does not divide by zero for a quiz with no questions", () => {
    const result = scoreQuiz([], []);
    expect(result).toEqual({ score: 0, correctCount: 0, total: 0, passed: false });
  });

  it("ignores extra answers beyond the question count", () => {
    const result = scoreQuiz([{ correct: 0 }], [0, 1, 1, 1]);
    expect(result).toEqual({ score: 100, correctCount: 1, total: 1, passed: true });
  });
});
