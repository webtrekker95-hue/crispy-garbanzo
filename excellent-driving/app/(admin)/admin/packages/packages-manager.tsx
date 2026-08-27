"use client";

import { useState } from "react";
import styles from "./packages.module.css";

type Pkg = {
  id: string;
  nameEn: string;
  nameNl: string;
  descriptionEn: string;
  descriptionNl: string;
  price: number;
  lessonCount: number;
  featured: boolean;
  isActive: boolean;
};

const emptyForm = { nameEn: "", nameNl: "", descriptionEn: "", descriptionNl: "", price: "", lessonCount: "0", featured: false };

export function PackagesManager({ initial }: { initial: Pkg[] }) {
  const [packages, setPackages] = useState(initial);
  const [editing, setEditing] = useState<Pkg | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setError(null);
    setEditing("new");
  }

  function openEdit(pkg: Pkg) {
    setForm({
      nameEn: pkg.nameEn,
      nameNl: pkg.nameNl,
      descriptionEn: pkg.descriptionEn,
      descriptionNl: pkg.descriptionNl,
      price: String(pkg.price),
      lessonCount: String(pkg.lessonCount),
      featured: pkg.featured,
    });
    setError(null);
    setEditing(pkg);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      nameEn: form.nameEn,
      nameNl: form.nameNl,
      descriptionEn: form.descriptionEn,
      descriptionNl: form.descriptionNl,
      price: Number(form.price),
      lessonCount: Number(form.lessonCount),
      featured: form.featured,
    };

    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/admin/packages" : `/api/admin/packages/${(editing as Pkg).id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save package.");
      return;
    }

    // Prisma's Decimal serializes to a JSON string — normalize back to a
    // number so it formats consistently with the server-rendered rows.
    const normalized: Pkg = { ...data.package, price: Number(data.package.price) };

    if (isNew) {
      setPackages((list) => [...list, normalized]);
    } else {
      setPackages((list) => list.map((p) => (p.id === normalized.id ? normalized : p)));
    }
    setEditing(null);
  }

  async function toggleActive(pkg: Pkg) {
    const res = await fetch(`/api/admin/packages/${pkg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !pkg.isActive }),
    });
    if (res.ok) {
      const data = await res.json();
      const normalized: Pkg = { ...data.package, price: Number(data.package.price) };
      setPackages((list) => list.map((p) => (p.id === pkg.id ? normalized : p)));
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Package</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Lessons</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{pkg.nameEn}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--gray-600)" }}>{pkg.nameNl}</div>
                  </td>
                  <td className={styles["price-cell"]}>SRD {pkg.price.toLocaleString()}</td>
                  <td>{pkg.lessonCount}</td>
                  <td>{pkg.featured ? "⭐ Yes" : "—"}</td>
                  <td>
                    <span className={`badge ${pkg.isActive ? "badge-active" : "badge-inactive"}`}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(pkg)}>Edit</button>
                      <button
                        className={`btn btn-sm ${pkg.isActive ? "btn-danger" : "btn-success"}`}
                        onClick={() => toggleActive(pkg)}
                      >
                        {pkg.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => !busy && setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editing === "new" ? "Add Package" : "Edit Package"}</div>
            <form onSubmit={save}>
              {error && <p className="status-banner-error">{error}</p>}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="pkg-name-en">Name (EN)</label>
                  <input id="pkg-name-en" required value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="pkg-name-nl">Name (NL)</label>
                  <input id="pkg-name-nl" required value={form.nameNl} onChange={(e) => setForm((f) => ({ ...f, nameNl: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="pkg-desc-en">Description (EN)</label>
                <textarea id="pkg-desc-en" required rows={2} value={form.descriptionEn} onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="pkg-desc-nl">Description (NL)</label>
                <textarea id="pkg-desc-nl" required rows={2} value={form.descriptionNl} onChange={(e) => setForm((f) => ({ ...f, descriptionNl: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="pkg-price">Price (SRD)</label>
                  <input id="pkg-price" type="number" min="0" step="1" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="pkg-lessons">Practical lessons included</label>
                  <input id="pkg-lessons" type="number" min="0" step="1" required value={form.lessonCount} onChange={(e) => setForm((f) => ({ ...f, lessonCount: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label>
                  <input
                    type="checkbox"
                    style={{ width: "auto", marginRight: 8 }}
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  Featured (&quot;Most Popular&quot; badge)
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)} disabled={busy}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save Package"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
