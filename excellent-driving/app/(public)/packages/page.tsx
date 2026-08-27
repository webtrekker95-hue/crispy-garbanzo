import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PackagesGrid } from "./packages-grid";
import styles from "./packages.module.css";

const displayOrder = ["Starter", "Standard", "Premium", "Refresher"];

export default async function PackagesPage() {
  const t = await getTranslations("Packages");
  const locale = await getLocale();
  const isNl = locale === "nl";

  const packages = await prisma.package.findMany({ where: { isActive: true } });
  const orderOf = (name: string) => {
    const i = displayOrder.indexOf(name);
    return i === -1 ? displayOrder.length : i; // unknown packages sort last, not first
  };
  const sorted = [...packages].sort((a, b) => orderOf(a.nameEn) - orderOf(b.nameEn));
  const byName = Object.fromEntries(sorted.map((p) => [p.nameEn, p]));

  return (
    <>
      <div className={styles["page-header"]}>
        <div className={styles["page-header-inner"]}>
          <div className={styles.breadcrumb}>
            <Link href="/">{t("breadcrumbHome")}</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>{t("breadcrumbPackages")}</span>
          </div>
          <h1>{t("pageTitle")}</h1>
          <p>{t("pageSubtitle")}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles["content-inner"]}>
          <PackagesGrid
            packages={sorted.map((p) => ({
              id: p.id,
              nameEn: p.nameEn,
              nameNl: p.nameNl,
              descriptionEn: p.descriptionEn,
              descriptionNl: p.descriptionNl,
              price: Number(p.price),
              featured: p.featured,
            }))}
          />
        </div>
      </div>

      <section className={styles.comparison}>
        <div className={styles["comparison-inner"]}>
          <h2 className={styles["comparison-title"]}>{t("comparisonTitle")}</h2>
          <p className={styles["comparison-sub"]}>{t("comparisonSubtitle")}</p>

          <div style={{ overflowX: "auto" }}>
            <table className={styles["comp-table"]}>
              <thead>
                <tr>
                  <th>{t("featureCol")}</th>
                  <th>{isNl ? byName.Starter?.nameNl : "Starter"}</th>
                  <th className={styles.highlight}>{(isNl ? byName.Standard?.nameNl : "Standard") ?? "Standard"} ⭐</th>
                  <th>{isNl ? byName.Premium?.nameNl : "Premium"}</th>
                  <th>{isNl ? byName.Refresher?.nameNl : "Refresher"}</th>
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
        <h2>{t("ctaTitle")}</h2>
        <p>{t("ctaSubtitle")}</p>
        <div className={styles["cta-actions"]}>
          <Link href="/booking" className="btn btn-primary btn-lg">{t("bookFirstLesson")}</Link>
          <Link href="/contact" className="btn btn-white btn-lg">{t("askQuestion")}</Link>
        </div>
      </div>
    </>
  );
}
