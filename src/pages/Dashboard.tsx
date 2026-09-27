import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CalendarDays, Plus, Route } from "lucide-react";
import { useStore } from "../store/DemoStore";
import { technicians, technicianById } from "../data/technicians";
import { Avatar, Badge, Button, CardHeader, PageHeader, PriorityBadge, TicketStatusBadge, Td, Th, cx } from "../components/ui";
import { CallsChart } from "../components/CallsChart";
import { dateLong, firstName, TECH_STATUS_LABEL, toMinutes } from "../lib/format";
import type { TechStatus, Ticket } from "../types";

function Metric({
  label,
  value,
  hint,
  hintTone = "muted",
  accent,
  to,
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: "up" | "muted" | "warn";
  accent?: boolean;
  to?: string;
}) {
  const body = (
    <div className={cx("group relative h-full px-5 py-4", to && "cursor-pointer transition-colors hover:bg-subtle")}>
      <div className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
        {accent && <span className="size-1.5 rounded-full bg-warn" />}
        {label}
        {to && <ArrowUpRight className="ml-auto size-3.5 text-ink-4 opacity-0 transition-opacity group-hover:opacity-100" />}
      </div>
      <div className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink tnum">{value}</div>
      {hint && (
        <div
          className={cx(
            "mt-2.5 text-[12px]",
            hintTone === "up" && "text-ok-ink",
            hintTone === "muted" && "text-ink-4",
            hintTone === "warn" && "text-warn-ink font-medium",
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function MetricGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line-soft px-5 py-2.5">
        <span className="eyebrow">{title}</span>
      </div>
      <div className="grid grid-cols-2 divide-line-soft md:grid-cols-4 md:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-line-soft md:[&>*:nth-child(-n+2)]:border-b-0">
        {children}
      </div>
    </section>
  );
}

const STATUS_ORDER: TechStatus[] = ["disponivel", "em_atendimento", "em_deslocamento", "folga"];
const STATUS_COLOR: Record<TechStatus, string> = {
  disponivel: "bg-ok",
  em_atendimento: "bg-info",
  em_deslocamento: "bg-warn",
  folga: "bg-[#d6d7dd]",
};

function FieldTeam() {
  const { techStatus } = useStore();
  const counts = STATUS_ORDER.map((s) => ({ s, n: technicians.filter((t) => techStatus(t.id) === s).length }));
  const total = technicians.length;
  return (
    <div className="px-5 pb-5">
      <div className="flex h-2 w-full gap-[2px] overflow-hidden rounded-full">
        {counts.map(({ s, n }) => (
          <div key={s} className={cx("h-full first:rounded-l-full last:rounded-r-full", STATUS_COLOR[s])} style={{ width: `${(n / total) * 100}%` }} />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {counts.map(({ s, n }) => (
          <li key={s} className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 text-ink-2">
              <span className={cx("size-2 rounded-full", STATUS_COLOR[s])} />
              {TECH_STATUS_LABEL[s]}
            </span>
            <span className="tnum font-medium text-ink">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ticketLink(t: Ticket) {
  if (t.workOrderNumber) return `/ordens/${t.workOrderNumber}`;
  return `/chamados/novo?ticket=${t.id}`;
}

export function TechCell({ id, fallback }: { id?: string; fallback?: React.ReactNode }) {
  const tech = id ? technicianById(id) : undefined;
  if (!tech) return <>{fallback ?? <span className="text-ink-4">—</span>}</>;
  return (
    <span className="flex items-center gap-2">
      <Avatar name={tech.name} size={22} />
      <span className="text-ink">{tech.name}</span>
    </span>
  );
}

export default function Dashboard() {
  const { state, stats } = useStore();
  const navigate = useNavigate();
  const recent = [...state.tickets].sort((a, b) => toMinutes(b.createdAt) - toMinutes(a.createdAt)).slice(0, 7);
  const aiDecisions = state.workOrders.slice(0, 4);

  return (
    <>
      <PageHeader
        title="Olá, Arthur"
        subtitle={`${dateLong()} · visão geral da operação em tempo real`}
        actions={
          <>
            <Button icon={<CalendarDays className="size-4" />} onClick={() => navigate("/agenda")}>
              Agenda
            </Button>
            <Button variant="brand" size="lg" icon={<Plus className="size-[18px]" />} onClick={() => navigate("/chamados/novo")}>
              Novo chamado
            </Button>
          </>
        }
      />

      <div className="grid gap-4">
        <MetricGroup title="Operação hoje">
          <Metric label="Chamados recebidos" value={String(stats.received)} hint="+6 vs. mesmo horário ontem" hintTone="up" to="/chamados" />
          <Metric label="Em atendimento" value={String(stats.inService)} hint="9 técnicos em campo" to="/ordens" />
          <Metric
            label="Aguardando despacho"
            value={String(stats.awaiting)}
            accent={stats.awaiting > 0}
            hint={stats.awaiting > 0 ? "Despachar agora →" : "Fila zerada"}
            hintTone={stats.awaiting > 0 ? "warn" : "muted"}
            to="/despacho"
          />
          <Metric label="Concluídos" value={String(stats.done)} hint="57% do volume do dia" to="/ordens" />
        </MetricGroup>

        <MetricGroup title="Performance">
          <Metric label="Tempo médio até despacho" value="3m 42s" hint="−34m vs. despacho manual" hintTone="up" />
          <Metric label="Taxa de conclusão" value="94,2%" hint="+2,1 p.p. no mês" hintTone="up" />
          <Metric label="Primeira visita resolvida" value="87%" hint="+9 p.p. desde a implantação" hintTone="up" />
          <Metric label="Técnicos ativos" value="18/24" hint="6 de folga hoje" to="/tecnicos" />
        </MetricGroup>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="card lg:col-span-2">
            <CardHeader
              title="Chamados ao longo do dia"
              subtitle="Recebidos por hora"
              action={
                <div className="flex items-center gap-4 text-[12px] text-ink-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-3.5 rounded bg-brand" /> Hoje
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 border-t-[1.5px] border-dashed border-[#b4b8c2]" /> Média 4 semanas
                  </span>
                </div>
              }
            />
            <div className="px-5 pt-3">
              <CallsChart />
            </div>
            <div className="mt-2 grid grid-cols-3 divide-x divide-line-soft border-t border-line-soft">
              {[
                ["Pico do dia", "10h – 11h", "8 chamados"],
                ["Projeção para hoje", "61 chamados", "dentro da capacidade"],
                ["Canal principal", "WhatsApp", "58% dos chamados"],
              ].map(([l, v, sub]) => (
                <div key={l} className="px-5 py-3">
                  <div className="text-[12px] text-ink-4">{l}</div>
                  <div className="mt-0.5 text-[14px] font-semibold text-ink">
                    {v} <span className="text-[12px] font-normal text-ink-3">· {sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card flex flex-col">
            <CardHeader title="Equipe em campo" subtitle="24 técnicos · atualizado agora" action={<Link to="/tecnicos" className="text-[12.5px] font-medium whitespace-nowrap text-ink-3 hover:text-ink">Ver todos</Link>} />
            <FieldTeam />
            <div className="mt-auto border-t border-line-soft px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-2">
                  <Route className="size-3.5 text-brand" /> Últimas decisões da IA
                </span>
              </div>
              <ul className="space-y-2.5">
                {aiDecisions.map((w) => {
                  const tech = technicianById(w.technicianId)!;
                  return (
                    <li key={w.number}>
                      <Link to={`/ordens/${w.number}`} className="group flex items-center gap-2.5 text-[12.5px]">
                        <Avatar name={tech.name} size={22} />
                        <span className="min-w-0 flex-1 truncate text-ink-2">
                          <span className="font-medium text-ink">{firstName(tech.name)}</span> → {w.customerName}
                        </span>
                        <span className="tnum rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand-700">{w.score}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </div>

        <section className="card overflow-hidden">
          <CardHeader
            title="Chamados recentes"
            subtitle="Atualizados em tempo real"
            action={
              <Link to="/chamados" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-3 hover:text-ink">
                Ver todos <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-y border-line-soft bg-subtle">
                <tr>
                  <Th>Cliente</Th>
                  <Th>Problema</Th>
                  <Th>Prioridade</Th>
                  <Th>Técnico</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Recebido</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {recent.map((t) => (
                  <tr key={t.id} onClick={() => navigate(ticketLink(t))} className="cursor-pointer transition-colors hover:bg-subtle">
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={t.customerName} size={28} />
                        <span>
                          <span className="block font-medium text-ink">{t.customerName}</span>
                          <span className="block text-[12px] text-ink-4">
                            {t.code} · {t.channel}
                          </span>
                        </span>
                      </span>
                    </Td>
                    <Td className="text-ink">{t.title}</Td>
                    <Td>
                      <PriorityBadge priority={t.priority} />
                    </Td>
                    <Td>
                      <TechCell id={t.technicianId} fallback={<span className="text-ink-4">Não atribuído</span>} />
                    </Td>
                    <Td>
                      {t.status === "aguardando" ? (
                        <Badge tone="warn" dot>
                          Aguardando despacho
                        </Badge>
                      ) : (
                        <TicketStatusBadge status={t.status} />
                      )}
                    </Td>
                    <Td className="text-right tnum text-ink-3">{t.createdAt}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
