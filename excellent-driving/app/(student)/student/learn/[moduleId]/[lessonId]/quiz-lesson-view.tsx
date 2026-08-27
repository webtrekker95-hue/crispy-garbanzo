"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./lesson.module.css";

type Question = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

export function QuizLessonView({
  lessonId,
  title,
  questions,
  nextHref,
  moduleHref,
}: {
  lessonId: string;
  title: string;
  questions: Question[];
  nextHref: string | null;
  moduleHref: string;
}) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [revealed, setRevealed] = useState<boolean[]>(questions.map(() => false));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; correctCount: number; total: number; passed: boolean } | null>(null);

  const q = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  function selectOption(i: number) {
    if (revealed[currentQ]) return;
    setAnswers((a) => a.map((v, idx) => (idx === currentQ ? i : v)));
  }

  function checkAnswer() {
    setRevealed((r) => r.map((v, idx) => (idx === currentQ ? true : v)));
  }

  async function submitQuiz() {
    setSubmitting(true);
    const res = await fetch(`/api/student/progress/${lessonId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setResult({ score: data.score, correctCount: data.correctCount, total: data.total, passed: data.passed });
    }
  }

  function retry() {
    setCurrentQ(0);
    setAnswers(questions.map(() => null));
    setRevealed(questions.map(() => false));
    setResult(null);
  }

  if (result) {
    const passed = result.passed;
    return (
      <div className={styles["score-screen"]}>
        <div className={`${styles["score-badge"]} ${styles[passed ? "pass" : "fail"]}`}>{result.score}%</div>
        <div className={`${styles["score-result"]} ${styles[passed ? "pass" : "fail"]}`}>
          {passed ? "🎉 PASSED" : "✗ FAILED"}
        </div>
        <h2 className={styles["score-title"]}>{passed ? "Excellent Work!" : "Not Quite There Yet"}</h2>
        <p className={styles["score-sub"]}>
          {passed
            ? `You passed ${title} with a score of ${result.score}%. The next lesson is now unlocked.`
            : `You scored ${result.score}% but need at least 70% to pass. Review the material and try again — you can retry as many times as needed.`}
        </p>

        <div className={styles["score-breakdown"]}>
          <div className={styles["breakdown-item"]}>
            <div className={styles["breakdown-num"]} style={{ color: "var(--green)" }}>{result.correctCount}</div>
            <div className={styles["breakdown-label"]}>Correct</div>
          </div>
          <div className={styles["breakdown-item"]}>
            <div className={styles["breakdown-num"]} style={{ color: "var(--red)" }}>{result.total - result.correctCount}</div>
            <div className={styles["breakdown-label"]}>Wrong</div>
          </div>
          <div className={styles["breakdown-item"]}>
            <div className={styles["breakdown-num"]} style={{ color: "var(--navy)" }}>70%</div>
            <div className={styles["breakdown-label"]}>Min. to pass</div>
          </div>
        </div>

        <div className={styles["score-actions"]}>
          {passed ? (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => router.push(nextHref ?? moduleHref)}
              >
                ✓ {nextHref ? "Continue to Next Lesson" : "Back to Module"}
              </button>
              <button className="btn btn-outline btn-lg" onClick={retry}>Review Answers</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-lg" onClick={retry}>🔄 Retry Quiz</button>
              <button className="btn btn-outline btn-lg" onClick={() => router.push(moduleHref)}>← Back to Lessons</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles["q-progress-wrap"]}>
        <div className={styles["q-progress-header"]}>
          <div className={styles["q-progress-label"]}>Quiz Progress</div>
          <div className={styles["q-progress-count"]}>Question {currentQ + 1} of {questions.length}</div>
        </div>
        <div className={styles["q-progress-dots"]}>
          {questions.map((_, i) => (
            <div
              key={i}
              className={`${styles["q-dot"]} ${styles[i < currentQ ? "done" : i === currentQ ? "active" : "pending"]}`}
            />
          ))}
        </div>
      </div>

      <div className={styles["question-card"]}>
        <div className={styles["q-number"]}>❓ Question {currentQ + 1}</div>
        <div className={styles["q-text"]}>{q.text}</div>

        <div className={styles.answers}>
          {q.options.map((opt, i) => {
            const isSelected = answers[currentQ] === i;
            const isRevealed = revealed[currentQ];
            const isCorrect = i === q.correct;
            let cls = styles["answer-opt"];
            if (isSelected && !isRevealed) cls += ` ${styles.selected}`;
            if (isRevealed) {
              cls += ` ${styles.revealed}`;
              if (isCorrect) cls += ` ${styles.correct}`;
              else if (isSelected) cls += ` ${styles.wrong}`;
            }
            return (
              <button key={i} type="button" className={cls} onClick={() => selectOption(i)} disabled={isRevealed}>
                <div className={styles["opt-letter"]}>{String.fromCharCode(65 + i)}</div>
                <div className={styles["opt-text"]}>{opt}</div>
                {isRevealed && isCorrect && <div className={styles["opt-badge"]}>Correct</div>}
                {isRevealed && isSelected && !isCorrect && <div className={styles["opt-badge"]}>Your answer</div>}
              </button>
            );
          })}
        </div>

        {revealed[currentQ] && (
          <div className={`${styles.explanation} ${answers[currentQ] === q.correct ? "" : styles["wrong-explanation"]}`}>
            <strong>{answers[currentQ] === q.correct ? "✓ Correct!" : "✗ Not quite."}</strong>{" "}
            <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
          </div>
        )}
      </div>

      <div className={styles["q-nav"]}>
        <button
          className="btn btn-outline"
          onClick={() => setCurrentQ((c) => c - 1)}
          style={{ visibility: currentQ > 0 ? "visible" : "hidden" }}
        >
          ← Previous
        </button>
        <span></span>
        {!revealed[currentQ] && (
          <button className="btn btn-primary" onClick={checkAnswer} disabled={answers[currentQ] === null}>
            Check Answer
          </button>
        )}
        {revealed[currentQ] && !isLast && (
          <button className="btn btn-primary" onClick={() => setCurrentQ((c) => c + 1)}>
            Next Question →
          </button>
        )}
        {revealed[currentQ] && isLast && (
          <button className="btn btn-primary" onClick={submitQuiz} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Quiz"}
          </button>
        )}
      </div>
    </div>
  );
}
