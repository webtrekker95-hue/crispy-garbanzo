import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PackagesGrid } from "./packages-grid";
import styles from "./packages.module.css";

const displayOrder = ["Starter", "Standard", "Premium", "Refresher"];

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({ where: { isActive: true } });
  const sorted = [...packages].sort(
    (a, b) => displayOrder.indexOf(a.nameEn) - displayOrder.indexOf(b.nameEn)
  );
  const byName = Object.fromEntries(sorted.map((p) => [p.nameEn, p]));

  return (
    <>
      <div className={styles["page-header"]}>
        <div className={styles["page-header-inner"]}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Packages</span>
          </div>
          <h1>Our Driving Packages</h1>
          <p>
            Choose the package that matches your experience level and goals. All packages include
            online theory access and WhatsApp support.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles["content-inner"]}>
          <PackagesGrid
            packages={sorted.map((p) => ({
              id: p.id,
              nameEn: p.nameEn,
              descriptionEn: p.descriptionEn,
              price: Number(p.price),
              featured: p.featured,
            }))}
          />
        </div>
      </div>

      <section className={styles.comparison}>
        <div className={styles["comparison-inner"]}>
          <h2 className={styles["comparison-title"]}>Compare All Packages</h2>
          <p className={styles["comparison-sub"]}>See exactly what&apos;s included in each package side by side.</p>

          <div style={{ overflowX: "auto" }}>
            <table className={styles["comp-table"]}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Starter</th>
                  <th className={styles.highlight}>Standard ⭐</th>
                  <th>Premium</th>
                  <th>Refresher</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Practical Lessons</strong></td>
                  <td><span className={styles.cross}>—</span> Not included</td>
                  <td className={styles.highlight}><span className={styles.cross}>—</span> Not included</td>
                  <td><span className={styles.cross}>—</span> Not included</td>
                  <td><span className={styles.cross}>—</span> Not included</td>
                </tr>
                <tr>
                  <td><strong>Theory Course</strong></td>
                  <td><span className={styles.check}>✓</span> Basic</td>
                  <td className={styles.highlight}><span className={styles.check}>✓</span> Full</td>
                  <td><span className={styles.check}>✓</span> Full + Video</td>
                  <td><span className={styles.check}>✓</span> 30 days</td>
                </tr>
                <tr>
                  <td><strong>Mock Exams</strong></td>
                  <td><span className={styles.cross}>—</span></td>
                  <td className={styles.highlight}>2 sessions</td>
                  <td>Unlimited</td>
                  <td>1 session</td>
                </tr>
                <tr>
                  <td><strong>Priority Booking</strong></td>
                  <td><span className={styles.cross}>—</span></td>
                  <td className={styles.highlight}><span className={styles.check}>✓</span></td>
                  <td><span className={styles.check}>✓</span></td>
                  <td><span className={styles.cross}>—</span></td>
                </tr>
                <tr>
                  <td><strong>WhatsApp Support</strong></td>
                  <td><span className={styles.check}>✓</span></td>
                  <td className={styles.highlight}><span className={styles.check}>✓</span></td>
                  <td><span className={styles.check}>✓</span></td>
                  <td><span className={styles.check}>✓</span></td>
                </tr>
                <tr>
                  <td><strong>Dedicated Instructor</strong></td>
                  <td><span className={styles.cross}>—</span></td>
                  <td className={styles.highlight}><span className={styles.cross}>—</span></td>
                  <td><span className={styles.check}>✓</span></td>
                  <td><span className={styles.cross}>—</span></td>
                </tr>
                <tr>
                  <td><strong>Exam Day Accompaniment</strong></td>
                  <td><span className={styles.cross}>—</span></td>
                  <td className={styles.highlight}><span className={styles.cross}>—</span></td>
                  <td><span className={styles.check}>✓</span></td>
                  <td><span className={styles.cross}>—</span></td>
                </tr>
                <tr>
                  <td><strong>Price</strong></td>
                  <td><strong>SRD {Number(byName.Starter?.price ?? 0).toLocaleString()}</strong></td>
                  <td className={styles.highlight}><strong>SRD {Number(byName.Standard?.price ?? 0).toLocaleString()}</strong></td>
                  <td><strong>SRD {Number(byName.Premium?.price ?? 0).toLocaleString()}</strong></td>
                  <td><strong>SRD {Number(byName.Refresher?.price ?? 0).toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className={styles["cta-banner"]}>
        <h2>Ready to Start Driving?</h2>
        <p>Join over 500 students who&apos;ve earned their license with Excellent Driving.</p>
        <div className={styles["cta-actions"]}>
          <Link href="/booking" className="btn btn-primary btn-lg">Book Your First Lesson</Link>
          <Link href="/contact" className="btn btn-white btn-lg">Ask a Question</Link>
        </div>
      </div>
    </>
  );
}
