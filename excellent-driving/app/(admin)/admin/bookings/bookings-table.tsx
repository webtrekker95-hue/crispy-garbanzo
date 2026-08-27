"use client";

import { useMemo, useState } from "react";
import { AdminBookingActions, type AdminBookingRow } from "@/components/admin-booking-actions";
import styles from "./bookings.module.css";

type Row = AdminBookingRow & { dateISO: string; instructorId: string };

const avatarColors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function toCsv(rows: Row[]) {
  const header = ["Student", "Package", "Date", "Time", "Instructor", "Payment Method", "Payment Status", "Status", "Price (SRD)"];
  const lines = rows.map((r) =>
    [r.studentName, r.packageName, r.dateISO, r.timeSlot, r.instructorName, r.paymentMethod, r.paymentStatus, r.status, r.price]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export function BookingsTable({
  initial,
  instructors,
}: {
  initial: Row[];
  instructors: { id: string; name: string }[];
}) {
  const [rows, setRows] = useState(initial);
  const [status, setStatus] = useState("all");
  const [instructorId, setInstructorId] = useState("all");
  const [search, setSearch] = useState("");

  function handleUpdated(id: string, patch: Partial<AdminBookingRow>) {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (instructorId !== "all" && r.instructorId !== instructorId) return false;
      if (search && !r.studentName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, status, instructorId, search]);

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className={styles["filter-bar"]}>
        <div className="search-bar">
          <span aria-hidden="true">🔍</span> <input
            type="search"
            placeholder="Search student…"
            aria-label="Search by student name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} aria-label="Filter by instructor">
          <option value="all">All instructors</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <div className={styles["filter-spacer"]} />
        <div className={styles["result-count"]}>{filtered.length} of {rows.length} bookings</div>
        <button className="btn btn-outline btn-sm" onClick={exportCsv}>Export CSV</button>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">No bookings match these filters.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Package</th>
                  <th>Date &amp; Time</th>
                  <th>Instructor</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                          {initials(b.studentName)}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{b.studentName}</div>
                      </div>
                    </td>
                    <td>{b.packageName}</td>
                    <td>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{b.dateLabel}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--gray-600)" }}>{b.timeSlot}</div>
                    </td>
                    <td>{b.instructorName}</td>
                    <td>
                      <span className={`badge ${b.paymentMethod === "CASH" ? "badge-cash" : "badge-transfer"}`}>
                        {b.paymentMethod === "CASH" ? "💵 Cash" : "🏦 Transfer"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${b.status === "CONFIRMED" ? "badge-confirmed" : b.status === "CANCELLED" ? "badge-cancelled" : "badge-pending"}`}>
                        {b.status === "CONFIRMED" ? "✓ Confirmed" : b.status === "CANCELLED" ? "✗ Cancelled" : "⏳ Pending"}
                      </span>
                    </td>
                    <td>
                      <AdminBookingActions booking={b} onUpdated={handleUpdated} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
