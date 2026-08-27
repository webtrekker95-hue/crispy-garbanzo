"use client";

import { useState } from "react";

export type FaqItem = { id: string; question: string; answer: string };

export function FaqAccordion({ items, defaultOpenId }: { items: FaqItem[]; defaultOpenId?: string }) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? items[0]?.id ?? null);

  return (
    <div>
      {items.map((item) => {
        const isOpen = item.id === openId;
        return (
          <div key={item.id} className={`faq-item${isOpen ? " open" : ""}`}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              {item.question}
              <div className="faq-chevron" aria-hidden="true">▼</div>
            </button>
            <div className="faq-a" style={isOpen ? { maxHeight: 400 } : undefined}>
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
