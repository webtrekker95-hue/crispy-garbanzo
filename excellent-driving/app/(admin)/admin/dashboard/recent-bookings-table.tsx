"use client";

import { useState } from "react";
import { AdminBookingActions, type AdminBookingRow } from "@/components/admin-booking-actions";

const avatarColors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function RecentBookingsTable({ initial }: { initial: AdminBookingRow[] }) {
  const [rows, setRows] = useState(initial);

  function handleUpdated(id: string, patch: Partial<AdminBookingRow>) {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (rows.length === 0) {
    return <div className="empty-state">No bookings yet.</div>;
  }

  return (
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
          {rows.map((b, i) => (
            <tr key={b.id}>
              <td>
                <div className="student-cell">
                  <div className="student-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                    {initials(b.studentName)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{b.studentName}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--gray-600)" }}>{b.packageName}</div>
                  </div>
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
  );
}
