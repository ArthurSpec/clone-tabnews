import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Check, MapPin, Phone, Play, Quote, Star } from "lucide-react";
import { useStore, WO_FLOW } from "../store/DemoStore";
import { technicianById } from "../data/technicians";
import { Avatar, Badge, Button, CardHeader, Field, PriorityBadge, Stars, WorkOrderStatusBadge, cx } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { FlowStepper } from "../components/FlowStepper";
import { useTimeouts } from "../lib/hooks";
import { CATEGORY_LABEL, WO_STATUS_LABEL, firstName, km, rating } from "../lib/format";
import type { WorkOrder } from "../types";

function ExecutionProgress({ wo }: { wo: WorkOrder }) {
  const idx = WO_FLOW.indexOf(wo.status);
  const tech = technicianById(wo.technicianId)!;
  const liveText: Record<string, string> = {
    agendado: `Atendimento confirmado com ${firstName(tech.name)} para hoje às ${wo.scheduledAt}.`,
    a_caminho: `${firstName(tech.name)} está a caminho · chegada estimada em ${wo.etaMin} min.`,
    em_atendimento: `${firstName(tech.name)} fez check-in no local e iniciou o atendimento.`,
    diagnostico: `Diagnóstico registrado: ${wo.result?.diagnosis ?? wo.events.find((e) => e.key === "diagnostico")?.detail ?? ""}.`,
    concluido: `Serviço concluído e validado pelo cliente.`,
  };
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-ink">Execução</h3>
        <span className="text-[12.5px] text-ink-3">Atualização em tempo real</span>
      </div>
      <div className="relative mt-6">
        <div className="absolute top-[11px] right-[10%] left-[10%] h-[2px] rounded bg-[#ececf0]" />
        <div
          className="absolute top-[11px] left-[10%] h-[2px] rounded bg-ok transition-all duration-700 ease-out"
          style={{ width: `${(idx / (WO_FLOW.length - 1)) * 80}%` }}
        />
        <ol className="relative grid grid-cols-5">
          {WO_FLOW.map((s, i) => {
            const done = i < idx || wo.status === "concluido";
            const active = i === idx && wo.status !== "concluido";
            return (
              <li key={s} className="flex flex-col items-center text-center">
                <span
                  className={cx(
                    "flex size-6 items-center justify-center rounded-full border-2 transition-all duration-300",
                    done && "border-ok bg-ok",
                    active && "border-brand bg-white shadow-[0_0_0_4px_var(--color-brand-soft)]",
                    !done && !active && "border-[#dcdce2] bg-white",
                  )}
                >
                  {done ? <Check className="size-3.5 text-white" strokeWidth={3} /> : active ? <span className="size-2 rounded-full bg-brand" /> : null}
                </span>
                <span className={cx("mt-2 text-[12.5px] leading-tight", active ? "font-semibold text-ink" : done ? "text-ink-2" : "text-ink-4")}>
                  {WO_STATUS_LABEL[s]}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div key={wo.status} className="mt-6 flex animate-rise items-center gap-2.5 rounded-lg bg-subtle px-4 py-3 text-[13.5px] text-ink-2">
        <span className={cx("size-2 shrink-0 rounded-full", wo.status === "concluido" ? "bg-ok" : "bg-brand")} />
        {liveText[wo.status]}
      </div>
    </section>
  );
}

function Timeline({ wo }: { wo: WorkOrder }) {
  return (
    <section className="card">
      <CardHeader title="Timeline" subtitle="Histórico completo do chamado" />
      <ol className="px-5 pb-5">
        {wo.events.map((e, i) => {
          const done = !!e.time;
          const last = i === wo.events.length - 1;
          const next = !done && (i === 0 || !!wo.events[i - 1].time);
          return (
            <li key={e.key} className="relative flex gap-3 pb-4 last:pb-0">
              {!last && <span className={cx("absolute top-6 bottom-0 left-[9px] w-px transition-colors duration-500", done && wo.events[i + 1]?.time ? "bg-ok/40" : "bg-line")} />}
              <span
                className={cx(
                  "relative mt-0.5 flex size-[19px] shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  done ? "bg-ok" : next ? "border-2 border-brand bg-white" : "border-[1.5px] border-[#d6d7dd] bg-white",
                )}
              >
                {done && <Check className="size-3 animate-pop text-white" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={cx("text-[13.5px]", done ? "font-medium text-ink" : "text-ink-4")}>{e.label}</span>
                  {e.time && <span className="text-[12px] text-ink-4 tnum">{e.time}</span>}
                </div>
                {e.detail && done && <div className="mt-0.5 animate-fade-in text-[12.5px] leading-snug text-ink-3">{e.detail}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function WorkOrderDetail() {
  const { number } = useParams();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const after = useTimeouts();
  const [simulating, setSimulating] = useState(false);

  const wo = state.workOrders.find((w) => w.number === Number(number));
  if (!wo) {
    return (
      <div className="card p-10 text-center text-ink-3">
        Ordem de serviço não encontrada. <Link to="/ordens" className="font-medium text-ink underline">Ver todas</Link>
      </div>
    );
  }
  const tech = technicianById(wo.technicianId)!;
  const fromDemo = wo.number >= 10482;
  const done = wo.status === "concluido";

  const simulate = () => {
    const remaining = WO_FLOW.length - 1 - WO_FLOW.indexOf(wo.status);
    setSimulating(true);
    for (let i = 1; i <= remaining; i++) {
      after(() => dispatch({ type: "advance", number: wo.number }), i * 1150);
    }
    after(() => {
      setSimulating(false);
      toast("Atendimento concluído.", { detail: `OS #${wo.number} · avaliação 5,0 ★`, kind: "success" });
    }, remaining * 1150 + 150);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="text-[13px] text-ink-3">
          <Link to="/ordens" className="hover:text-ink">
            Ordens de serviço
          </Link>{" "}
          / OS #{wo.number}
        </div>
        {fromDemo && <FlowStepper current={done ? 4 : 3} />}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-ink tnum">OS #{wo.number}</h1>
          <WorkOrderStatusBadge status={wo.status} size="lg" />
        </div>
        <div className="flex items-center gap-2">
          {done ? (
            <Button variant="brand" size="lg" onClick={() => navigate(`/ordens/${wo.number}/resultado`)}>
              Ver resultado do atendimento <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button variant="brand" size="lg" icon={<Play className="size-4 fill-current" />} loading={simulating} onClick={simulate}>
              {simulating ? "Simulando…" : "Simular atendimento"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <ExecutionProgress wo={wo} />

          {done && wo.result && (
            <section className="card animate-rise overflow-hidden ring-1 ring-ok/25">
              <div className="flex items-center justify-between border-b border-line-soft bg-ok-soft/50 px-5 py-3.5">
                <span className="flex items-center gap-2 text-[14px] font-semibold text-ok-ink">
                  <span className="flex size-5 items-center justify-center rounded-full bg-ok">
                    <Check className="size-3 text-white" strokeWidth={3} />
                  </span>
                  Serviço concluído
                </span>
                {wo.result.firstVisit && <Badge tone="ok">Resolvido na 1ª visita</Badge>}
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <Field label="Problema identificado">{wo.result.diagnosis}</Field>
                <Field label="Serviço realizado">{wo.result.service}</Field>
                <Field label="Tempo">{wo.result.duration}</Field>
                <Field label="Cliente">
                  <Stars value={wo.result.rating} size={17} />
                </Field>
              </div>
              <div className="mx-5 mb-5 flex gap-2.5 rounded-lg bg-subtle px-4 py-3 text-[13px] text-ink-2">
                <Quote className="size-4 shrink-0 text-ink-4" />
                <span>
                  “{wo.result.comment}” <span className="text-ink-4">— {wo.customerName}</span>
                </span>
              </div>
            </section>
          )}

          <section className="card">
            <CardHeader title="Detalhes da ordem de serviço" subtitle={`Criada hoje às ${wo.createdAt} pelo Despacho IA`} />
            <div className="grid gap-x-6 gap-y-5 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Cliente">
                <Link to="/clientes" className="hover:underline">
                  {wo.customerName}
                </Link>
                <div className="mt-0.5 flex items-center gap-1 text-[12.5px] font-normal text-ink-3">
                  <MapPin className="size-3" /> {wo.address}
                </div>
              </Field>
              <Field label="Problema" className="xl:col-span-2">
                {wo.problem}
              </Field>
              <Field label="Técnico">
                <span className="flex items-center gap-2">
                  <Avatar name={tech.name} size={22} /> {tech.name}
                </span>
              </Field>
              <Field label="Horário">Hoje — {wo.scheduledAt}</Field>
              <Field label="Prioridade">
                <PriorityBadge priority={wo.priority} />
              </Field>
              <Field label="Status">
                <WorkOrderStatusBadge status={wo.status} />
              </Field>
              <Field label="Categoria">{CATEGORY_LABEL[wo.category]}</Field>
              <Field label="Score da recomendação">
                <span className="tnum">{wo.score}/100</span>
              </Field>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <Timeline wo={wo} />
          <section className="card p-5">
            <div className="flex items-center gap-3">
              <Avatar name={tech.name} size={42} />
              <div className="min-w-0 flex-1">
                <Link to={`/tecnicos/${tech.id}`} className="text-[14.5px] font-semibold text-ink hover:underline">
                  {tech.name}
                </Link>
                <div className="text-[12.5px] text-ink-3">{tech.role}</div>
              </div>
              <span className="flex items-center gap-1 text-[13px] font-medium text-ink tnum">
                <Star className="size-3.5 fill-[#f5a524] text-[#f5a524]" /> {rating(tech.rating)}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-subtle py-2.5">
                <div className="text-[14px] font-semibold text-ink tnum">{km(wo.distanceKm)}</div>
                <div className="text-[11.5px] text-ink-4">distância</div>
              </div>
              <div className="rounded-lg bg-subtle py-2.5">
                <div className="text-[14px] font-semibold text-ink tnum">{wo.etaMin} min</div>
                <div className="text-[11.5px] text-ink-4">ETA</div>
              </div>
              <div className="rounded-lg bg-subtle py-2.5">
                <div className="text-[14px] font-semibold text-ink tnum">{tech.completionRate}%</div>
                <div className="text-[11.5px] text-ink-4">conclusão</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[12.5px] text-ink-3">
              <Phone className="size-3.5" /> {tech.phone}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
