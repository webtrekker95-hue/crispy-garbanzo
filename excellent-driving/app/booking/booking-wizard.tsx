"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./booking.module.css";

type Pkg = { id: string; nameEn: string; price: number };
type Instructor = { id: string; name: string; yearsExperience: number | null; availableDays: string };

const stepLabels = ["Package", "Instructor", "Date", "Time Slot", "Payment"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayNamesFull = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function BookingWizard({ packages, instructors }: { packages: Pkg[]; instructors: Instructor[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [instructorId, setInstructorId] = useState(instructors[0]?.id ?? "");
  const [payment, setPayment] = useState<"CASH" | "BANK_TRANSFER">("CASH");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [slots, setSlots] = useState<{ label: string; booked: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const selectedPackage = packages.find((p) => p.id === packageId);
  const selectedInstructor = instructors.find((i) => i.id === instructorId);
  const dateStr = selectedDay ? `${calYear}-${pad(calMonth + 1)}-${pad(selectedDay)}` : null;
  const dateLabel = selectedDay
    ? `${dayNamesFull[new Date(calYear, calMonth, selectedDay).getDay()]}, ${monthNames[calMonth].slice(0, 3)} ${selectedDay}`
    : null;

  useEffect(() => {
    setTimeSlot(null);
    if (!instructorId || !dateStr) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    fetch(`/api/bookings/slots?instructorId=${instructorId}&date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setSlotsLoading(false));
  }, [instructorId, dateStr]);

  function goStep(n: number) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleConfirm() {
    if (!dateStr || !timeSlot) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId,
        instructorId,
        date: dateStr,
        timeSlot,
        paymentMethod: payment,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setConfirmedBooking(data.booking);
    goStep(6);
  }

  const monthCells = useMemo(() => {
    const first = new Date(calYear, calMonth, 1).getDay();
    const total = new Date(calYear, calMonth + 1, 0).getDate();
    const cells: { day: number | null; kind: string }[] = [];
    for (let i = 0; i < first; i++) cells.push({ day: null, kind: "empty" });
    for (let d = 1; d <= total; d++) {
      const date = new Date(calYear, calMonth, d);
      let kind = "available";
      if (date.getDay() === 0) kind = "sunday";
      else if (date < today) kind = "past";
      if (
        d === today.getDate() &&
        calMonth === today.getMonth() &&
        calYear === today.getFullYear()
      ) {
        kind += " today";
      }
      cells.push({ day: d, kind });
    }
    return cells;
  }, [calYear, calMonth, today]);

  const isPastMonth =
    calYear < today.getFullYear() ||
    (calYear === today.getFullYear() && calMonth <= today.getMonth());

  return (
    <div className={styles["booking-wrap"]}>
      <div className={styles["booking-header"]}>
        <h1>Book Your Driving Lesson</h1>
        <p>Complete the steps below to reserve your slot. Takes less than 2 minutes.</p>
      </div>

      <div className={styles["progress-bar"]}>
        {stepLabels.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "active" : "pending";
          return (
            <div key={label} style={{ display: "contents" }}>
              <div className={`${styles["step-item"]} ${styles[state]}`}>
                <div className={styles["step-circle"]}>{n < step ? "✓" : n}</div>
                <div className={styles["step-label"]}>{label}</div>
              </div>
              {n < 5 && (
                <div className={`${styles["step-connector"]} ${styles[n < step ? "done" : "pending"]}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className={styles["booking-layout"]}>
        <div>
          {step === 1 && (
            <div className={styles["step-panel"]}>
              <div className={styles["step-card"]}>
                <div className={styles["step-card-title"]}>Choose a Package</div>
                <div className={styles["step-card-sub"]}>Select the driving package you&apos;d like to enroll in.</div>
                <div className={styles["pkg-options"]}>
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      role="button"
                      tabIndex={0}
                      className={`${styles["pkg-option"]}${pkg.id === packageId ? ` ${styles.selected}` : ""}`}
                      onClick={() => setPackageId(pkg.id)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPackageId(pkg.id)}
                    >
                      <div className={styles["pkg-opt-name"]}>{pkg.nameEn}</div>
                      <div className={styles["pkg-opt-lessons"]}>Theory access + WhatsApp support</div>
                      <div className={styles["pkg-opt-price"]}>
                        SRD {pkg.price.toLocaleString()} <span>/ package</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles["nav-btns"]}>
                <span></span>
                <button className="btn btn-primary btn-lg" onClick={() => goStep(2)} disabled={!packageId}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles["step-panel"]}>
              <div className={styles["step-card"]}>
                <div className={styles["step-card-title"]}>Choose an Instructor</div>
                <div className={styles["step-card-sub"]}>All instructors are certified. Pick the one that suits your preference.</div>
                <div className={styles["instructor-options"]}>
                  {instructors.map((inst) => (
                    <div
                      key={inst.id}
                      role="button"
                      tabIndex={0}
                      className={`${styles["instructor-option"]}${inst.id === instructorId ? ` ${styles.selected}` : ""}`}
                      onClick={() => setInstructorId(inst.id)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setInstructorId(inst.id)}
                    >
                      <div className={styles["inst-avatar"]} aria-hidden="true">👤</div>
                      <div className={styles["inst-name"]}>{inst.name}</div>
                      <div className={styles["inst-exp"]}>{inst.yearsExperience} years exp.</div>
                      <div className={styles["inst-avail"]}>{inst.availableDays}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles["nav-btns"]}>
                <button className="btn btn-outline" onClick={() => goStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={() => goStep(3)} disabled={!instructorId}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles["step-panel"]}>
              <div className={styles["step-card"]}>
                <div className={styles["step-card-title"]}>Choose a Date</div>
                <div className={styles["step-card-sub"]}>Pick a date for your lesson. Sundays are unavailable.</div>
                <div className={styles["calendar-wrap"]}>
                  <div className={styles["cal-header"]}>
                    <button
                      className={styles["cal-nav"]}
                      disabled={isPastMonth}
                      onClick={() => {
                        setCalMonth((m) => (m === 0 ? 11 : m - 1));
                        if (calMonth === 0) setCalYear((y) => y - 1);
                        setSelectedDay(null);
                      }}
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <h3>{monthNames[calMonth]} {calYear}</h3>
                    <button
                      className={styles["cal-nav"]}
                      onClick={() => {
                        setCalMonth((m) => (m === 11 ? 0 : m + 1));
                        if (calMonth === 11) setCalYear((y) => y + 1);
                        setSelectedDay(null);
                      }}
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                  <div className={styles["cal-grid"]}>
                    {dayNamesShort.map((d) => (
                      <div className={styles["cal-day-name"]} key={d}>{d}</div>
                    ))}
                    {monthCells.map((cell, idx) => {
                      if (cell.day === null) {
                        return <div className={`${styles["cal-day"]} ${styles.empty}`} key={idx} />;
                      }
                      const clickable = cell.kind.startsWith("available");
                      const kindClasses = cell.kind
                        .split(" ")
                        .map((k) => styles[k])
                        .filter(Boolean)
                        .join(" ");
                      const isSelected = selectedDay === cell.day;
                      return (
                        <div
                          key={idx}
                          className={`${styles["cal-day"]} ${kindClasses}${isSelected ? ` ${styles.selected}` : ""}`}
                          role={clickable ? "button" : undefined}
                          tabIndex={clickable ? 0 : undefined}
                          onClick={() => clickable && setSelectedDay(cell.day)}
                          onKeyDown={(e) =>
                            clickable && (e.key === "Enter" || e.key === " ") && setSelectedDay(cell.day)
                          }
                        >
                          {cell.day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className={styles["nav-btns"]}>
                <button className="btn btn-outline" onClick={() => goStep(2)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={() => goStep(4)} disabled={!selectedDay}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles["step-panel"]}>
              <div className={styles["step-card"]}>
                <div className={styles["step-card-title"]}>Choose a Time Slot</div>
                <div className={styles["step-card-sub"]}>
                  {slotsLoading
                    ? "Loading availability…"
                    : `Available slots for ${selectedInstructor?.name} on ${dateLabel}.`}
                </div>
                {!slotsLoading && slots.length === 0 && (
                  <p style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                    No slots available that day — try another date.
                  </p>
                )}
                {!slotsLoading && slots.length > 0 && (
                  <div className={styles["time-groups"]}>
                    <div>
                      <div className={styles["time-group-label"]}>🌅 Morning</div>
                      <div className={styles["time-slots"]}>
                        {slots.filter((s) => s.label.endsWith("AM")).map((s) => (
                          <button
                            key={s.label}
                            className={`${styles["time-slot"]}${s.booked ? ` ${styles.booked}` : ""}${timeSlot === s.label ? ` ${styles.selected}` : ""}`}
                            disabled={s.booked}
                            onClick={() => setTimeSlot(s.label)}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className={styles["time-group-label"]}>☀️ Afternoon</div>
                      <div className={styles["time-slots"]}>
                        {slots.filter((s) => s.label.endsWith("PM")).map((s) => (
                          <button
                            key={s.label}
                            className={`${styles["time-slot"]}${s.booked ? ` ${styles.booked}` : ""}${timeSlot === s.label ? ` ${styles.selected}` : ""}`}
                            disabled={s.booked}
                            onClick={() => setTimeSlot(s.label)}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--gray-50)", borderRadius: 8, fontSize: "0.78rem", color: "var(--gray-600)" }}>
                  <strong style={{ color: "var(--navy)" }}>Greyed-out slots</strong> are already booked. Each lesson is 50 minutes.
                </div>
              </div>
              <div className={styles["nav-btns"]}>
                <button className="btn btn-outline" onClick={() => goStep(3)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={() => goStep(5)} disabled={!timeSlot}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className={styles["step-panel"]}>
              <div className={styles["step-card"]}>
                <div className={styles["step-card-title"]}>Choose Payment Method</div>
                <div className={styles["step-card-sub"]}>Select how you&apos;d like to pay for your package.</div>
                <div className={styles["payment-options"]}>
                  <div
                    role="button"
                    tabIndex={0}
                    className={`${styles["pay-option"]}${payment === "CASH" ? ` ${styles.selected}` : ""}`}
                    onClick={() => setPayment("CASH")}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPayment("CASH")}
                  >
                    <div className={styles["pay-icon"]} aria-hidden="true">💵</div>
                    <div className={styles["pay-name"]}>Cash Payment</div>
                    <div className={styles["pay-desc"]}>Pay in person at our school, Bonistraat 44. Bring exact amount.</div>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className={`${styles["pay-option"]}${payment === "BANK_TRANSFER" ? ` ${styles.selected}` : ""}`}
                    onClick={() => setPayment("BANK_TRANSFER")}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPayment("BANK_TRANSFER")}
                  >
                    <div className={styles["pay-icon"]} aria-hidden="true">🏦</div>
                    <div className={styles["pay-name"]}>Bank Transfer</div>
                    <div className={styles["pay-desc"]}>Transfer to our account. Admin will confirm after receipt of payment.</div>
                  </div>
                </div>
                <div style={{ marginTop: 20, padding: 16, background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: 10 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>💡 Payment Note</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--gray-600)", lineHeight: 1.5 }}>
                    Your booking will be marked <strong>Pending</strong> until payment is confirmed. You&apos;ll receive a
                    WhatsApp message when your booking is confirmed.
                  </div>
                </div>
                {error && <p className={styles["error-banner"]} style={{ marginTop: 16 }}>{error}</p>}
              </div>
              <div className={styles["nav-btns"]}>
                <button className="btn btn-outline" onClick={() => goStep(4)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={handleConfirm} disabled={submitting}>
                  {submitting ? "Confirming…" : "Confirm Booking →"}
                </button>
              </div>
            </div>
          )}

          {step === 6 && confirmedBooking && (
            <div className={styles["step-panel"]}>
              <div className={styles["confirm-header"]}>
                <div className={styles["confirm-check"]}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="4 12.5 9.5 18 20 6"></polyline>
                  </svg>
                </div>
                <h2>Booking Confirmed!</h2>
                <p>Your lesson has been booked. You&apos;ll be contacted about payment confirmation.</p>
              </div>

              <div className={styles["confirm-details"]}>
                <div className={styles["confirm-row"]}>
                  <div className={styles["confirm-key"]}>📦 Package</div>
                  <div className={styles["confirm-val"]}>{confirmedBooking.package.nameEn}</div>
                </div>
                <div className={styles["confirm-row"]}>
                  <div className={styles["confirm-key"]}>👨‍🏫 Instructor</div>
                  <div className={styles["confirm-val"]}>{confirmedBooking.instructor.user.name}</div>
                </div>
                <div className={styles["confirm-row"]}>
                  <div className={styles["confirm-key"]}>📅 Date</div>
                  <div className={styles["confirm-val"]}>{dateLabel}, {calYear}</div>
                </div>
                <div className={styles["confirm-row"]}>
                  <div className={styles["confirm-key"]}>⏰ Time</div>
                  <div className={styles["confirm-val"]}>{confirmedBooking.timeSlot}</div>
                </div>
                <div className={styles["confirm-row"]}>
                  <div className={styles["confirm-key"]}>💵 Payment</div>
                  <div className={styles["confirm-val"]}>
                    {payment === "CASH" ? "Cash" : "Bank Transfer"} · SRD {selectedPackage?.price.toLocaleString()}
                  </div>
                </div>
                <div className={styles["confirm-row"]}>
                  <div className={styles["confirm-key"]}>🔖 Status</div>
                  <div className={styles["confirm-val"]}>
                    <span style={{ background: "rgba(245,166,35,0.15)", color: "#b45309", padding: "4px 10px", borderRadius: 100, fontSize: "0.8rem" }}>
                      Pending Payment
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles["wa-notice"]}>
                <div className={styles["wa-notice-icon"]} aria-hidden="true">📱</div>
                <p>
                  A <strong>WhatsApp confirmation</strong> will be sent to your number once WhatsApp integration is
                  live. For now, your booking is saved and pending payment confirmation from our team.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => router.push("/student/dashboard")}
                >
                  Go to Dashboard
                </button>
                <button
                  className="btn btn-outline btn-lg"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => router.push("/")}
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>

        {step < 6 && (
          <div>
            <div className={styles["summary-card"]}>
              <div className={styles["summary-title"]}>Booking Summary</div>
              <div className={styles["summary-item"]}>
                <div className={styles["summary-key"]}>Package</div>
                <div className={styles["summary-val"]}>{selectedPackage?.nameEn ?? "—"}</div>
              </div>
              <div className={styles["summary-item"]}>
                <div className={styles["summary-key"]}>Instructor</div>
                <div className={styles["summary-val"]}>{selectedInstructor?.name ?? "—"}</div>
              </div>
              <div className={styles["summary-item"]}>
                <div className={styles["summary-key"]}>Date</div>
                <div className={`${styles["summary-val"]}${!dateLabel ? ` ${styles.empty}` : ""}`}>
                  {dateLabel ?? "Not selected"}
                </div>
              </div>
              <div className={styles["summary-item"]}>
                <div className={styles["summary-key"]}>Time</div>
                <div className={`${styles["summary-val"]}${!timeSlot ? ` ${styles.empty}` : ""}`}>
                  {timeSlot ?? "Not selected"}
                </div>
              </div>
              <div className={styles["summary-item"]}>
                <div className={styles["summary-key"]}>Payment</div>
                <div className={styles["summary-val"]}>{payment === "CASH" ? "Cash" : "Bank Transfer"}</div>
              </div>
              <div className={styles["summary-total"]}>
                <div className={styles["summary-total-label"]}>Total</div>
                <div className={styles["summary-total-price"]}>
                  SRD {selectedPackage?.price.toLocaleString() ?? "0"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
