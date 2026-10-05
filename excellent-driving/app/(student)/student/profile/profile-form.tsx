"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Profile");
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
      setError(data.error ?? t("saveError"));
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
      setPwError(data.error ?? t("passwordError"));
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
        <h2>{t("profileDetails")}</h2>
        {status === "saved" && <p className={styles["status-success"]}>{t("profileUpdated")}</p>}
        {status === "error" && <p className={styles["status-error"]}>{error}</p>}

        <div className={styles.field}>
          <label htmlFor="profile-email">{t("email")}</label>
          <input id="profile-email" value={email} disabled />
        </div>
        <div className={styles.field}>
          <label htmlFor="profile-name">{t("fullName")}</label>
          <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="profile-phone">{t("phone")}</label>
          <input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label htmlFor="profile-language">{t("language")}</label>
          <select id="profile-language" value={language} onChange={(e) => setLanguage(e.target.value as "EN" | "NL")}>
            <option value="EN">English</option>
            <option value="NL">Nederlands</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
          {status === "saving" ? t("saving") : t("saveChanges")}
        </button>
      </form>

      <form className={styles.card} onSubmit={changePassword}>
        <h2>{t("changePassword")}</h2>
        {pwStatus === "saved" && <p className={styles["status-success"]}>{t("passwordChanged")}</p>}
        {pwStatus === "error" && <p className={styles["status-error"]}>{pwError}</p>}

        <div className={styles.field}>
          <label htmlFor="current-password">{t("currentPassword")}</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="new-password">{t("newPassword")}</label>
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
          {pwStatus === "saving" ? t("updating") : t("changePassword")}
        </button>
      </form>
    </div>
  );
}
