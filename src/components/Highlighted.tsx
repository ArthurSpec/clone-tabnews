import { Fragment } from "react";

/** Destaca, no texto do cliente, os trechos que a IA usou na análise. */
export function Highlighted({ text, terms, active }: { text: string; terms: string[]; active: boolean }) {
  if (!active || !terms.length) return <>{text}</>;
  const lower = text.toLowerCase();
  const ranges: [number, number][] = [];
  for (const term of terms) {
    const i = lower.indexOf(term.toLowerCase());
    if (i >= 0) ranges.push([i, i + term.length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  const parts: { t: string; hl: boolean }[] = [];
  let cursor = 0;
  for (const [s, e] of merged) {
    if (s > cursor) parts.push({ t: text.slice(cursor, s), hl: false });
    parts.push({ t: text.slice(s, e), hl: true });
    cursor = e;
  }
  if (cursor < text.length) parts.push({ t: text.slice(cursor), hl: false });

  return (
    <>
      {parts.map((p, i) =>
        p.hl ? (
          <mark
            key={i}
            className="rounded-[4px] bg-brand-soft px-0.5 text-brand-700 shadow-[inset_0_-1.5px_0_var(--color-brand-line)] animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {p.t}
          </mark>
        ) : (
          <Fragment key={i}>{p.t}</Fragment>
        ),
      )}
    </>
  );
}
