import Link from "next/link";
import { ContactForm } from "./contact-form";
import styles from "./contact.module.css";

export default function ContactPage() {
  const mapSrc =
    "https://www.google.com/maps?q=" +
    encodeURIComponent("Bonistraat 44, Paramaribo, Suriname") +
    "&output=embed";

  return (
    <>
      <div className={styles["page-header"]}>
        <div className={styles["page-header-inner"]}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Contact</span>
          </div>
          <h1>Get in Touch</h1>
          <p>Questions about packages, bookings, or anything else? We&apos;re happy to help.</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles["content-inner"]}>
          <div>
            <div className={styles["info-card"]}>
              <div className={styles["info-row"]}>
                <div className={styles["info-icon"]} aria-hidden="true">📍</div>
                <div>
                  <div className={styles["info-label"]}>Address</div>
                  <div className={styles["info-value"]}>Bonistraat 44, Paramaribo</div>
                </div>
              </div>
              <div className={styles["info-row"]}>
                <div className={styles["info-icon"]} aria-hidden="true">📞</div>
                <div>
                  <div className={styles["info-label"]}>Phone</div>
                  <div className={styles["info-value"]}>+597 XXX XXXX</div>
                </div>
              </div>
              <div className={styles["info-row"]}>
                <div className={styles["info-icon"]} aria-hidden="true">✉️</div>
                <div>
                  <div className={styles["info-label"]}>Email</div>
                  <div className={styles["info-value"]}>info@excellentdriving.sr</div>
                </div>
              </div>
              <div className={styles["info-row"]}>
                <div className={styles["info-icon"]} aria-hidden="true">🕒</div>
                <div>
                  <div className={styles["info-label"]}>Hours</div>
                  <div className={styles["info-value"]}>Mon–Sat: 7am–6pm</div>
                </div>
              </div>
              <a href="#" className="whatsapp-btn" style={{ marginTop: 20 }}>
                Chat on WhatsApp
              </a>
            </div>

            <iframe
              className={styles["map-frame"]}
              src={mapSrc}
              title="Excellent Driving location — Bonistraat 44, Paramaribo"
              loading="lazy"
            />
          </div>

          <ContactForm />
        </div>
      </div>
    </>
  );
}
