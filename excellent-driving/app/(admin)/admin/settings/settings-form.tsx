"use client";

import { useState } from "react";

type Settings = {
  schoolName: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  whatsappBotEnabled: boolean;
  defaultLanguage: "EN" | "NL";
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save settings.");
      setStatus("error");
      return;
    }
    setStatus("saved");
  }

  return (
    <form className="card" onSubmit={save} style={{ maxWidth: 560 }}>
      <div className="card-header">
        <div className="card-title">School Settings</div>
      </div>
      <div className="card-body">
        {status === "saved" && <p className="status-banner-success">Settings saved.</p>}
        {status === "error" && <p className="status-banner-error">{error}</p>}

        <div className="field">
          <label htmlFor="school-name">School name</label>
          <input id="school-name" required value={form.schoolName} onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="school-address">Address</label>
          <input id="school-address" required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="school-phone">Phone</label>
            <input id="school-phone" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="school-whatsapp">WhatsApp number</label>
            <input id="school-whatsapp" value={form.whatsappNumber} onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))} placeholder="+597…" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="school-lang">Default language</label>
          <select id="school-lang" value={form.defaultLanguage} onChange={(e) => setForm((f) => ({ ...f, defaultLanguage: e.target.value as "EN" | "NL" }))}>
            <option value="EN">English</option>
            <option value="NL">Nederlands</option>
          </select>
        </div>
        <div className="field">
          <label>
            <input
              type="checkbox"
              style={{ width: "auto", marginRight: 8 }}
              checked={form.whatsappBotEnabled}
              onChange={(e) => setForm((f) => ({ ...f, whatsappBotEnabled: e.target.checked }))}
            />
            WhatsApp bot notifications enabled
          </label>
          <p style={{ fontSize: "0.75rem", color: "var(--gray-600)", marginTop: 6 }}>
            Notifications only actually send once WHATSAPP_API_KEY / WHATSAPP_PHONE_NUMBER_ID are configured in the
            environment — this toggle controls intent, not credentials.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
