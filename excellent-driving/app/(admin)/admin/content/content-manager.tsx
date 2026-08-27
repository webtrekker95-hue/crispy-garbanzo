"use client";

import { useState } from "react";
import styles from "./content.module.css";
import { QuizBuilder, type QuizQuestion } from "./quiz-builder";

type LessonType = "TEXT" | "QUIZ" | "VIDEO";
type Lesson = { id: string; title: string; type: LessonType; orderIndex: number; content: Record<string, unknown> };
type Module = { id: string; titleEn: string; titleNl: string; orderIndex: number; isPublished: boolean; lessons: Lesson[] };

const emptyModuleForm = { titleEn: "", titleNl: "", orderIndex: "1", isPublished: false };

function emptyLessonForm(type: LessonType = "TEXT") {
  return {
    title: "",
    type,
    orderIndex: "1",
    body: "",
    passingScore: "70",
    questions: [] as QuizQuestion[],
  };
}

export function ContentManager({ initial }: { initial: Module[] }) {
  const [modules, setModules] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(initial[0]?.id ?? null);

  const [moduleEditing, setModuleEditing] = useState<Module | "new" | null>(null);
  const [moduleForm, setModuleForm] = useState(emptyModuleForm);

  const [lessonEditing, setLessonEditing] = useState<{ moduleId: string; lesson: Lesson | "new" } | null>(null);
  const [lessonForm, setLessonForm] = useState(emptyLessonForm());

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openModuleCreate() {
    setModuleForm({ ...emptyModuleForm, orderIndex: String(modules.length + 1) });
    setError(null);
    setModuleEditing("new");
  }

  function openModuleEdit(mod: Module) {
    setModuleForm({ titleEn: mod.titleEn, titleNl: mod.titleNl, orderIndex: String(mod.orderIndex), isPublished: mod.isPublished });
    setError(null);
    setModuleEditing(mod);
  }

  async function saveModule(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const isNew = moduleEditing === "new";
    const payload = { titleEn: moduleForm.titleEn, titleNl: moduleForm.titleNl, orderIndex: Number(moduleForm.orderIndex), isPublished: moduleForm.isPublished };
    const res = await fetch(isNew ? "/api/admin/modules" : `/api/admin/modules/${(moduleEditing as Module).id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save module.");
      return;
    }

    setModules((list) =>
      (isNew ? [...list, data.module] : list.map((m) => (m.id === data.module.id ? { ...data.module, lessons: m.lessons } : m)))
        .sort((a, b) => a.orderIndex - b.orderIndex)
    );
    setModuleEditing(null);
  }

  function openLessonCreate(moduleId: string, lessonCount: number) {
    setLessonForm({ ...emptyLessonForm(), orderIndex: String(lessonCount + 1) });
    setError(null);
    setLessonEditing({ moduleId, lesson: "new" });
  }

  function openLessonEdit(moduleId: string, lesson: Lesson) {
    const content = lesson.content as { body?: string; description?: string; passingScore?: number; questions?: QuizQuestion[] };
    setLessonForm({
      title: lesson.title,
      type: lesson.type,
      orderIndex: String(lesson.orderIndex),
      body: content.body ?? content.description ?? "",
      passingScore: String(content.passingScore ?? 70),
      questions: content.questions ?? [],
    });
    setError(null);
    setLessonEditing({ moduleId, lesson });
  }

  function buildContent() {
    if (lessonForm.type === "QUIZ") {
      return { type: "QUIZ", passingScore: Number(lessonForm.passingScore), questions: lessonForm.questions };
    }
    if (lessonForm.type === "VIDEO") {
      return { type: "VIDEO", description: lessonForm.body };
    }
    return { type: "TEXT", body: lessonForm.body };
  }

  async function saveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (lessonForm.type === "QUIZ" && lessonForm.questions.length === 0) {
      setError("Add at least one question before saving a quiz lesson.");
      return;
    }
    setBusy(true);
    setError(null);

    const { moduleId, lesson } = lessonEditing!;
    const isNew = lesson === "new";
    const payload = { title: lessonForm.title, type: lessonForm.type, orderIndex: Number(lessonForm.orderIndex), content: buildContent() };
    const res = await fetch(isNew ? `/api/admin/modules/${moduleId}/lessons` : `/api/admin/lessons/${(lesson as Lesson).id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save lesson.");
      return;
    }

    setModules((list) =>
      list.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: (isNew ? [...m.lessons, data.lesson] : m.lessons.map((l) => (l.id === data.lesson.id ? data.lesson : l))).sort(
                (a, b) => a.orderIndex - b.orderIndex
              ),
            }
          : m
      )
    );
    setLessonEditing(null);
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Delete this lesson? This can't be undone.")) return;
    const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    if (res.ok) {
      setModules((list) => list.map((m) => (m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m)));
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <button className="btn btn-primary" onClick={openModuleCreate}>+ Add Module</button>
      </div>

      {modules.map((mod) => (
        <div className={styles["module-card"]} key={mod.id}>
          <div className={styles["module-header"]} onClick={() => setExpanded(expanded === mod.id ? null : mod.id)}>
            <div className={styles["module-header-info"]}>
              <div className={styles["module-header-title"]}>Module {mod.orderIndex}: {mod.titleEn}</div>
              <div className={styles["module-header-meta"]}>
                {mod.lessons.length} lesson{mod.lessons.length === 1 ? "" : "s"} · {mod.isPublished ? "Published" : "Draft"}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={(e) => {
                e.stopPropagation();
                openModuleEdit(mod);
              }}
            >
              Edit
            </button>
            <div className={`${styles["module-chevron"]}${expanded === mod.id ? ` ${styles.open}` : ""}`} aria-hidden="true">▼</div>
          </div>

          {expanded === mod.id && (
            <>
              {mod.lessons.map((lesson) => (
                <div className={styles["lesson-row"]} key={lesson.id}>
                  <span>{lesson.orderIndex}.</span>
                  <div className={styles["lesson-title"]}>{lesson.title}</div>
                  <span className={`${styles["lesson-type-badge"]} ${styles[`type-${lesson.type.toLowerCase()}`]}`}>{lesson.type}</span>
                  <div className="action-btns">
                    <button className="btn btn-sm btn-outline" onClick={() => openLessonEdit(mod.id, lesson)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteLesson(mod.id, lesson.id)}>Delete</button>
                  </div>
                </div>
              ))}
              <div className={styles["add-lesson-row"]}>
                <button className="btn btn-sm btn-outline" onClick={() => openLessonCreate(mod.id, mod.lessons.length)}>+ Add Lesson</button>
              </div>
            </>
          )}
        </div>
      ))}

      {moduleEditing && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => !busy && setModuleEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{moduleEditing === "new" ? "Add Module" : "Edit Module"}</div>
            <form onSubmit={saveModule}>
              {error && <p className="status-banner-error">{error}</p>}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="mod-title-en">Title (EN)</label>
                  <input id="mod-title-en" required value={moduleForm.titleEn} onChange={(e) => setModuleForm((f) => ({ ...f, titleEn: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="mod-title-nl">Title (NL)</label>
                  <input id="mod-title-nl" required value={moduleForm.titleNl} onChange={(e) => setModuleForm((f) => ({ ...f, titleNl: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="mod-order">Order</label>
                <input id="mod-order" type="number" min="1" required value={moduleForm.orderIndex} onChange={(e) => setModuleForm((f) => ({ ...f, orderIndex: e.target.value }))} />
              </div>
              <div className="field">
                <label>
                  <input type="checkbox" style={{ width: "auto", marginRight: 8 }} checked={moduleForm.isPublished} onChange={(e) => setModuleForm((f) => ({ ...f, isPublished: e.target.checked }))} />
                  Published (visible to students)
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModuleEditing(null)} disabled={busy}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save Module"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lessonEditing && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => !busy && setLessonEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-title">{lessonEditing.lesson === "new" ? "Add Lesson" : "Edit Lesson"}</div>
            <form onSubmit={saveLesson}>
              {error && <p className="status-banner-error">{error}</p>}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="lesson-title">Title</label>
                  <input id="lesson-title" required value={lessonForm.title} onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="lesson-order">Order</label>
                  <input id="lesson-order" type="number" min="1" required value={lessonForm.orderIndex} onChange={(e) => setLessonForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="lesson-type">Type</label>
                <select
                  id="lesson-type"
                  value={lessonForm.type}
                  onChange={(e) => setLessonForm((f) => ({ ...f, type: e.target.value as LessonType }))}
                >
                  <option value="TEXT">Text</option>
                  <option value="VIDEO">Video (placeholder)</option>
                  <option value="QUIZ">Quiz</option>
                </select>
              </div>

              {lessonForm.type === "TEXT" && (
                <div className="field">
                  <label htmlFor="lesson-body">Lesson text</label>
                  <textarea id="lesson-body" rows={6} required value={lessonForm.body} onChange={(e) => setLessonForm((f) => ({ ...f, body: e.target.value }))} />
                </div>
              )}

              {lessonForm.type === "VIDEO" && (
                <div className="field">
                  <label htmlFor="lesson-video-desc">Video description (placeholder — no video hosting yet)</label>
                  <textarea id="lesson-video-desc" rows={3} required value={lessonForm.body} onChange={(e) => setLessonForm((f) => ({ ...f, body: e.target.value }))} />
                </div>
              )}

              {lessonForm.type === "QUIZ" && (
                <>
                  <div className="field">
                    <label htmlFor="lesson-passing">Passing score (%)</label>
                    <input
                      id="lesson-passing"
                      type="number"
                      min="1"
                      max="100"
                      style={{ maxWidth: 120 }}
                      value={lessonForm.passingScore}
                      onChange={(e) => setLessonForm((f) => ({ ...f, passingScore: e.target.value }))}
                    />
                  </div>
                  <QuizBuilder questions={lessonForm.questions} onChange={(questions) => setLessonForm((f) => ({ ...f, questions }))} />
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setLessonEditing(null)} disabled={busy}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save Lesson"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
