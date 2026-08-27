"use client";

import { useState } from "react";

export type AdminBookingRow = {
  id: string;
  studentName: string;
  packageName: string;
  dateLabel: string;
  timeSlot: string;
  instructorName: string;
  paymentMethod: "CASH" | "BANK_TRANSFER";
  paymentStatus: "PENDING" | "CONFIRMED";
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  price: number;
};

export function AdminBookingActions({
  booking,
  onUpdated,
}: {
  booking: AdminBookingRow;
  onUpdated: (id: string, patch: Partial<AdminBookingRow>) => void;
}) {
  const [modal, setModal] = useState<"confirm" | "cancel" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmPayment() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/bookings/${booking.id}/confirm-payment`, { method: "PATCH" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not confirm payment.");
      return;
    }
    onUpdated(booking.id, { paymentStatus: "CONFIRMED", status: "CONFIRMED" });
    setModal(null);
  }

  async function cancelBooking() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, { method: "PATCH" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not cancel this booking.");
      return;
    }
    onUpdated(booking.id, { status: "CANCELLED" });
    setModal(null);
  }

  return (
    <>
      <div className="action-btns">
        {booking.status !== "CANCELLED" && booking.paymentStatus === "PENDING" && (
          <button className="btn btn-sm btn-success" onClick={() => setModal("confirm")}>Confirm Pay</button>
        )}
        {booking.status !== "CANCELLED" && (
          <button className="btn btn-sm btn-danger" onClick={() => setModal("cancel")}>Cancel</button>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => !busy && setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {modal === "confirm" ? (
              <>
                <div className="modal-title">Confirm Payment</div>
                <div className="modal-sub">Mark this booking&apos;s payment as received and confirm the lesson.</div>
              </>
            ) : (
              <>
                <div className="modal-title">Cancel Booking</div>
                <div className="modal-sub">This will cancel the lesson and free up the time slot. This can&apos;t be undone.</div>
              </>
            )}
            <div className="modal-detail">
              <strong>{booking.studentName}</strong> · {booking.packageName}
              <br />
              {booking.dateLabel} · {booking.timeSlot} · {booking.instructorName}
              <br />
              SRD {booking.price.toLocaleString()} · {booking.paymentMethod === "CASH" ? "Cash" : "Bank Transfer"}
            </div>
            {error && <p className="status-banner-error">{error}</p>}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setModal(null)} disabled={busy}>Close</button>
              {modal === "confirm" ? (
                <button className="btn btn-primary" onClick={confirmPayment} disabled={busy}>
                  {busy ? "Confirming…" : "Confirm Payment"}
                </button>
              ) : (
                <button className="btn btn-danger" onClick={cancelBooking} disabled={busy}>
                  {busy ? "Cancelling…" : "Cancel Booking"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
