"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./lesson.module.css";

export function TextLessonView({
  lessonId,
  title,
  body,
  isVideo,
  alreadyComplete,
  nextHref,
  moduleHref,
}: {
  lessonId: string;
  title: string;
  body: string;
  isVideo: boolean;
  alreadyComplete: boolean;
  nextHref: string | null;
  moduleHref: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(alreadyComplete);

  async function markComplete() {
    setSubmitting(true);
    const res = await fetch(`/api/student/progress/${lessonId}`, { method: "POST" });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      router.push(nextHref ?? moduleHref);
    }
  }

  return (
    <div className={styles["text-card"]}>
      <h1 className={styles["text-title"]}>{title}</h1>
      <div className={styles["text-body"]} dangerouslySetInnerHTML={{ __html: body }} />
      {isVideo && (
        <div className={styles["video-placeholder"]}>
          🎬 Video content coming soon — this lesson will include an embedded instructional video.
        </div>
      )}
      <div style={{ marginTop: 28 }}>
        {done ? (
          <button className="btn btn-outline" onClick={() => router.push(nextHref ?? moduleHref)}>
            ✓ Completed — {nextHref ? "Next Lesson →" : "Back to Module"}
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={markComplete} disabled={submitting}>
            {submitting ? "Saving…" : "Mark as Complete →"}
          </button>
        )}
      </div>
    </div>
  );
}
