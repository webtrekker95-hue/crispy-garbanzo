"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "@/app/(admin)/admin-shell.module.css";

const overviewLinks = [
  { href: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/admin/bookings", icon: "📅", label: "Bookings" },
  { href: "/admin/students", icon: "👥", label: "Students" },
];

const schoolLinks = [
  { href: "/admin/packages", icon: "📦", label: "Packages" },
  { href: "/admin/instructors", icon: "👨‍🏫", label: "Instructors" },
  { href: "/admin/content", icon: "📚", label: "Course Content" },
  { href: "/admin/faq", icon: "❓", label: "FAQ" },
];

const systemLinks = [{ href: "/admin/settings", icon: "⚙️", label: "Settings" }];

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/bookings": "Bookings",
  "/admin/students": "Students",
  "/admin/packages": "Packages",
  "/admin/instructors": "Instructors",
  "/admin/content": "Course Content",
  "/admin/faq": "FAQ",
  "/admin/settings": "Settings",
};

function NavSection({ label, links, pathname, onNavigate }: { label: string; links: typeof overviewLinks; pathname: string; onNavigate: () => void }) {
  return (
    <div className={styles["nav-group"]}>
      <div className={styles["nav-group-label"]}>{label}</div>
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles["nav-link"]}${pathname.startsWith(item.href) ? ` ${styles.active}` : ""}`}
          onClick={onNavigate}
        >
          <span className={styles["nav-icon"]} aria-hidden="true">{item.icon}</span> {item.label}
        </Link>
      ))}
    </div>
  );
}

export function AdminShell({ adminName, children }: { adminName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitle = pageTitles[pathname] ?? "Admin";

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar}${menuOpen ? ` ${styles.open}` : ""}`}>
        <Link href="/admin/dashboard" className={styles["sidebar-logo"]}>
          <div className={styles["logo-mark"]}>
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className={styles["logo-text"]}>Excellent Driving</div>
            <div className={styles["logo-sub"]}>Admin Panel</div>
          </div>
        </Link>

        <NavSection label="Overview" links={overviewLinks} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
        <NavSection label="School" links={schoolLinks} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
        <div className={styles["nav-group"]}>
          <div className={styles["nav-group-label"]}>System</div>
          {systemLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles["nav-link"]}${pathname.startsWith(item.href) ? ` ${styles.active}` : ""}`}
            >
              <span className={styles["nav-icon"]} aria-hidden="true">{item.icon}</span> {item.label}
            </Link>
          ))}
          <Link href="/" className={styles["nav-link"]}>
            <span className={styles["nav-icon"]} aria-hidden="true">🌐</span> View Website
          </Link>
          <button className={styles["nav-link"]} style={{ color: "rgba(239,68,68,0.6)" }} onClick={() => signOut({ callbackUrl: "/" })}>
            <span className={styles["nav-icon"]} aria-hidden="true">🚪</span> Log Out
          </button>
        </div>

        <div className={styles["sidebar-footer"]}>
          <div className={styles["admin-chip"]}>
            <div className={styles["admin-avatar"]}>
              {adminName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className={styles["admin-name"]}>{adminName}</div>
              <div className={styles["admin-role"]}>School Owner</div>
            </div>
          </div>
        </div>
      </aside>
      <div className={`${styles["sidebar-backdrop"]}${menuOpen ? ` ${styles.open}` : ""}`} onClick={() => setMenuOpen(false)} />

      <div className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles["topbar-left"]}>
            <button className={styles["sidebar-toggle"]} aria-label="Toggle sidebar" onClick={() => setMenuOpen((o) => !o)}>
              <span></span><span></span><span></span>
            </button>
            <div className={styles["topbar-title"]}>{pageTitle}</div>
          </div>
          <div className={styles["topbar-right"]}>
            <button className={styles["notif-btn"]} aria-label="Notifications">🔔</button>
          </div>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
