import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStudentModuleStates, getStudentDashboardStats } from "@/lib/progress";
import styles from "./dashboard.module.css";

const moduleIcons = ["📖", "🚦", "🛣️", "🚗", "🏁"];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  const studentId = session!.user.id;
  const firstName = (session!.user.name ?? "Student").split(" ")[0];

  const [moduleStates, stats, nextBooking, recentProgress, recentBookings] = await Promise.all([
    getStudentModuleStates(studentId),
    getStudentDashboardStats(studentId),
    prisma.booking.findFirst({
      where: { studentId, status: { not: "CANCELLED" }, date: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) } },
      orderBy: { date: "asc" },
      include: { instructor: { include: { user: true } }, package: true },
    }),
    prisma.studentProgress.findMany({
      where: { studentId, completedAt: { not: null } },
      include: { lesson: true, module: true },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { studentId },
      include: { instructor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalLessons = moduleStates.reduce((sum, m) => sum + m.totalLessons, 0);
  const totalCompleted = moduleStates.reduce((sum, m) => sum + m.completedCount, 0);
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const activePackageName =
    (await prisma.booking.findFirst({ where: { studentId }, include: { package: true }, orderBy: { createdAt: "desc" } }))
      ?.package.nameEn ?? null;

  const activity = [
    ...recentProgress.map((p) => ({
      time: p.completedAt!,
      icon: p.status === "PASSED" ? "✅" : "📚",
      bg: p.status === "PASSED" ? "var(--green-light)" : "rgba(245,166,35,0.12)",
      text:
        p.lesson.type === "QUIZ"
          ? `You ${p.status === "PASSED" ? "passed" : "attempted"} Quiz: ${p.lesson.title}${p.score !== null ? ` with a score of ${p.score}%` : ""}`
          : `You completed ${p.lesson.title} in ${p.module.titleEn}`,
    })),
    ...recentBookings.map((b) => ({
      time: b.createdAt,
      icon: "📅",
      bg: "rgba(59,130,246,0.1)",
      text: `Lesson with ${b.instructor.user.name} on ${b.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })} was booked (${b.status.toLowerCase()})`,
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5);

  function timeAgo(date: Date) {
    const diffMs = Date.now() - date.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  }

  return (
    <>
      <div className={styles["welcome-banner"]}>
        <div>
          <div className={styles["welcome-title"]}>{greeting()}, {firstName}! 👋</div>
          <div className={styles["welcome-sub"]}>
            {totalCompleted > 0 ? "You're making great progress. Keep it up!" : "Ready to start your first lesson?"}
          </div>
          {totalLessons > 0 && (
            <div className={styles["progress-pill"]}>
              <div className={styles.dot}></div> {overallPct}% through your course
              {activePackageName ? ` · ${activePackageName} Package` : ""}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <Link href="/student/learn" className={`btn ${styles["btn-amber"]}`}>Continue Learning →</Link>
          <Link href="/booking" className={`btn ${styles["btn-outline-white"]}`}>Book a Lesson</Link>
        </div>
      </div>

      <div className={styles["stats-row"]}>
        <div className={styles["stat-card"]}>
          <div className={styles["stat-card-top"]}>
            <div className={styles["stat-icon"]} style={{ background: "rgba(16,185,129,0.1)" }} aria-hidden="true">✅</div>
          </div>
          <div className={styles["stat-num"]}>{stats.lessonsCompleted}</div>
          <div className={styles["stat-label"]}>Lessons Completed</div>
        </div>
        <div className={styles["stat-card"]}>
          <div className={styles["stat-card-top"]}>
            <div className={styles["stat-icon"]} style={{ background: "rgba(245,166,35,0.12)" }} aria-hidden="true">🎯</div>
          </div>
          <div className={styles["stat-num"]}>{stats.quizzesPassed}</div>
          <div className={styles["stat-label"]}>Quizzes Passed</div>
        </div>
        <div className={styles["stat-card"]}>
          <div className={styles["stat-card-top"]}>
            <div className={styles["stat-icon"]} style={{ background: "rgba(59,130,246,0.1)" }} aria-hidden="true">📅</div>
          </div>
          <div className={styles["stat-num"]}>{stats.upcomingBookings}</div>
          <div className={styles["stat-label"]}>Upcoming Bookings</div>
        </div>
        <div className={styles["stat-card"]}>
          <div className={styles["stat-card-top"]}>
            <div className={styles["stat-icon"]} style={{ background: "rgba(245,166,35,0.12)" }} aria-hidden="true">⭐</div>
          </div>
          <div className={styles["stat-num"]}>{stats.avgQuizScore !== null ? `${stats.avgQuizScore}%` : "—"}</div>
          <div className={styles["stat-label"]}>Average Quiz Score</div>
        </div>
      </div>

      <div className={styles["grid-3-1"]}>
        <div className={styles.card}>
          <div className={styles["card-header"]}>
            <div className={styles["card-title"]}>Course Progress</div>
            <Link className={styles["card-action"]} href="/student/learn">View all modules →</Link>
          </div>
          <div className={styles["card-body"]}>
            {moduleStates.map((m, i) => {
              const statusLabel = m.complete ? "Done" : !m.unlocked ? "Locked" : m.completedCount > 0 ? "In Progress" : "Not Started";
              const statusClass = m.complete ? styles["status-done"] : !m.unlocked ? styles["status-locked"] : styles["status-progress"];
              const fillColor = m.complete ? "var(--green)" : !m.unlocked ? "var(--gray-200)" : "var(--amber)";
              return (
                <div className={styles["module-item"]} key={m.module.id}>
                  <div className={styles["module-icon"]} style={{ background: m.complete ? "var(--green-light)" : !m.unlocked ? "var(--gray-100)" : "rgba(245,166,35,0.12)" }} aria-hidden="true">
                    {moduleIcons[i] ?? "📘"}
                  </div>
                  <div className={styles["module-info"]}>
                    <div className={styles["module-name"]}>Module {i + 1}: {m.module.titleEn}</div>
                    <div className={styles["progress-bar-wrap"]}>
                      <div className={styles["progress-fill"]} style={{ width: `${m.pct}%`, background: fillColor }}></div>
                    </div>
                    <div className={styles["module-meta"]}>
                      <span className={styles["module-pct"]} style={{ color: fillColor === "var(--gray-200)" ? "var(--gray-600)" : fillColor }}>{m.pct}%</span>
                      <span className={styles["module-lessons"]}>{m.completedCount}/{m.totalLessons} lessons</span>
                    </div>
                  </div>
                  <div className={styles["module-status"]}>
                    <span className={`${styles["status-pill"]} ${statusClass}`}>
                      {!m.unlocked && "🔒 "}{statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className={styles.card}>
            <div className={styles["card-header"]}>
              <div className={styles["card-title"]}>Next Lesson</div>
              <Link className={styles["card-action"]} href="/student/bookings">View all</Link>
            </div>
            <div className={styles["card-body"]} style={{ padding: 16 }}>
              {nextBooking ? (
                <div className={styles["booking-card"]}>
                  <div className={styles["booking-date-box"]}>
                    <div className={styles["booking-month"]}>{nextBooking.date.toLocaleDateString("en-US", { month: "short" })}</div>
                    <div className={styles["booking-day"]}>{nextBooking.date.getUTCDate()}</div>
                    <div className={styles["booking-dow"]}>{nextBooking.date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                  </div>
                  <div className={styles["booking-info"]}>
                    <div className={styles["booking-title"]}>{nextBooking.package.nameEn} Package Lesson</div>
                    <div className={styles["booking-meta"]}>
                      <div className={styles["booking-meta-item"]}>⏰ {nextBooking.timeSlot}</div>
                      <div className={styles["booking-meta-item"]}>👨‍🏫 {nextBooking.instructor.user.name}</div>
                      <div className={styles["booking-meta-item"]}>📍 Bonistraat 44</div>
                    </div>
                    <div className={nextBooking.status === "CONFIRMED" ? styles["booking-confirmed"] : styles["booking-pending"]}>
                      {nextBooking.status === "CONFIRMED" ? "✓ Confirmed" : "⏳ Pending Payment"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles["empty-state"]}>No upcoming lessons booked yet.</div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles["card-header"]}>
              <div className={styles["card-title"]}>Quick Links</div>
            </div>
            <div className={styles["card-body"]} style={{ padding: 16 }}>
              <div className={styles["quick-links"]}>
                <Link className={styles["quick-link"]} href="/student/learn">
                  <span className={styles["quick-link-icon"]} aria-hidden="true">🎓</span> Take a Quiz
                </Link>
                <Link className={styles["quick-link"]} href="/booking">
                  <span className={styles["quick-link-icon"]} aria-hidden="true">📅</span> Book Lesson
                </Link>
                <Link className={styles["quick-link"]} href="/student/bookings">
                  <span className={styles["quick-link-icon"]} aria-hidden="true">📊</span> My Bookings
                </Link>
                <Link className={styles["quick-link"]} href="/student/profile">
                  <span className={styles["quick-link-icon"]} aria-hidden="true">👤</span> Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles["card-header"]}>
          <div className={styles["card-title"]}>Recent Activity</div>
        </div>
        <div className={styles["card-body"]}>
          {activity.length === 0 ? (
            <div className={styles["empty-state"]}>No activity yet — start a lesson or book a driving session to get going.</div>
          ) : (
            activity.map((a, i) => (
              <div className={styles["activity-item"]} key={i}>
                <div className={styles["activity-dot"]} style={{ background: a.bg }}>{a.icon}</div>
                <div className={styles["activity-text"]}>{a.text}</div>
                <div className={styles["activity-time"]}>{timeAgo(a.time)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
