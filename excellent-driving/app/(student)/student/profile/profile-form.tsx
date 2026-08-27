"use client";

import { useState } from "react";
import styles from "./profile.module.css";

export function ProfileForm({
  initialName,
  email,
  initialPhone,
  initialLanguage,
}: {
  initialName: string;
  email: string;
  initialPhone: string;
  initialLanguage: "EN" | "NL";
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [language, setLanguage] = useState(initialLanguage);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/student/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, language }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save changes.");
      setStatus("error");
      return;
    }
    setStatus("saved");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus("saving");
    const res = await fetch("/api/student/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPwError(data.error ?? "Could not change password.");
      setPwStatus("error");
      return;
    }
    setPwStatus("saved");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <div className={styles.grid}>
      <form className={styles.card} onSubmit={saveProfile}>
        <h2>Profile Details</h2>
        {status === "saved" && <p className={styles["status-success"]}>Profile updated.</p>}
        {status === "error" && <p className={styles["status-error"]}>{error}</p>}

        <div className={styles.field}>
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" value={email} disabled />
        </div>
        <div className={styles.field}>
          <label htmlFor="profile-name">Full name</label>
          <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="profile-phone">Phone</label>
          <input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="profile-language">Language</label>
          <select id="profile-language" value={language} onChange={(e) => setLanguage(e.target.value as "EN" | "NL")}>
            <option value="EN">English</option>
            <option value="NL">Nederlands</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save Changes"}
        </button>
      </form>

      <form className={styles.card} onSubmit={changePassword}>
        <h2>Change Password</h2>
        {pwStatus === "saved" && <p className={styles["status-success"]}>Password changed.</p>}
        {pwStatus === "error" && <p className={styles["status-error"]}>{pwError}</p>}

        <div className={styles.field}>
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pwStatus === "saving"}>
          {pwStatus === "saving" ? "Updating…" : "Change Password"}
        </button>
      </form>
    </div>
  );
}
