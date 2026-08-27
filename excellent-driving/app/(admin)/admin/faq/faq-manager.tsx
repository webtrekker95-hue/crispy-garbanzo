"use client";

import { useState } from "react";

type Faq = { id: string; question: string; answer: string; language: "EN" | "NL"; orderIndex: number };
const emptyForm = { question: "", answer: "", language: "EN" as "EN" | "NL", orderIndex: "0" };

export function FaqManager({ initial }: { initial: Faq[] }) {
  const [faqs, setFaqs] = useState(initial);
  const [lang, setLang] = useState<"EN" | "NL">("EN");
  const [editing, setEditing] = useState<Faq | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setForm({ ...emptyForm, language: lang });
    setError(null);
    setEditing("new");
  }

  function openEdit(faq: Faq) {
    setForm({ question: faq.question, answer: faq.answer, language: faq.language, orderIndex: String(faq.orderIndex) });
    setError(null);
    setEditing(faq);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const isNew = editing === "new";
    const payload = { question: form.question, answer: form.answer, language: form.language, orderIndex: Number(form.orderIndex) };
    const res = await fetch(isNew ? "/api/admin/faq" : `/api/admin/faq/${(editing as Faq).id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save FAQ.");
      return;
    }

    setFaqs((list) => (isNew ? [...list, data.faq] : list.map((f) => (f.id === data.faq.id ? data.faq : f))));
    setEditing(null);
  }

  async function remove(faq: Faq) {
    const res = await fetch(`/api/admin/faq/${faq.id}`, { method: "DELETE" });
    if (res.ok) setFaqs((list) => list.filter((f) => f.id !== faq.id));
  }

  const visible = faqs.filter((f) => f.language === lang).sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div className="tabs" role="tablist" style={{ display: "flex", gap: 4, background: "var(--gray-100)", padding: 4, borderRadius: 10, width: "fit-content" }}>
          <button
            className="btn btn-sm"
            style={{ background: lang === "EN" ? "var(--white)" : "transparent", color: "var(--navy)", boxShadow: lang === "EN" ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}
            onClick={() => setLang("EN")}
          >
            English
          </button>
          <button
            className="btn btn-sm"
            style={{ background: lang === "NL" ? "var(--white)" : "transparent", color: "var(--navy)", boxShadow: lang === "NL" ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}
            onClick={() => setLang("NL")}
          >
            Nederlands
          </button>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add FAQ</button>
      </div>

      <div className="card">
        {visible.length === 0 ? (
          <div className="empty-state">No {lang} FAQ entries yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((faq) => (
                  <tr key={faq.id}>
                    <td>{faq.orderIndex}</td>
                    <td style={{ fontWeight: 600, maxWidth: 260 }}>{faq.question}</td>
                    <td style={{ maxWidth: 360, color: "var(--gray-600)" }}>
                      {faq.answer.length > 100 ? faq.answer.slice(0, 100) + "…" : faq.answer}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(faq)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(faq)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => !busy && setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editing === "new" ? "Add FAQ" : "Edit FAQ"}</div>
            <form onSubmit={save}>
              {error && <p className="status-banner-error">{error}</p>}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="faq-lang">Language</label>
                  <select id="faq-lang" value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value as "EN" | "NL" }))}>
                    <option value="EN">English</option>
                    <option value="NL">Nederlands</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="faq-order">Order</label>
                  <input id="faq-order" type="number" min="0" value={form.orderIndex} onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="faq-question">Question</label>
                <input id="faq-question" required value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="faq-answer">Answer</label>
                <textarea id="faq-answer" required rows={4} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save FAQ"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
