import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CalendarCheck2, Check, ChevronDown, Loader2, MapPin, Star, Timer } from "lucide-react";
import { useStore } from "../store/DemoStore";
import { useDispatchFlow } from "../store/useDispatchFlow";
import { customerById } from "../data/customers";
import { technicians } from "../data/technicians";
import { Avatar, Badge, Button, CardHeader, Dot, PriorityBadge, ScoreRing, cx } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { FlowStepper } from "../components/FlowStepper";
import { RegionMap } from "../components/map/RegionMap";
import { useTimeouts } from "../lib/hooks";
import { firstName, km, rating } from "../lib/format";
import type { Analysis, Candidate, DispatchResult } from "../types";

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-subtle px-3.5 py-2.5">
      <div className="text-[12px] whitespace-nowrap text-ink-3">{label}</div>
      <div className="mt-0.5 text-[17px] font-semibold tracking-[-0.01em] text-ink tnum">{value}</div>
    </div>
  );
}

function RecommendedCard({
  c,
  result,
  onAssign,
  assigning,
  assignedNumber,
}: {
  c: Candidate;
  result: DispatchResult;
  onAssign: () => void;
  assigning: boolean;
  assignedNumber?: number;
}) {
  const navigate = useNavigate();
  const t = c.technician;
  return (
    <section className="card relative flex flex-col self-start overflow-hidden ring-1 ring-brand-line lg:sticky lg:top-[72px]">
      <div className="h-1 w-full bg-brand" />
      <div className="flex items-center justify-between px-6 pt-4">
        <span className="eyebrow !text-brand-700">Técnico recomendado</span>
        <Badge tone="brand">
          <Check className="size-3" strokeWidth={3} /> Melhor correspondência
        </Badge>
      </div>

      <div className="flex items-center gap-4 px-6 pt-4">
        <Avatar name={t.name} size={54} />
        <div className="min-w-0 flex-1">
          <Link to={`/tecnicos/${t.id}`} className="block truncate text-[21px] font-semibold tracking-[-0.02em] text-ink hover:underline">
            {t.name}
          </Link>
          <div className="mt-0.5 text-[13px] text-ink-3">{t.role}</div>
          <div className="mt-1.5 flex items-center gap-2 text-[13px] font-medium text-ok-ink">
            <Dot tone="ok" pulse />
            {c.availabilityLabel}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <ScoreRing value={c.score} size={68} stroke={6} />
          <span className="mt-1 text-[11px] text-ink-4 tnum">de 100</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 px-6">
        <Metric label="Distância" value={km(c.distanceKm)} />
        <Metric label="ETA" value={`${c.etaMin} min`} />
        <Metric
          label="Avaliação"
          value={
            <span className="flex items-center gap-1">
              {rating(t.rating)} <Star className="size-3.5 fill-[#f5a524] text-[#f5a524]" />
            </span>
          }
        />
        <Metric label="Serviços semelhantes" value={c.similarJobs} />
      </div>

      <div className="mt-4 px-6">
        <div className="mb-2 text-[13.5px] font-semibold text-ink">Por que {firstName(t.name)}?</div>
        <ul className="space-y-2">
          {c.reasons.map((r, i) => (
            <li key={r.text} className="flex animate-rise gap-2.5" style={{ animationDelay: `${150 + i * 80}ms` }}>
              <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-ok-soft">
                <Check className="size-3 text-ok-ink" strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium leading-snug text-ink">{r.text}</div>
                <div className="text-[12px] leading-snug text-ink-4">{r.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 pt-5 pb-5">
        {assignedNumber ? (
          <Button variant="primary" size="lg" className="w-full" onClick={() => navigate(`/ordens/${assignedNumber}`)}>
            Abrir OS #{assignedNumber} <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button variant="brand" size="lg" className="h-12 w-full text-[15px]" loading={assigning} onClick={onAssign}>
            {assigning ? "Atribuindo…" : "Atribuir chamado"}
          </Button>
        )}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[12.5px] text-ink-3">
          <CalendarCheck2 className="size-3.5 text-ink-4" />
          Horário sugerido: <span className="font-medium text-ink">hoje às {result.scheduledAt}</span>
        </div>
      </div>
    </section>
  );
}

function OtherCard({ c, onHover, hovered }: { c: Candidate; onHover: (id: string | null) => void; hovered: boolean }) {
  const t = c.technician;
  const skillGap = c.caveat?.startsWith("Sem ");
  return (
    <Link
      to={`/tecnicos/${t.id}`}
      onMouseEnter={() => onHover(t.id)}
      onMouseLeave={() => onHover(null)}
      className={cx("card card-hover block p-4", hovered && "shadow-lift")}
    >
      <div className="flex items-center gap-3">
        <Avatar name={t.name} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-ink">{t.name}</div>
          <div className="truncate text-[12px] text-ink-3">{t.role}</div>
        </div>
        <div className="text-right">
          <div className="text-[17px] font-semibold tracking-[-0.02em] text-ink-2 tnum">
            {c.score}
            <span className="text-[12px] font-normal text-ink-4">/100</span>
          </div>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-3 text-[12.5px] text-ink-3">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5 text-ink-4" /> <span className="tnum">{km(c.distanceKm)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Dot tone={c.available ? "ok" : "info"} />
          {c.available ? "Disponível" : c.availabilityLabel}
        </span>
      </div>
      {c.caveat && (
        <div className={cx("mt-3 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px]", skillGap ? "bg-warn-soft text-warn-ink" : "bg-subtle text-ink-3")}>
          <AlertCircle className="size-3.5 shrink-0" />
          {c.caveat}
        </div>
      )}
    </Link>
  );
}

const SHORT: Record<string, string> = {
  skills: "Habilidades",
  experience: "Experiência",
  proximity: "Proximidade",
  availability: "Agenda",
  quality: "Qualidade",
};

function FactorTable({ candidates, recommendedId }: { candidates: Candidate[]; recommendedId: string }) {
  const factors = candidates[0].factors;
  return (
    <section className="card overflow-hidden">
      <CardHeader title="Como o score foi calculado" subtitle="Cada técnico é avaliado em cinco fatores ponderados — não apenas pela distância." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] table-fixed">
          <thead className="border-y border-line-soft bg-subtle">
            <tr>
              <th className="h-11 w-[170px] px-5 text-left text-[12px] font-medium text-ink-3">Técnico</th>
              {factors.map((f) => (
                <th key={f.key} className="h-11 px-3 leading-tight text-left text-[12px] font-medium text-ink-3">
                  <span className="block">{SHORT[f.key]}</span>
                  <span className="block text-[11px] font-normal text-ink-4">peso {Math.round(f.weight * 100)}%</span>
                </th>
              ))}
              <th className="h-11 w-[76px] px-5 text-right text-[12px] font-medium text-ink-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {candidates.map((c) => {
              const rec = c.technician.id === recommendedId;
              return (
                <tr key={c.technician.id} className={cx(rec && "bg-brand-soft/40")}>
                  <td className="h-12 px-5">
                    <span className="flex items-center gap-2 text-[13px] font-medium whitespace-nowrap text-ink">
                      <Avatar name={c.technician.name} size={22} />
                      <span className="truncate">{c.technician.name}</span>
                    </span>
                  </td>
                  {c.factors.map((f) => (
                    <td key={f.key} className="h-12 px-3">
                      <div className="flex items-center gap-2">
                        <span className="relative h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-[#ececf0]">
                          <span
                            className={cx("bar-grow absolute inset-y-0 left-0 rounded-full", rec ? "bg-brand" : f.value < 60 ? "bg-[#c9ccd4]" : "bg-[#9a9fab]")}
                            style={{ width: `${f.value}%` }}
                          />
                        </span>
                        <span className="w-6 text-[12px] text-ink-3 tnum">{f.value}</span>
                      </div>
                    </td>
                  ))}
                  <td className="h-12 px-5 text-right">
                    <span className={cx("text-[14px] font-semibold tnum", rec ? "text-brand-700" : "text-ink-2")}>{c.score}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AssignedOverlay({ c, scheduledAt, number, onOpen }: { c: Candidate; scheduledAt: string; number: number; onOpen: () => void }) {
  const [step, setStep] = useState(0);
  const after = useTimeouts();
  useEffect(() => {
    after(() => setStep(1), 450);
    after(() => setStep(2), 900);
    after(() => setStep(3), 1350);
  }, []);
  const items = [
    `${firstName(c.technician.name)} recebeu a OS no aplicativo`,
    "Cliente notificado via WhatsApp",
    `Ordem de serviço #${number} criada`,
  ];
  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-[#111318]/25 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[420px] animate-pop rounded-2xl bg-surface p-7 text-center" style={{ boxShadow: "var(--shadow-pop)" }}>
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-ok-soft">
          <svg viewBox="0 0 24 24" className="size-7">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="var(--color-ok)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className="check-draw" />
          </svg>
        </div>
        <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.02em] text-ink">Chamado atribuído</h2>
        <p className="mt-1 text-[14px] text-ink-3">{c.technician.name} foi notificado.</p>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-subtle px-4 py-3 text-[14px] text-ink">
          <CalendarCheck2 className="size-4 text-brand" />
          <span>
            Atendimento agendado para <span className="font-semibold">hoje às {scheduledAt}</span>.
          </span>
        </div>

        <ul className="mt-5 space-y-2.5 text-left">
          {items.map((label, i) => (
            <li key={label} className={cx("flex items-center gap-2.5 text-[13.5px] transition-all duration-300", step > i ? "text-ink-2 opacity-100" : "text-ink-4 opacity-40")}>
              <span className={cx("flex size-[18px] items-center justify-center rounded-full transition-colors", step > i ? "bg-ok" : "bg-[#ececf0]")}>
                {step > i ? <Check className="size-3 text-white" strokeWidth={3} /> : <Loader2 className="size-3 animate-spin text-ink-4" />}
              </span>
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-6 h-1 overflow-hidden rounded-full bg-[#ececf0]">
          <div className="progress-run h-full rounded-full bg-brand" style={{ ["--dur" as string]: "2.8s" }} />
        </div>
        <button onClick={onOpen} className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-3 hover:text-ink">
          Abrindo ordem de serviço… <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="card flex h-[480px] flex-col items-center justify-center gap-3 text-ink-3">
      <Loader2 className="size-6 animate-spin text-brand" />
      <span className="text-[14px]">Encontrando técnico ideal…</span>
    </div>
  );
}

export default function AIDispatch() {
  const { ticketId = "" } = useParams();
  const { state, dispatch } = useStore();
  const runFlow = useDispatchFlow();
  const toast = useToast();
  const navigate = useNavigate();
  const after = useTimeouts();

  const [hovered, setHovered] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [overlay, setOverlay] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const ticket = state.tickets.find((t) => t.id === ticketId);
  const analysis: Analysis | undefined = state.analyses[ticketId];
  const result: DispatchResult | undefined = state.dispatches[ticketId];

  useEffect(() => {
    if (ticket && (!analysis || !result)) runFlow(ticket.id, { analyze: 300, match: 700 });
  }, [ticketId]);

  if (!ticket) {
    return (
      <div className="card p-10 text-center text-ink-3">
        Chamado não encontrado. <Link to="/despacho" className="font-medium text-ink underline">Voltar ao despacho</Link>
      </div>
    );
  }

  const customer = customerById(ticket.customerId)!;
  const ranked = result?.candidates.filter((c) => !c.excluded) ?? [];
  const best = ranked[0];
  const top = ranked.slice(0, 4);
  const rest = result ? result.candidates.filter((c) => !top.includes(c)) : [];

  const assign = () => {
    if (!best || !result) return;
    setAssigning(true);
    after(() => {
      const number = state.nextWorkOrder;
      dispatch({ type: "assign", ticketId: ticket.id, candidate: best, scheduledAt: result.scheduledAt });
      setAssigning(false);
      setOverlay(number);
      toast("Chamado atribuído com sucesso.", { detail: `${best.technician.name} · hoje às ${result.scheduledAt}` });
      after(() => toast("Cliente notificado.", { detail: `${ticket.customerName} recebeu a confirmação via WhatsApp`, kind: "message" }), 700);
      after(() => toast("Ordem de serviço criada.", { detail: `OS #${number}`, kind: "doc" }), 1400);
      after(() => navigate(`/ordens/${number}`), 3000);
    }, 900);
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="text-[13px] text-ink-3">
          <Link to="/despacho" className="hover:text-ink">
            Despacho IA
          </Link>{" "}
          / {ticket.code} · {ticket.customerName}
        </div>
        <FlowStepper current={ticket.workOrderNumber ? 3 : 2} />
      </div>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-[34px] leading-none font-semibold tracking-[-0.035em] text-ink">AI Dispatch</h1>
          <p className="mt-2.5 text-[15.5px] text-ink-3">Encontramos o técnico mais adequado para este chamado.</p>
        </div>
        {analysis && (
          <div className="card flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <div className="min-w-0">
              <div className="text-[11.5px] text-ink-4">{ticket.customerName} · {customer.neighborhood}</div>
              <div className="text-[13.5px] font-semibold text-ink">{analysis.problem}</div>
            </div>
            <span className="h-8 w-px bg-line" />
            <div className="flex flex-wrap items-center gap-1.5">
              {analysis.skills.map((s) => (
                <span key={s} className="rounded-md bg-subtle px-2 py-1 text-[12px] font-medium text-ink-2 ring-1 ring-line-soft">
                  {s}
                </span>
              ))}
            </div>
            <PriorityBadge priority={analysis.priority} />
          </div>
        )}
      </div>

      {!result || !best ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
            <div className="flex min-w-0 flex-col gap-4">
              <section className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                  <div>
                    <h3 className="text-[14px] font-semibold text-ink">Região do atendimento</h3>
                    <p className="mt-0.5 text-[12.5px] text-ink-3">
                      {result.evaluated} técnicos avaliados em tempo real · {top.length} melhores exibidos
                    </p>
                  </div>
                  <span className="hidden items-center gap-1.5 text-[12.5px] whitespace-nowrap text-ink-3 xl:flex">
                    <Timer className="size-3.5" /> Chegada estimada: <span className="font-medium text-ink">{best.etaMin} min</span>
                  </span>
                </div>
                <RegionMap
                  customer={{ name: customer.name, pos: customer.pos }}
                  candidates={top}
                  recommendedId={best.technician.id}
                  fleet={technicians}
                  hoveredId={hovered}
                  onHover={setHovered}
                  assigned={!!overlay || !!ticket.workOrderNumber}
                  height={380}
                />
              </section>
              <FactorTable candidates={top} recommendedId={best.technician.id} />
            </div>

            <RecommendedCard c={best} result={result} onAssign={assign} assigning={assigning} assignedNumber={overlay ? undefined : ticket.workOrderNumber} />
          </div>

          <div className="mt-8 mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Outros técnicos</h2>
              <p className="mt-0.5 text-[12.5px] text-ink-3">Mais próximos nem sempre são os mais adequados.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {top.slice(1).map((c) => (
              <OtherCard key={c.technician.id} c={c} onHover={setHovered} hovered={hovered === c.technician.id} />
            ))}
          </div>

          <button
            onClick={() => setShowAll((v) => !v)}
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 hover:text-ink"
          >
            <ChevronDown className={cx("size-4 transition-transform", showAll && "rotate-180")} />
            {showAll ? "Ocultar" : "Ver"} os outros {rest.length} técnicos avaliados
          </button>
          {showAll && (
            <div className="card mt-3 animate-rise overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-line-soft">
                  {rest.map((c) => (
                    <tr key={c.technician.id}>
                      <td className="h-11 px-5">
                        <span className="flex items-center gap-2 text-[13px] text-ink">
                          <Avatar name={c.technician.name} size={22} /> {c.technician.name}
                        </span>
                      </td>
                      <td className="px-3 text-[12.5px] text-ink-3">{c.technician.area}</td>
                      <td className="px-3 text-[12.5px] text-ink-3 tnum">{km(c.distanceKm)}</td>
                      <td className="px-3 text-[12.5px] text-ink-3">{c.caveat}</td>
                      <td className="px-5 text-right text-[13px] font-medium text-ink-3 tnum">{c.excluded ? "—" : c.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {overlay && best && result && (
        <AssignedOverlay c={best} scheduledAt={result.scheduledAt} number={overlay} onOpen={() => navigate(`/ordens/${overlay}`)} />
      )}
    </>
  );
}
