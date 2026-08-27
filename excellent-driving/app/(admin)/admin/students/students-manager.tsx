"use client";

import { useMemo, useState } from "react";

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  language: "EN" | "NL";
  courseAccess: boolean;
  createdAt: string;
  bookingsCount: number;
  lessonsCompleted: number;
  totalLessons: number;
  moduleBreakdown: { title: string; completed: number; total: number }[];
};

const avatarColors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function StudentsManager({ initial }: { initial: StudentRow[] }) {
  const [students, setStudents] = useState(initial);
  const [search, setSearch] = useState("");
  const [progressFor, setProgressFor] = useState<StudentRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())),
    [students, search]
  );

  async function toggleAccess(student: StudentRow) {
    setBusyId(student.id);
    const res = await fetch(`/api/admin/students/${student.id}/access`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseAccess: !student.courseAccess }),
    });
    setBusyId(null);
    if (res.ok) {
      setStudents((list) => list.map((s) => (s.id === student.id ? { ...s, courseAccess: !s.courseAccess } : s)));
    }
  }

  return (
    <div>
      <div className="search-bar" style={{ marginBottom: 16 }}>
        🔍 <input type="search" placeholder="Search students…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">No students found.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Contact</th>
                  <th>Bookings</th>
                  <th>Progress</th>
                  <th>Course Access</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>{initials(s.name)}</div>
                        <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{s.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.8rem" }}>{s.email}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--gray-600)" }}>{s.phone || "—"}</div>
                    </td>
                    <td>{s.bookingsCount}</td>
                    <td>{s.lessonsCompleted}/{s.totalLessons} lessons</td>
                    <td>
                      <span className={`badge ${s.courseAccess ? "badge-active" : "badge-inactive"}`}>
                        {s.courseAccess ? "Granted" : "Revoked"}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => setProgressFor(s)}>View Progress</button>
                        <button
                          className={`btn btn-sm ${s.courseAccess ? "btn-danger" : "btn-success"}`}
                          onClick={() => toggleAccess(s)}
                          disabled={busyId === s.id}
                        >
                          {s.courseAccess ? "Revoke Access" : "Grant Access"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {progressFor && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setProgressFor(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{progressFor.name}&apos;s Progress</div>
            <div className="modal-sub">{progressFor.lessonsCompleted} of {progressFor.totalLessons} lessons completed overall.</div>
            {progressFor.moduleBreakdown.map((m) => (
              <div key={m.title} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: "var(--navy)" }}>{m.title}</span>
                  <span style={{ color: "var(--gray-600)" }}>{m.completed}/{m.total}</span>
                </div>
                <div style={{ height: 6, background: "var(--gray-100)", borderRadius: 100, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${m.total > 0 ? (m.completed / m.total) * 100 : 0}%`,
                      background: "var(--amber)",
                      borderRadius: 100,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setProgressFor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
