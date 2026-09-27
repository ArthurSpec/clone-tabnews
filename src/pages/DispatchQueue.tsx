import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, Route, Sparkles } from "lucide-react";
import { useStore } from "../store/DemoStore";
import { technicianById } from "../data/technicians";
import { DEMO_NOW } from "../data/tickets";
import { Avatar, Button, CardHeader, PageHeader, PriorityBadge, WorkOrderStatusBadge } from "../components/ui";
import { CHANNEL_ICON } from "./Tickets";
import { firstName, toMinutes } from "../lib/format";

export default function DispatchQueue() {
  const { state } = useStore();
  const navigate = useNavigate();
  const queue = state.tickets.filter((t) => t.status === "aguardando").sort((a, b) => toMinutes(b.createdAt) - toMinutes(a.createdAt));
  const recent = state.workOrders.slice(0, 6);

  return (
    <>
      <PageHeader
        title="Despacho IA"
        subtitle="A IA recomenda o técnico mais adequado para cada chamado — com a explicação de cada decisão."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Despachados pela IA hoje", "33"],
          ["Recomendações aceitas", "97%"],
          ["Tempo médio até despacho", "3m 42s"],
          ["Score médio das escolhas", "91/100"],
        ].map(([l, v]) => (
          <div key={l} className="card px-5 py-4">
            <div className="text-[12.5px] text-ink-3">{l}</div>
            <div className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-ink tnum">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <section className="card overflow-hidden">
          <CardHeader title="Fila de despacho" subtitle={queue.length ? `${queue.length} chamados aguardando técnico` : "Nenhum chamado aguardando"} />
          {queue.length === 0 && (
            <div className="px-5 pb-8 pt-4 text-center text-[13.5px] text-ink-3">
              Fila zerada. Todos os chamados foram despachados. <Sparkles className="inline size-4 text-brand" />
            </div>
          )}
          <ul className="divide-y divide-line-soft border-t border-line-soft">
            {queue.map((t) => {
              const Icon = CHANNEL_ICON[t.channel];
              const rec = state.dispatches[t.id]?.candidates[0];
              const wait = toMinutes(DEMO_NOW) - toMinutes(t.createdAt);
              return (
                <li key={t.id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-subtle">
                  <Avatar name={t.customerName} size={36} />
                  <div className="min-w-[200px] flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-ink">{t.customerName}</span>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-[13px] text-ink-3">{t.messages?.[0]?.text ?? t.title}</div>
                    <div className="mt-1.5 flex items-center gap-3 text-[12px] text-ink-4">
                      <span className="flex items-center gap-1">
                        <Icon className="size-3" /> {t.channel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 className="size-3" /> aguardando há {wait} min
                      </span>
                      {rec && (
                        <span className="flex items-center gap-1 font-medium text-brand-700">
                          <Route className="size-3" /> Recomendado: {firstName(rec.technician.name)} · {rec.score}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant={rec ? "secondary" : "brand"} size="sm" onClick={() => navigate(`/despacho/${t.id}`)}>
                    {rec ? "Ver recomendação" : "Despachar com IA"} <ArrowRight className="size-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card">
          <CardHeader title="Despachados recentemente" action={<Link to="/ordens" className="text-[12.5px] font-medium text-ink-3 hover:text-ink">Ver OS</Link>} />
          <ul className="space-y-1 px-2 pb-3">
            {recent.map((w) => {
              const tech = technicianById(w.technicianId)!;
              return (
                <li key={w.number}>
                  <Link to={`/ordens/${w.number}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-subtle">
                    <Avatar name={tech.name} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] text-ink">
                        <span className="font-medium">{tech.name}</span>
                      </div>
                      <div className="truncate text-[12px] text-ink-3">
                        {w.customerName} · OS #{w.number}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand-700 tnum">{w.score}</span>
                      <WorkOrderStatusBadge status={w.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
