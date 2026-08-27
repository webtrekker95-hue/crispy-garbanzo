"use client";

import { useState } from "react";
import styles from "./instructors.module.css";

const DAYS = [
  { code: "MON", label: "Monday" },
  { code: "TUE", label: "Tuesday" },
  { code: "WED", label: "Wednesday" },
  { code: "THU", label: "Thursday" },
  { code: "FRI", label: "Friday" },
  { code: "SAT", label: "Saturday" },
] as const;

type Instructor = {
  id: string;
  name: string;
  email: string;
  bio: string;
  yearsExperience: number;
  isActive: boolean;
  schedule: Record<string, { on: boolean; start: string; end: string }>;
};

function emptySchedule(): Instructor["schedule"] {
  return Object.fromEntries(DAYS.map((d) => [d.code, { on: false, start: "08:00", end: "17:00" }]));
}

export function InstructorsManager({ initial }: { initial: Instructor[] }) {
  const [instructors, setInstructors] = useState(initial);
  const [editing, setEditing] = useState<Instructor | "new" | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    yearsExperience: "0",
    schedule: emptySchedule(),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setForm({ name: "", email: "", password: "", bio: "", yearsExperience: "0", schedule: emptySchedule() });
    setError(null);
    setEditing("new");
  }

  function openEdit(inst: Instructor) {
    setForm({
      name: inst.name,
      email: inst.email,
      password: "",
      bio: inst.bio,
      yearsExperience: String(inst.yearsExperience),
      schedule: inst.schedule,
    });
    setError(null);
    setEditing(inst);
  }

  function toScheduleArray() {
    return DAYS.filter((d) => form.schedule[d.code].on).map((d) => ({
      dayOfWeek: d.code,
      startTime: form.schedule[d.code].start,
      endTime: form.schedule[d.code].end,
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const isNew = editing === "new";
    const url = isNew ? "/api/admin/instructors" : `/api/admin/instructors/${(editing as Instructor).id}`;
    const payload = isNew
      ? {
          name: form.name,
          email: form.email,
          password: form.password,
          bio: form.bio,
          yearsExperience: Number(form.yearsExperience),
          schedule: toScheduleArray(),
        }
      : {
          name: form.name,
          bio: form.bio,
          yearsExperience: Number(form.yearsExperience),
          schedule: toScheduleArray(),
        };

    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save instructor.");
      return;
    }

    const inst = data.instructor;
    const normalized: Instructor = {
      id: inst.id,
      name: inst.user.name,
      email: inst.user.email,
      bio: inst.bio ?? "",
      yearsExperience: inst.yearsExperience ?? 0,
      isActive: inst.isActive,
      schedule: {
        ...emptySchedule(),
        ...Object.fromEntries(
          inst.schedules.map((s: { dayOfWeek: string; startTime: string; endTime: string }) => [
            s.dayOfWeek,
            { on: true, start: s.startTime, end: s.endTime },
          ])
        ),
      },
    };

    setInstructors((list) => (isNew ? [...list, normalized] : list.map((i) => (i.id === normalized.id ? normalized : i))));
    setEditing(null);
  }

  async function toggleActive(inst: Instructor) {
    const res = await fetch(`/api/admin/instructors/${inst.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !inst.isActive }),
    });
    if (res.ok) {
      setInstructors((list) => list.map((i) => (i.id === inst.id ? { ...i, isActive: !i.isActive } : i)));
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Instructor</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Experience</th>
                <th>Days Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((inst) => (
                <tr key={inst.id}>
                  <td style={{ fontWeight: 600 }}>{inst.name}</td>
                  <td>{inst.email}</td>
                  <td>{inst.yearsExperience} years</td>
                  <td>{DAYS.filter((d) => inst.schedule[d.code]?.on).map((d) => d.code).join(", ") || "—"}</td>
                  <td>
                    <span className={`badge ${inst.isActive ? "badge-active" : "badge-inactive"}`}>
                      {inst.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(inst)}>Edit</button>
                      <button
                        className={`btn btn-sm ${inst.isActive ? "btn-danger" : "btn-success"}`}
                        onClick={() => toggleActive(inst)}
                      >
                        {inst.isActive ? "Remove" : "Reactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => !busy && setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-title">{editing === "new" ? "Add Instructor" : "Edit Instructor"}</div>
            <form onSubmit={save}>
              {error && <p className="status-banner-error">{error}</p>}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="inst-name">Full name</label>
                  <input id="inst-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="inst-years">Years of experience</label>
                  <input id="inst-years" type="number" min="0" required value={form.yearsExperience} onChange={(e) => setForm((f) => ({ ...f, yearsExperience: e.target.value }))} />
                </div>
              </div>
              {editing === "new" && (
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="inst-email">Email (login)</label>
                    <input id="inst-email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="inst-password">Initial password</label>
                    <input id="inst-password" type="password" minLength={8} required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="field">
                <label htmlFor="inst-bio">Bio</label>
                <textarea id="inst-bio" rows={2} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
              </div>

              <div className="field">
                <label>Weekly Schedule</label>
                <div className={styles["schedule-grid"]}>
                  {DAYS.map((d) => (
                    <div className={styles["schedule-row"]} key={d.code}>
                      <label>
                        <input
                          type="checkbox"
                          checked={form.schedule[d.code].on}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              schedule: { ...f.schedule, [d.code]: { ...f.schedule[d.code], on: e.target.checked } },
                            }))
                          }
                        />
                        {d.label}
                      </label>
                      <input
                        type="time"
                        aria-label={`${d.label} start time`}
                        disabled={!form.schedule[d.code].on}
                        value={form.schedule[d.code].start}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            schedule: { ...f.schedule, [d.code]: { ...f.schedule[d.code], start: e.target.value } },
                          }))
                        }
                      />
                      <input
                        type="time"
                        aria-label={`${d.label} end time`}
                        disabled={!form.schedule[d.code].on}
                        value={form.schedule[d.code].end}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            schedule: { ...f.schedule, [d.code]: { ...f.schedule[d.code], end: e.target.value } },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save Instructor"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
