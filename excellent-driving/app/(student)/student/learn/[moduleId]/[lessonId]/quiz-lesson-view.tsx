"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./lesson.module.css";
import { MaquetteSituation } from "@/components/maquette-situation";
import type { Situation } from "@/lib/maquette";

type Question = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  /** Maquette diagram; drawn neutral until the answer is checked, then colour-coded. */
  situation?: Situation;
  /**
   * Picture shown above the question, e.g. a traffic sign. Its alt text must
   * not give the answer away. `width` is a raster image's own width, so it is
   * never shown larger than that.
   */
  image?: { src: string; alt: string; width?: number };
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
  const t = useTranslations("Learn");
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
          {passed ? `🎉 ${t("resultPassed")}` : `✗ ${t("resultFailed")}`}
        </div>
        <h2 className={styles["score-title"]}>{passed ? t("passTitle") : t("failTitle")}</h2>
        <p className={styles["score-sub"]}>
          {passed
            ? t("passText", { title, score: result.score })
            : t("failText", { score: result.score })}
        </p>

        <div className={styles["score-breakdown"]}>
          <div className={styles["breakdown-item"]}>
            <div className={styles["breakdown-num"]} style={{ color: "var(--green)" }}>{result.correctCount}</div>
            <div className={styles["breakdown-label"]}>{t("countCorrect")}</div>
          </div>
          <div className={styles["breakdown-item"]}>
            <div className={styles["breakdown-num"]} style={{ color: "var(--red)" }}>{result.total - result.correctCount}</div>
            <div className={styles["breakdown-label"]}>{t("countWrong")}</div>
          </div>
          <div className={styles["breakdown-item"]}>
            <div className={styles["breakdown-num"]} style={{ color: "var(--navy)" }}>70%</div>
            <div className={styles["breakdown-label"]}>{t("minToPass")}</div>
          </div>
        </div>

        <div className={styles["score-actions"]}>
          {passed ? (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => router.push(nextHref ?? moduleHref)}
              >
                ✓ {nextHref ? t("continueNextLesson") : t("backToModule")}
              </button>
              <button className="btn btn-outline btn-lg" onClick={retry}>{t("reviewAnswers")}</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-lg" onClick={retry}>🔄 {t("retryQuiz")}</button>
              <button className="btn btn-outline btn-lg" onClick={() => router.push(moduleHref)}>← {t("backToLessons")}</button>
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
          <div className={styles["q-progress-label"]}>{t("quizProgress")}</div>
          <div className={styles["q-progress-count"]}>{t("questionOf", { current: currentQ + 1, total: questions.length })}</div>
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
        <div className={styles["q-number"]}>❓ {t("questionNumber", { number: currentQ + 1 })}</div>
        {q.situation && (
          <div className={styles["q-situation"]}>
            <MaquetteSituation key={currentQ} situation={q.situation} colored={revealed[currentQ]} />
          </div>
        )}
        {q.image && (
          // eslint-disable-next-line @next/next/no-img-element -- small static file; next/image adds nothing here
          <img
            key={currentQ}
            src={q.image.src}
            alt={q.image.alt}
            className={styles["q-image"]}
            style={{ width: Math.min(160, q.image.width ?? 160) }}
          />
        )}
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
                {isRevealed && isCorrect && <div className={styles["opt-badge"]}>{t("badgeCorrect")}</div>}
                {isRevealed && isSelected && !isCorrect && <div className={styles["opt-badge"]}>{t("badgeYourAnswer")}</div>}
              </button>
            );
          })}
        </div>

        {revealed[currentQ] && (
          <div className={`${styles.explanation} ${answers[currentQ] === q.correct ? "" : styles["wrong-explanation"]}`}>
            <strong>{answers[currentQ] === q.correct ? `✓ ${t("feedbackCorrect")}` : `✗ ${t("feedbackWrong")}`}</strong>{" "}
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
          ← {t("previous")}
        </button>
        <span></span>
        {!revealed[currentQ] && (
          <button className="btn btn-primary" onClick={checkAnswer} disabled={answers[currentQ] === null}>
            {t("checkAnswer")}
          </button>
        )}
        {revealed[currentQ] && !isLast && (
          <button className="btn btn-primary" onClick={() => setCurrentQ((c) => c + 1)}>
            {t("nextQuestion")} →
          </button>
        )}
        {revealed[currentQ] && isLast && (
          <button className="btn btn-primary" onClick={submitQuiz} disabled={submitting}>
            {submitting ? t("submitting") : t("submitQuiz")}
          </button>
        )}
      </div>
    </div>
  );
}
