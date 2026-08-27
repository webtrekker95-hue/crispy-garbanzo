"use client";

import { useState } from "react";
import styles from "./bookings.module.css";

export type BookingRow = {
  id: string;
  date: string; // ISO
  timeSlot: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  paymentMethod: "CASH" | "BANK_TRANSFER";
  paymentStatus: "PENDING" | "CONFIRMED";
  packageName: string;
  instructorName: string;
  canCancel: boolean;
};

const badgeClass: Record<BookingRow["status"], string> = {
  PENDING: "badge-pending",
  CONFIRMED: "badge-confirmed",
  CANCELLED: "badge-cancelled",
};

function Row({ booking, onCancelled }: { booking: BookingRow; onCancelled: (id: string) => void }) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const date = new Date(booking.date);

  async function handleCancel() {
    setCancelling(true);
    setError(null);
    const res = await fetch(`/api/bookings/${booking.id}/cancel`, { method: "PATCH" });
    const data = await res.json();
    setCancelling(false);
    if (!res.ok) {
      setError(data.error ?? "Could not cancel this booking.");
      return;
    }
    onCancelled(booking.id);
  }

  return (
    <div>
      <div className={styles.row}>
        <div className={styles["date-box"]}>
          <div className={styles.month}>{date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}</div>
          <div className={styles.day}>{date.getUTCDate()}</div>
          <div className={styles.year}>{date.getUTCFullYear()}</div>
        </div>
        <div className={styles.info}>
          <div className={styles.title}>{booking.packageName} Package Lesson</div>
          <div className={styles.meta}>
            <span>⏰ {booking.timeSlot}</span>
            <span>👨‍🏫 {booking.instructorName}</span>
            <span>{booking.paymentMethod === "CASH" ? "💵 Cash" : "🏦 Bank Transfer"}</span>
          </div>
        </div>
        <span className={`${styles.badge} ${styles[badgeClass[booking.status]]}`}>
          {booking.status === "CONFIRMED" ? "✓ Confirmed" : booking.status === "PENDING" ? "Pending Payment" : "Cancelled"}
        </span>
        {booking.canCancel && (
          <div className={styles.actions}>
            <button className="btn btn-outline" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling…" : "Cancel"}
            </button>
          </div>
        )}
      </div>
      {error && <p className={styles["error-banner"]} style={{ marginTop: 8 }}>{error}</p>}
    </div>
  );
}

export function BookingsList({ initial }: { initial: BookingRow[] }) {
  const [bookings, setBookings] = useState(initial);

  function handleCancelled(id: string) {
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, status: "CANCELLED", canCancel: false } : b)));
  }

  const now = Date.now();
  const upcoming = bookings.filter((b) => b.status !== "CANCELLED" && new Date(b.date).getTime() >= new Date().setUTCHours(0, 0, 0, 0));
  const history = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div>
      <div className={styles["section-label"]}>Upcoming</div>
      {upcoming.length === 0 ? (
        <div className={styles["empty-state"]}>No upcoming bookings. <a href="/booking">Book a lesson →</a></div>
      ) : (
        <div className={styles.list}>
          {upcoming.map((b) => (
            <Row key={b.id} booking={b} onCancelled={handleCancelled} />
          ))}
        </div>
      )}

      {history.length > 0 && (
        <>
          <div className={styles["section-label"]}>History</div>
          <div className={styles.list}>
            {history.map((b) => (
              <Row key={b.id} booking={b} onCancelled={handleCancelled} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
