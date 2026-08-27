export type QuizQuestion = { correct: number };

export type QuizResult = {
  score: number;
  correctCount: number;
  total: number;
  passed: boolean;
};

/**
 * Pure scoring function used by POST /api/student/progress/:lessonId.
 * Extracted so quiz pass/fail logic is unit-testable without a live DB
 * or HTTP request.
 */
export function scoreQuiz(
  questions: QuizQuestion[],
  answers: (number | null | undefined)[],
  passingScore = 70
): QuizResult {
  const total = questions.length;
  const correctCount = questions.reduce(
    (count, q, i) => count + (answers[i] === q.correct ? 1 : 0),
    0
  );
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = score >= passingScore;

  return { score, correctCount, total, passed };
}
