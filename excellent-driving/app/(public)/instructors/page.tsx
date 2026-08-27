import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./instructors.module.css";

const dayLabels: Record<string, string> = {
  MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri", SAT: "Sat",
};
const dayOrder = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default async function InstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    where: { isActive: true },
    include: { user: true, schedules: true },
    orderBy: { yearsExperience: "desc" },
  });

  return (
    <>
      <div className={styles["page-header"]}>
        <div className={styles["page-header-inner"]}>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Instructors</span>
          </div>
          <h1>Meet Our Instructors</h1>
          <p>
            Experienced, patient, and certified professionals dedicated to your success behind the
            wheel.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles["content-inner"]}>
          <div className={styles["instructors-grid"]}>
            {instructors.map((instructor) => {
              const days = dayOrder.filter((d) =>
                instructor.schedules.some((s) => s.dayOfWeek === d)
              );
              return (
                <div className={styles["instructor-card"]} key={instructor.id}>
                  <div className={styles["instructor-photo"]}>
                    <div className={styles["instructor-avatar"]} aria-hidden="true">👤</div>
                  </div>
                  <div className={styles["instructor-info"]}>
                    <div className={styles["instructor-name"]}>{instructor.user.name}</div>
                    <div className={styles["instructor-years"]}>
                      {instructor.yearsExperience} years experience
                    </div>
                    <div className={styles["instructor-bio"]}>{instructor.bio}</div>
                    {days.length > 0 && (
                      <div className={styles["instructor-days"]}>
                        Available: {days.map((d) => dayLabels[d]).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
