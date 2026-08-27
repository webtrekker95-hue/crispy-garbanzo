"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "@/app/(student)/student-shell.module.css";

const navItems = [
  { href: "/student/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/student/learn", icon: "📚", label: "My Lessons" },
  { href: "/booking", icon: "📅", label: "Book a Lesson", badge: "New" },
  { href: "/student/bookings", icon: "🎯", label: "My Bookings" },
];

const accountItems = [{ href: "/student/profile", icon: "👤", label: "Profile" }];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const pageTitles: Record<string, string> = {
  "/student/dashboard": "Dashboard",
  "/student/learn": "My Lessons",
  "/student/bookings": "My Bookings",
  "/student/profile": "Profile",
};

export function StudentShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitle =
    pageTitles[pathname] ??
    (pathname.startsWith("/student/learn") ? "My Lessons" : "Student Portal");

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar}${menuOpen ? ` ${styles.open}` : ""}`}>
        <Link href="/student/dashboard" className={styles["sidebar-logo"]}>
          <div className={styles["sidebar-logo-icon"]}>
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className={styles["sidebar-logo-text"]}>
            Excellent Driving <span>Student Portal</span>
          </div>
        </Link>

        <div className={styles["nav-section"]}>
          <div className={styles["nav-section-label"]}>Menu</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles["nav-item"]}${pathname.startsWith(item.href) ? ` ${styles.active}` : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles["nav-icon"]} aria-hidden="true">{item.icon}</span> {item.label}
              {item.badge && <span className={styles["nav-badge"]}>{item.badge}</span>}
            </Link>
          ))}
        </div>

        <div className={styles["nav-section"]}>
          <div className={styles["nav-section-label"]}>Account</div>
          {accountItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles["nav-item"]}${pathname.startsWith(item.href) ? ` ${styles.active}` : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles["nav-icon"]} aria-hidden="true">{item.icon}</span> {item.label}
            </Link>
          ))}
          <button
            className={styles["nav-item"]}
            style={{ color: "rgba(239,68,68,0.7)", width: "100%", textAlign: "left" }}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <span className={styles["nav-icon"]} aria-hidden="true">🚪</span> Log Out
          </button>
        </div>

        <div className={styles["sidebar-footer"]}>
          <button className={styles["user-chip"]} onClick={() => router.push("/student/profile")}>
            <div className={styles["user-avatar"]}>{initials(userName)}</div>
            <div>
              <div className={styles["user-name"]}>{userName}</div>
              <div className={styles["user-role"]}>Student</div>
            </div>
          </button>
        </div>
      </aside>
      <div
        className={`${styles["sidebar-backdrop"]}${menuOpen ? ` ${styles.open}` : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <div className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles["topbar-left"]}>
            <button
              className={styles["sidebar-toggle"]}
              aria-label="Toggle sidebar"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div>
              <h1>{pageTitle}</h1>
              <p>{dateLabel}</p>
            </div>
          </div>
          <div className={styles["topbar-right"]}>
            <button className={styles["notif-btn"]} aria-label="Notifications">
              <span aria-hidden="true">🔔</span>
            </button>
            <div className={styles["user-avatar"]} style={{ width: 38, height: 38, fontSize: "0.85rem" }}>
              {initials(userName)}
            </div>
          </div>
        </div>

        <div className={styles["page-content"]}>{children}</div>
      </div>
    </div>
  );
}
