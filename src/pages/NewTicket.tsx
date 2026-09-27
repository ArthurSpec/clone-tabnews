import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Clock3,
  Gauge,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Tag,
  Wrench,
} from "lucide-react";
import { useStore } from "../store/DemoStore";
import { customerById } from "../data/customers";
import { useDispatchFlow } from "../store/useDispatchFlow";
import { Avatar, Badge, Button, PageHeader, PriorityBadge, cx } from "../components/ui";
import { FlowStepper } from "../components/FlowStepper";
import { Highlighted } from "../components/Highlighted";
import { useTimeouts } from "../lib/hooks";
import { addMinutes, toMinutes } from "../lib/format";
import type { Analysis, Channel, Ticket } from "../types";

const CHANNEL_ICON: Record<Channel, typeof Phone> = {
  WhatsApp: MessageCircle,
  Telefone: Phone,
  Portal: Globe,
  "E-mail": Mail,
};

const LOADING_STEPS = ["Analisando chamado…", "Identificando problema…", "Encontrando técnico ideal…"];

function Inbox({ tickets, selected, onSelect }: { tickets: Ticket[]; selected: string; onSelect: (id: string) => void }) {
  const { state } = useStore();
  return (
    <aside className="card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
        <span className="text-[13.5px] font-semibold text-ink">Entrada</span>
        <Badge tone="warn">{tickets.filter((t) => t.status === "aguardando").length} aguardando</Badge>
      </div>
      <ul className="scroll-thin flex-1 overflow-y-auto p-1.5">
        {tickets.map((t) => {
          const Icon = CHANNEL_ICON[t.channel];
          const active = t.id === selected;
          const analyzed = !!state.analyses[t.id];
          return (
            <li key={t.id}>
              <button
                onClick={() => onSelect(t.id)}
                className={cx(
                  "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                  active ? "bg-brand-soft/70" : "hover:bg-subtle",
                )}
              >
                <div className="flex items-center gap-2">
                  <Avatar name={t.customerName} size={26} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{t.customerName}</span>
                  <span className="text-[11.5px] text-ink-4 tnum">{t.createdAt}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 pl-[34px] text-[12.5px] leading-snug text-ink-3">{t.messages?.[0]?.text}</p>
                <div className="mt-2 flex items-center gap-2 pl-[34px]">
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-4">
                    <Icon className="size-3" /> {t.channel}
                  </span>
                  {t.status !== "aguardando" ? (
                    <Badge tone="ok" className="h-[18px] px-1.5 text-[11px]">
                      Despachado
                    </Badge>
                  ) : analyzed ? (
                    <Badge tone="brand" className="h-[18px] px-1.5 text-[11px]">
                      Analisado
                    </Badge>
                  ) : (
                    <Badge tone="warn" className="h-[18px] px-1.5 text-[11px]">
                      Novo
                    </Badge>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function Conversation({ ticket, analysis }: { ticket: Ticket; analysis?: Analysis }) {
  const customer = customerById(ticket.customerId)!;
  const Icon = CHANNEL_ICON[ticket.channel];
  const msg = ticket.messages?.[0];
  return (
    <section className="card flex min-h-[560px] flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-line-soft px-5 py-3.5">
        <Avatar name={ticket.customerName} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14.5px] font-semibold text-ink">{ticket.customerName}</span>
            <span className="text-[12px] text-ink-4">{ticket.code}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-3">
            <Icon className={cx("size-3.5", ticket.channel === "WhatsApp" && "text-ok")} />
            {ticket.channel} · {customer.phone}
          </div>
        </div>
        <Badge tone={ticket.status === "aguardando" ? "warn" : "ok"} dot>
          {ticket.status === "aguardando" ? "Aguardando despacho" : "Despachado"}
        </Badge>
      </header>

      <div
        className="flex-1 space-y-3 px-5 py-6"
        style={{
          backgroundColor: "#f6f6f4",
          backgroundImage: "radial-gradient(rgb(17 19 24 / 0.045) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        <div className="flex justify-center">
          <span className="rounded-md bg-white/80 px-2.5 py-1 text-[11.5px] font-medium text-ink-3 shadow-card">Hoje</span>
        </div>
        {msg && (
          <div className="flex max-w-[82%] animate-rise flex-col items-start">
            <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 text-[14.5px] leading-relaxed text-ink shadow-[0_1px_1px_rgb(17_19_24/0.06)]">
              <Highlighted text={msg.text} terms={analysis?.highlights ?? []} active={!!analysis} />
              <span className="ml-3 inline-block translate-y-0.5 text-[11px] text-ink-4 tnum">{msg.time}</span>
            </div>
          </div>
        )}
        {analysis && (
          <div className="flex justify-end">
            <div className="max-w-[78%] animate-rise rounded-2xl rounded-tr-md bg-[#e4f3e8] px-4 py-3 text-[14px] leading-relaxed text-ink shadow-[0_1px_1px_rgb(17_19_24/0.06)]" style={{ animationDelay: "250ms" }}>
              Olá, {ticket.customerName.split(" ")[0]}! Recebemos sua solicitação e já estamos direcionando um técnico especialista. Você receberá a confirmação do horário em instantes.
              <span className="ml-2 inline-flex translate-y-0.5 items-center gap-1 text-[11px] text-ink-4 tnum">
                {msg?.time ? addMinutes(msg.time, 1) : ""}
                <CheckCheck className="size-3.5 text-info" />
              </span>
            </div>
          </div>
        )}
      </div>

      <footer className="grid grid-cols-3 gap-4 border-t border-line-soft bg-surface px-5 py-3.5 text-[12.5px]">
        <div className="min-w-0">
          <div className="text-ink-4">Endereço</div>
          <div className="mt-0.5 flex items-center gap-1 truncate font-medium text-ink-2">
            <MapPin className="size-3 shrink-0 text-ink-4" />
            <span className="truncate">
              {customer.address} · {customer.neighborhood}
            </span>
          </div>
        </div>
        <div>
          <div className="text-ink-4">Cliente desde</div>
          <div className="mt-0.5 font-medium text-ink-2">
            {customer.since} · {customer.services} atendimentos
          </div>
        </div>
        <div>
          <div className="text-ink-4">Equipamentos</div>
          <div className="mt-0.5 font-medium text-ink-2">{customer.equipment} cadastrados</div>
        </div>
      </footer>
    </section>
  );
}

function IdlePanel({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <Sparkles className="size-5" />
      </div>
      <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-ink">Análise inteligente</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-3">
        A IA interpreta a mensagem do cliente, identifica o problema e as habilidades necessárias e encontra o técnico mais adequado.
      </p>
      <ul className="mt-6 space-y-3">
        {["Problema e categoria", "Equipamento e urgência", "Habilidades necessárias", "Técnico ideal"].map((l) => (
          <li key={l} className="flex items-center gap-3 text-[13px] text-ink-3">
            <span className="size-4 rounded-full border border-dashed border-ink-4/60" />
            {l}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <Button variant="brand" size="lg" className="w-full" icon={<Sparkles className="size-[18px]" />} onClick={onAnalyze}>
          Analisar com IA
        </Button>
        <p className="mt-2.5 text-center text-[12px] text-ink-4">Leva poucos segundos</p>
      </div>
    </div>
  );
}

function LoadingPanel({ step }: { step: number }) {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-2.5 text-[13px] font-medium text-brand-700">
        <span className="relative flex size-2">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand" />
          <span className="relative size-2 rounded-full bg-brand" />
        </span>
        Processando
      </div>
      <ul className="mt-5 space-y-4">
        {LOADING_STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label} className={cx("flex items-center gap-3 text-[14.5px] transition-colors duration-200", done ? "text-ink-3" : active ? "text-ink font-medium" : "text-ink-4")}>
              <span className="flex size-5 items-center justify-center">
                {done ? (
                  <span className="flex size-5 animate-pop items-center justify-center rounded-full bg-ok-soft">
                    <Check className="size-3 text-ok-ink" strokeWidth={3} />
                  </span>
                ) : active ? (
                  <Loader2 className="size-4 animate-spin text-brand" />
                ) : (
                  <span className="size-1.5 rounded-full bg-ink-4/50" />
                )}
              </span>
              {label}
            </li>
          );
        })}
      </ul>
      <div className="mt-8 space-y-3">
        <div className="skeleton h-3.5 w-24" />
        <div className="skeleton h-6 w-4/5" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-6 w-20 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalysisPanel({ analysis, evaluated, ticket }: { analysis: Analysis; evaluated: number; ticket: Ticket }) {
  const navigate = useNavigate();
  const rows: { icon: typeof Tag; label: string; value: React.ReactNode }[] = [
    { icon: Tag, label: "Categoria", value: analysis.categoryLabel },
    { icon: Wrench, label: "Equipamento", value: analysis.equipment },
    ...(analysis.capacity ? [{ icon: Gauge, label: "Capacidade", value: analysis.capacity }] : []),
    { icon: Clock3, label: "Tempo estimado", value: analysis.estimatedDuration },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line-soft px-6 py-3.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[14px] font-semibold whitespace-nowrap text-ink">
            <span className="flex size-5 animate-pop items-center justify-center rounded-full bg-ok">
              <Check className="size-3 text-white" strokeWidth={3} />
            </span>
            Chamado analisado
          </span>
          <span className="text-[12px] text-ink-4">{ticket.code}</span>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="text-[12.5px] whitespace-nowrap text-ink-3">Confiança da análise</span>
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#eeeef2]">
            <span className="bar-grow absolute inset-y-0 left-0 rounded-full bg-ok" style={{ width: `${analysis.confidence}%` }} />
          </span>
          <span className="text-[13px] font-semibold text-ink tnum">{analysis.confidence}%</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 px-6 py-4">
        <div className="animate-rise">
          <div className="text-[12px] text-ink-3">Problema identificado</div>
          <div className="mt-1 text-[19px] font-semibold leading-snug tracking-[-0.015em] text-ink">{analysis.problem}</div>
        </div>

        <div className="grid animate-rise grid-cols-2 gap-x-4 gap-y-3.5" style={{ animationDelay: "60ms" }}>
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
                <r.icon className="size-3.5 text-ink-4" />
                {r.label}
              </div>
              <div className="mt-1 text-[14px] font-medium text-ink">{r.value}</div>
            </div>
          ))}
          <div>
            <div className="text-[12px] text-ink-3">Urgência</div>
            <div className="mt-1">
              <PriorityBadge priority={analysis.priority} />
            </div>
          </div>
        </div>

        <div className="animate-rise" style={{ animationDelay: "120ms" }}>
          <div className="mb-2 text-[12px] text-ink-3">Habilidades necessárias</div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.skills.map((s, i) => (
              <span
                key={s}
                className="inline-flex h-7 animate-pop items-center gap-1.5 rounded-full border border-line bg-surface pr-3 pl-2 text-[13px] font-medium text-ink"
                style={{ animationDelay: `${180 + i * 70}ms` }}
              >
                <Check className="size-3.5 text-ok" strokeWidth={2.6} />
                {s}
              </span>
            ))}
          </div>
        </div>

        {analysis.signals.length > 0 && (
          <div className="animate-rise rounded-lg bg-subtle px-4 py-3" style={{ animationDelay: "180ms" }}>
            <div className="mb-1.5 text-[12px] font-medium text-ink-2">Como a IA chegou a isso</div>
            <ul className="space-y-1">
              {analysis.signals.slice(0, 3).map((s) => (
                <li key={s} className="flex gap-2 text-[12.5px] leading-snug text-ink-3">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-ink-4" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-line-soft px-6 py-3.5">
        {ticket.workOrderNumber ? (
          <Button variant="primary" size="lg" className="w-full" onClick={() => navigate(`/ordens/${ticket.workOrderNumber}`)}>
            Abrir OS #{ticket.workOrderNumber} <ArrowRight className="size-4" />
          </Button>
        ) : (
          <>
            <Button variant="brand" size="lg" className="w-full" onClick={() => navigate(`/despacho/${ticket.id}`)}>
              Ver técnico recomendado <ArrowRight className="size-4" />
            </Button>
            <p className="mt-2 text-center text-[12px] text-ink-4">{evaluated} técnicos avaliados · melhor correspondência encontrada</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function NewTicket() {
  const { state } = useStore();
  const runFlow = useDispatchFlow();
  const [params, setParams] = useSearchParams();
  const after = useTimeouts();

  const inbox = useMemo(
    () => state.tickets.filter((t) => t.messages && (t.status === "aguardando" || state.analyses[t.id])).sort((a, b) => toMinutes(b.createdAt) - toMinutes(a.createdAt)),
    [state.tickets, state.analyses],
  );
  const selectedId = params.get("ticket") ?? inbox.find((t) => t.status === "aguardando")?.id ?? inbox[0]?.id;
  const ticket = state.tickets.find((t) => t.id === selectedId);

  const [running, setRunning] = useState<{ id: string; step: number } | null>(null);
  const analysis = ticket ? state.analyses[ticket.id] : undefined;
  const dispatchResult = ticket ? state.dispatches[ticket.id] : undefined;

  if (!ticket) {
    return (
      <>
        <PageHeader title="Novo chamado" />
        <div className="card p-10 text-center text-ink-3">
          Nenhum chamado aguardando. <Link to="/" className="font-medium text-ink underline">Voltar ao dashboard</Link>
        </div>
      </>
    );
  }

  const isRunning = running?.id === ticket.id;
  const phase: "idle" | "loading" | "done" = isRunning ? "loading" : analysis && dispatchResult ? "done" : "idle";

  const analyze = async () => {
    const id = ticket.id;
    setRunning({ id, step: 0 });
    after(() => setRunning((r) => (r?.id === id ? { id, step: 1 } : r)), 650);
    after(() => setRunning((r) => (r?.id === id ? { id, step: 2 } : r)), 1250);

    await runFlow(id);
    setRunning(null);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-[13px] text-ink-3">
            <Link to="/chamados" className="hover:text-ink">
              Chamados
            </Link>{" "}
            / {ticket.code}
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">Novo chamado</h1>
        </div>
        <FlowStepper current={phase === "done" ? 1 : phase === "loading" ? 1 : 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px] xl:grid-cols-[260px_1fr_400px]">
        <div className="hidden xl:block">
          <Inbox tickets={inbox} selected={ticket.id} onSelect={(id) => setParams({ ticket: id })} />
        </div>
        <Conversation ticket={ticket} analysis={phase === "done" ? analysis : undefined} />
        <section className={cx("card overflow-hidden", phase === "done" && "ring-1 ring-brand-line")}>
          {phase === "idle" && <IdlePanel onAnalyze={analyze} />}
          {phase === "loading" && <LoadingPanel step={running?.step ?? 0} />}
          {phase === "done" && analysis && dispatchResult && <AnalysisPanel analysis={analysis} evaluated={dispatchResult.evaluated} ticket={ticket} />}
        </section>
      </div>
    </>
  );
}
