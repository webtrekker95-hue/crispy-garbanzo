import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FaqAccordion } from "@/components/faq-accordion";
import styles from "./home.module.css";

const packageIcons: Record<string, string> = {
  Starter: "🚀",
  Standard: "⭐",
  Premium: "💎",
  Refresher: "🔄",
};

export default async function HomePage() {
  const [packages, instructors, faqs] = await Promise.all([
    prisma.package.findMany({
      where: { isActive: true, nameEn: { in: ["Starter", "Standard", "Premium"] } },
      orderBy: { price: "asc" },
    }),
    prisma.instructor.findMany({
      where: { isActive: true },
      include: { user: true },
      take: 3,
      orderBy: { yearsExperience: "desc" },
    }),
    prisma.fAQ.findMany({
      where: { language: "EN" },
      orderBy: { orderIndex: "asc" },
      take: 5,
    }),
  ]);

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles["hero-inner"]}>
          <div>
            <div className={styles["hero-badge"]}>
              <span aria-hidden="true">🏆</span> <span>Suriname&apos;s #1 Driving School</span>
            </div>
            <h1>
              Learn to Drive
              <br />
              with <span>Confidence</span>
            </h1>
            <p>
              Professional driving lessons in Paramaribo. Certified instructors, flexible schedules
              Monday through Saturday, and a complete online learning platform.
            </p>
            <div className={styles["hero-ctas"]}>
              <Link href="/booking" className="btn btn-primary btn-lg">Book a Lesson</Link>
              <Link href="/packages" className="btn btn-white btn-lg">View Packages</Link>
            </div>
          </div>

          <div className={styles["hero-visual"]}>
            <div className={styles["hero-card"]}>
              <div className={styles["hero-card-title"]}>Your Learning Journey</div>
              {[
                { icon: "📚", label: "Theory Lessons", sub: "Online at your own pace" },
                { icon: "🚗", label: "Practical Training", sub: "With certified instructors" },
                { icon: "🎓", label: "Exam Preparation", sub: "Pass on your first try" },
                { icon: "📱", label: "WhatsApp Updates", sub: "Instant confirmations" },
              ].map((item) => (
                <div className={styles["cert-item"]} key={item.label}>
                  <div className={styles["cert-icon"]} aria-hidden="true">{item.icon}</div>
                  <div>
                    <div className={styles["cert-label"]}>{item.label}</div>
                    <div className={styles["cert-sub"]}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className={styles["stats-bar"]}>
        <div className={styles["stats-inner"]}>
          <div className={styles.stat}>
            <div className={styles["stat-number"]}>500+</div>
            <div className={styles["stat-label"]}>Students Trained</div>
          </div>
          <div className={styles.stat}>
            <div className={styles["stat-number"]}>8</div>
            <div className={styles["stat-label"]}>Expert Instructors</div>
          </div>
          <div className={styles.stat}>
            <div className={styles["stat-number"]}>Mon–Sat</div>
            <div className={styles["stat-label"]}>Available 7am–6pm</div>
          </div>
          <div className={styles.stat}>
            <div className={styles["stat-number"]}>95%</div>
            <div className={styles["stat-label"]}>Pass Rate</div>
          </div>
        </div>
      </div>

      {/* PACKAGES PREVIEW */}
      <section className={styles["packages-section"]}>
        <div className="section-inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="section-tag">Packages</div>
              <h2 className="section-title">
                Choose Your
                <br />
                Learning Package
              </h2>
              <p className="section-sub">
                All packages include access to our online theory platform with quizzes and study materials.
              </p>
            </div>
            <Link href="/packages" className="btn btn-outline">See All Packages →</Link>
          </div>

          <div className={styles["packages-grid"]}>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`${styles["package-card"]}${pkg.featured ? ` ${styles.featured}` : ""}`}
              >
                {pkg.featured && <div className={styles["package-badge"]}>Most Popular</div>}
                <div className={styles["package-icon"]} aria-hidden="true">
                  {packageIcons[pkg.nameEn] ?? "🚗"}
                </div>
                <div className={styles["package-name"]}>{pkg.nameEn}</div>
                <div className={styles["package-desc"]}>{pkg.descriptionEn}</div>
                <div className={styles["package-price"]}>
                  SRD {Number(pkg.price).toLocaleString()} <span>/ package</span>
                </div>
                <div className={styles["package-includes"]}>
                  <div className={`${styles["include-item"]} ${styles.excluded}`}>
                    Practical lessons are not included, theory only
                  </div>
                  <div className={styles["include-item"]}>Theory access included</div>
                  <div className={styles["include-item"]}>WhatsApp support</div>
                  <div className={styles["include-item"]}>Certificate upon completion</div>
                </div>
                <Link
                  href="/booking"
                  className={`btn ${pkg.featured ? "btn-primary" : "btn-outline"} ${styles["full-width-cta"]}`}
                >
                  Book This Package
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="section-inner" style={{ textAlign: "center" }}>
          <div className="section-tag">Process</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub" style={{ margin: "0 auto" }}>
            Three simple steps to get your driver&apos;s license.
          </p>

          <div className={styles["steps-grid"]}>
            {[
              {
                num: 1,
                title: "Register & Choose a Package",
                body: "Create your free account, pick the package that fits your needs and budget, and pay via cash or bank transfer.",
              },
              {
                num: 2,
                title: "Book Your Lessons",
                body: "Select your preferred instructor, pick your days and time slots, and receive instant WhatsApp confirmation.",
              },
              {
                num: 3,
                title: "Learn & Get Licensed",
                body: "Complete your online theory modules, attend practical lessons, and pass your exam with confidence.",
              },
            ].map((step) => (
              <div className={styles.step} key={step.num}>
                <div className={styles["step-num"]}>{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUCTORS */}
      <section style={{ background: "var(--gray-50)" }}>
        <div className="section-inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 0 }}>
            <div>
              <div className="section-tag">Instructors</div>
              <h2 className="section-title">Meet Our Team</h2>
              <p className="section-sub">
                Experienced, patient, and certified professionals dedicated to your success.
              </p>
            </div>
            <Link href="/instructors" className="btn btn-outline">View All Instructors →</Link>
          </div>

          <div className={styles["instructors-scroll"]}>
            {instructors.map((instructor) => (
              <div className={styles["instructor-card"]} key={instructor.id}>
                <div className={styles["instructor-photo"]}>
                  <div className={styles["instructor-avatar"]}>👤</div>
                </div>
                <div className={styles["instructor-info"]}>
                  <div className={styles["instructor-name"]}>{instructor.user.name}</div>
                  <div className={styles["instructor-years"]}>
                    {instructor.yearsExperience} years experience
                  </div>
                  <div className={styles["instructor-bio"]}>{instructor.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles["faq-section"]}>
        <div className="section-inner">
          <div className={styles["faq-grid"]}>
            <div>
              <div className="section-tag">FAQ</div>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-sub">
                Everything you need to know about starting your driving lessons.
              </p>
              <br />
              <Link href="/faq" className="btn btn-primary" style={{ marginTop: 8 }}>View All Questions →</Link>
            </div>
            <div className={styles["faq-list"]}>
              <FaqAccordion
                items={faqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }))}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
