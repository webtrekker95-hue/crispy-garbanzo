import Link from "next/link";
import "../(public)/public-shared.css";
import styles from "./booking.module.css";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.body}>
      <nav>
        <div className={styles["nav-inner"]}>
          <Link href="/" className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="logo-text">
              Excellent Driving <span>Rijschool · Suriname</span>
            </div>
          </Link>
          <Link href="/" className="btn btn-outline" style={{ fontSize: "0.82rem", padding: "8px 16px" }}>
            ← Back to Home
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
