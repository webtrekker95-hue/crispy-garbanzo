"use client";

import { useState } from "react";
import styles from "./contact.module.css";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Something went wrong. Please try WhatsApp instead.");
      setStatus("error");
      return;
    }

    setStatus("sent");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <div className={styles["form-card"]}>
      <h2>Send Us a Message</h2>

      {status === "sent" && (
        <p className={styles["status-success"]}>Thanks! We&apos;ll get back to you soon.</p>
      )}
      {status === "error" && <p className={styles["status-error"]}>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            required
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
