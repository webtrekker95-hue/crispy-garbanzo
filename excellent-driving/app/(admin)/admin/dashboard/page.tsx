import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecentBookingsTable } from "./recent-bookings-table";
import styles from "./dashboard.module.css";

function startOfWeek() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  return d;
}

const payAvatarColors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export default async function AdminDashboardPage() {
  const [totalStudents, bookingsThisWeek, pendingBookings, activePackages, recentBookings] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.booking.count({ where: { createdAt: { gte: startOfWeek() } } }),
    prisma.booking.findMany({
      where: { paymentStatus: "PENDING", status: { not: "CANCELLED" } },
      include: { student: true, package: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.package.count({ where: { isActive: true } }),
    prisma.booking.findMany({
      include: { student: true, package: true, instructor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const pendingTotal = pendingBookings.reduce((sum, b) => sum + Number(b.package.price), 0);
  const bankTransferPending = pendingBookings.filter((b) => b.paymentMethod === "BANK_TRANSFER").length;

  const rows = recentBookings.map((b) => ({
    id: b.id,
    studentName: b.student.name,
    packageName: b.package.nameEn,
    dateLabel: b.date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    timeSlot: b.timeSlot,
    instructorName: b.instructor.user.name,
    paymentMethod: b.paymentMethod,
    paymentStatus: b.paymentStatus,
    status: b.status,
    price: Number(b.package.price),
  }));

  return (
    <div>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "rgba(59,130,246,0.1)" }} aria-hidden="true">👥</div>
          </div>
          <div className="stat-num">{totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "rgba(16,185,129,0.1)" }} aria-hidden="true">📅</div>
          </div>
          <div className="stat-num">{bookingsThisWeek}</div>
          <div className="stat-label">Bookings This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "rgba(245,166,35,0.12)" }} aria-hidden="true">💰</div>
            <div className="stat-trend trend-neutral">{pendingBookings.length} pending</div>
          </div>
          <div className="stat-num">SRD {pendingTotal.toLocaleString()}</div>
          <div className="stat-label">Pending Payments</div>
          <div className="stat-sub">{bankTransferPending} bank transfers</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "rgba(245,166,35,0.12)" }} aria-hidden="true">📦</div>
          </div>
          <div className="stat-num">{activePackages}</div>
          <div className="stat-label">Active Packages</div>
        </div>
      </div>

      <div className={styles["grid-3-1"]}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Bookings</div>
            <Link href="/admin/bookings" className="card-action">View all →</Link>
          </div>
          <RecentBookingsTable initial={rows} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Quick Actions</div>
            </div>
            <div className="card-body">
              <div className={styles["quick-actions"]}>
                <Link href="/admin/packages" className={styles["qa-btn"]}>
                  <div className={styles["qa-icon"]} aria-hidden="true">📦</div> Add Package
                </Link>
                <Link href="/admin/instructors" className={styles["qa-btn"]}>
                  <div className={styles["qa-icon"]} aria-hidden="true">👨‍🏫</div> Add Instructor
                </Link>
                <Link href="/admin/bookings" className={styles["qa-btn"]}>
                  <div className={styles["qa-icon"]} aria-hidden="true">📅</div> View All Bookings
                </Link>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Pending Payments</div>
            </div>
            <div className="card-body">
              {pendingBookings.length === 0 ? (
                <div className="empty-state" style={{ padding: "12px 0" }}>No payments pending.</div>
              ) : (
                pendingBookings.slice(0, 5).map((b, i) => (
                  <div className={styles["payment-item"]} key={b.id}>
                    <div className={styles["pay-avatar"]} style={{ background: payAvatarColors[i % payAvatarColors.length] }}>
                      {b.student.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className={styles["pay-info"]}>
                      <div className={styles["pay-name"]}>{b.student.name}</div>
                      <div className={styles["pay-detail"]}>{b.package.nameEn} · {b.paymentMethod === "CASH" ? "Cash" : "Bank Transfer"}</div>
                    </div>
                    <div className={styles["pay-amount"]}>SRD {Number(b.package.price).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
