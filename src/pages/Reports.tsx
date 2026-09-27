import { useState } from "react";
import { Star } from "lucide-react";
import { technicians } from "../data/technicians";
import { Avatar, CardHeader, PageHeader, Td, Th, cx } from "../components/ui";
import { rating } from "../lib/format";

const WEEKS = [
  { label: "S1", value: 38 },
  { label: "S2", value: 36 },
  { label: "S3", value: 21 },
  { label: "S4", value: 12 },
  { label: "S5", value: 8 },
  { label: "S6", value: 5.4 },
  { label: "S7", value: 4.2 },
  { label: "S8", value: 3.7 },
];
const LAUNCH = 2; // índice da semana de implantação

const CATEGORIES = [
  { label: "Climatização", value: 94 },
  { label: "Hidráulica", value: 41 },
  { label: "Elétrica", value: 36 },
  { label: "Refrigeração", value: 15 },
];

function DispatchTimeChart() {
  const [hover, setHover] = useState<number | null>(null);
  const max = 40;
  return (
    <div>
      <div className="relative flex h-[200px] items-end gap-3 border-b border-line pl-8">
        {[0, 20, 40].map((v) => (
          <div key={v} className="pointer-events-none absolute right-0 left-8 border-t border-dashed border-line-soft" style={{ bottom: `${(v / max) * 100}%` }}>
            <span className="absolute -left-8 -translate-y-1/2 text-[11px] text-ink-4 tnum">{v}</span>
          </div>
        ))}
        {WEEKS.map((w, i) => (
          <div
            key={w.label}
            className="relative flex h-full flex-1 cursor-default items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {hover === i && (
              <div className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md bg-surface px-2.5 py-1.5 text-[12px] whitespace-nowrap shadow-lift" style={{ bottom: `${(w.value / max) * 100}%` }}>
                <span className="font-semibold text-ink tnum">{w.value.toLocaleString("pt-BR")} min</span>
                <span className="text-ink-4"> · semana {i + 1}</span>
              </div>
            )}
            <div
              className={cx("w-full rounded-t-[4px] transition-opacity", i >= LAUNCH ? "bg-brand" : "bg-[#c9ccd4]", hover !== null && hover !== i && "opacity-60")}
              style={{ height: `${(w.value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 pl-8">
        {WEEKS.map((w, i) => (
          <div key={w.label} className={cx("flex-1 text-center text-[11px] tnum", i === LAUNCH ? "font-medium text-brand-700" : "text-ink-4")}>
            {i === LAUNCH ? "Go-live" : w.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryChart() {
  const max = CATEGORIES[0].value;
  const total = CATEGORIES.reduce((s, c) => s + c.value, 0);
  return (
    <ul className="space-y-4">
      {CATEGORIES.map((c) => (
        <li key={c.label}>
          <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
            <span className="text-ink-2">{c.label}</span>
            <span className="text-ink-3 tnum">
              <span className="font-semibold text-ink">{c.value}</span> · {Math.round((c.value / total) * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#f0f0f3]">
            <div className="bar-grow h-full rounded-full bg-brand" style={{ width: `${(c.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Reports() {
  const top = [...technicians].sort((a, b) => b.servicesMonth - a.servicesMonth).slice(0, 6);
  return (
    <>
      <PageHeader title="Relatórios" subtitle="Setembro · comparativo antes e depois do Despacho IA" />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Serviços este mês", "186", "+18% vs. agosto"],
          ["Tempo médio até despacho", "3m 42s", "era 38 min antes do DispatchAI"],
          ["Primeira visita resolvida", "87%", "era 78%"],
          ["Satisfação dos clientes", "4,8", "1.940 avaliações"],
        ].map(([l, v, s]) => (
          <div key={l} className="card px-5 py-4">
            <div className="text-[12.5px] text-ink-3">{l}</div>
            <div className="mt-1.5 text-[26px] font-semibold tracking-[-0.03em] text-ink tnum">{v}</div>
            <div className="mt-1.5 text-[12px] text-ok-ink">{s}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="card">
          <CardHeader
            title="Tempo até despacho"
            subtitle="Minutos entre o chamado e a atribuição · últimas 8 semanas"
            action={
              <div className="flex items-center gap-3 text-[12px] text-ink-3">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-[#c9ccd4]" /> Manual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-brand" /> Despacho IA
                </span>
              </div>
            }
          />
          <div className="px-5 pt-2 pb-5">
            <DispatchTimeChart />
          </div>
        </section>
        <section className="card">
          <CardHeader title="Serviços por categoria" subtitle="186 serviços no mês" />
          <div className="px-5 pt-2 pb-5">
            <CategoryChart />
          </div>
        </section>
      </div>

      <section className="card overflow-hidden">
        <CardHeader title="Desempenho por técnico" subtitle="Top 6 em volume no mês" />
        <table className="w-full">
          <thead className="border-y border-line-soft bg-subtle">
            <tr>
              <Th>Técnico</Th>
              <Th>Serviços</Th>
              <Th>Conclusão</Th>
              <Th>1ª visita</Th>
              <Th className="text-right">Avaliação</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {top.map((t) => (
              <tr key={t.id}>
                <Td>
                  <span className="flex items-center gap-2.5">
                    <Avatar name={t.name} size={26} />
                    <span className="font-medium text-ink">{t.name}</span>
                  </span>
                </Td>
                <Td className="tnum">{t.servicesMonth}</Td>
                <Td className="tnum">{t.completionRate}%</Td>
                <Td className="tnum">{t.firstVisitRate}%</Td>
                <Td className="text-right">
                  <span className="inline-flex items-center gap-1 font-medium text-ink tnum">
                    <Star className="size-3.5 fill-[#f5a524] text-[#f5a524]" /> {rating(t.rating)}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
