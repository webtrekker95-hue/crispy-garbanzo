"use client";

import styles from "./content.module.css";

export type QuizQuestion = { text: string; options: string[]; correct: number; explanation: string };

const emptyQuestion = (): QuizQuestion => ({ text: "", options: ["", "", "", ""], correct: 0, explanation: "" });

export function QuizBuilder({
  questions,
  onChange,
}: {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}) {
  function updateQuestion(i: number, patch: Partial<QuizQuestion>) {
    onChange(questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, value: string) {
    const q = questions[qi];
    const options = q.options.map((o, idx) => (idx === oi ? value : o));
    updateQuestion(qi, { options });
  }

  function addQuestion() {
    onChange([...questions, emptyQuestion()]);
  }

  function removeQuestion(i: number) {
    onChange(questions.filter((_, idx) => idx !== i));
  }

  function moveQuestion(i: number, dir: -1 | 1) {
    const target = i + dir;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  }

  return (
    <div>
      {questions.map((q, qi) => (
        <div className={styles["question-block"]} key={qi}>
          <div className={styles["question-block-header"]}>
            <strong style={{ fontSize: "0.85rem", color: "var(--navy)" }}>Question {qi + 1}</strong>
            <div className="action-btns">
              <button type="button" className="btn btn-sm btn-outline" onClick={() => moveQuestion(qi, -1)} disabled={qi === 0}>↑</button>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => moveQuestion(qi, 1)} disabled={qi === questions.length - 1}>↓</button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => removeQuestion(qi)}>Remove</button>
            </div>
          </div>

          <div className="field">
            <label htmlFor={`q-${qi}-text`}>Question text</label>
            <input id={`q-${qi}-text`} required value={q.text} onChange={(e) => updateQuestion(qi, { text: e.target.value })} />
          </div>

          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>
            Options (select the correct one)
          </label>
          {q.options.map((opt, oi) => (
            <div className={styles["option-row"]} key={oi}>
              <input
                type="radio"
                name={`q-${qi}-correct`}
                checked={q.correct === oi}
                onChange={() => updateQuestion(qi, { correct: oi })}
                aria-label={`Option ${oi + 1} is correct`}
              />
              <input
                type="text"
                required
                placeholder={`Option ${oi + 1}`}
                value={opt}
                onChange={(e) => updateOption(qi, oi, e.target.value)}
              />
            </div>
          ))}

          <div className="field" style={{ marginTop: 10 }}>
            <label htmlFor={`q-${qi}-explanation`}>Explanation (shown after answering)</label>
            <textarea
              id={`q-${qi}-explanation`}
              rows={2}
              value={q.explanation}
              onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
            />
          </div>
        </div>
      ))}

      <button type="button" className="btn btn-outline" onClick={addQuestion}>+ Add Question</button>
    </div>
  );
}
