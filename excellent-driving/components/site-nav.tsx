"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/instructors", label: "Instructors" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "nl">("en");

  return (
    <nav>
      <div className="nav-inner">
        <Link href="/" className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="logo-text">
            Excellent Driving
            <span>Rijschool · Suriname</span>
          </div>
        </Link>

        <ul className={`nav-links${menuOpen ? " open" : ""}`} id="primary-menu">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={pathname === link.href ? "active" : ""}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <div className="lang-switch">
            <button
              type="button"
              className={`lang-btn${lang === "en" ? " active" : ""}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-btn${lang === "nl" ? " active" : ""}`}
              onClick={() => setLang("nl")}
            >
              NL
            </button>
          </div>
          <Link href="/login" className="btn btn-outline">
            Login
          </Link>
          <Link href="/booking" className="btn btn-primary">
            Book Now
          </Link>
        </div>

        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="primary-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
