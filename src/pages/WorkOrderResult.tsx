import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Clock3, MapPin, Plus, Sparkles, Star, Timer, UserCheck } from "lucide-react";
import { useStore } from "../store/DemoStore";
import { technicianById } from "../data/technicians";
import { Avatar, Badge, Button, Stars, cx } from "../components/ui";
import { km } from "../lib/format";

function Tile({
  icon: Icon,
  label,
  children,
  sub,
  delay,
  highlight,
}: {
  icon: typeof Clock3;
  label: string;
  children: React.ReactNode;
  sub?: React.ReactNode;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <div className={cx("card animate-rise p-5", highlight && "ring-1 ring-brand-line")} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 text-[12.5px] text-ink-3">
        <Icon className="size-4 text-ink-4" />
        {label}
      </div>
      <div className="mt-3 text-[26px] leading-tight font-semibold tracking-[-0.03em] text-ink">{children}</div>
      {sub && <div className="mt-2 text-[12.5px] text-ink-3">{sub}</div>}
    </div>
  );
}

export default function WorkOrderResult() {
  const { number } = useParams();
  const { state } = useStore();
  const navigate = useNavigate();
  const wo = state.workOrders.find((w) => w.number === Number(number));

  if (!wo || !wo.result) {
    return (
      <div className="card p-10 text-center text-ink-3">
        O resultado fica disponível quando o atendimento é concluído.{" "}
        <Link to={wo ? `/ordens/${wo.number}` : "/ordens"} className="font-medium text-ink underline">
          Voltar à OS
        </Link>
      </div>
    );
  }

  const tech = technicianById(wo.technicianId)!;
  const journey = wo.events.filter((e) => ["recebido", "analise", "selecionado", "em_atendimento", "concluido"].includes(e.key));
  const JOURNEY_LABEL: Record<string, string> = {
    recebido: "Chamado recebido",
    analise: "IA analisou",
    selecionado: "Técnico atribuído",
    em_atendimento: "Início do atendimento",
    concluido: "Serviço concluído",
  };

  return (
    <>
      <div className="mb-5 text-[13px] text-ink-3">
        <Link to={`/ordens/${wo.number}`} className="inline-flex items-center gap-1 hover:text-ink">
          <ArrowLeft className="size-3.5" /> OS #{wo.number}
        </Link>
      </div>

      <section className="card relative animate-rise overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-ok-soft),transparent_55%)]" />
        <div className="relative flex flex-wrap items-center gap-6 p-7 md:p-8">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-ok shadow-[0_8px_24px_-6px_rgb(22_163_74/0.5)]">
            <svg viewBox="0 0 24 24" className="size-8">
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className="check-draw" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-ok-ink">Resultado do atendimento · OS #{wo.number}</div>
            <h1 className="mt-1 text-[26px] leading-tight font-semibold tracking-[-0.03em] text-ink md:text-[30px]">
              Chamado concluído com o técnico mais adequado para o serviço.
            </h1>
            <p className="mt-2 text-[14px] text-ink-3">
              {wo.customerName} · {wo.problem}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile icon={Timer} label="Tempo até despacho" delay={80} highlight sub={<span className="text-ok-ink">≈10× mais rápido que o despacho manual (38 min)</span>}>
          <span className="tnum">{wo.dispatchTime}</span>
        </Tile>
        <Tile icon={UserCheck} label="Técnico escolhido" delay={140} sub={`Score ${wo.score}/100 · melhor correspondência`}>
          <span className="flex items-center gap-2.5">
            <Avatar name={tech.name} size={32} />
            <span className="truncate text-[22px]">{tech.name}</span>
          </span>
        </Tile>
        <Tile icon={MapPin} label="Distância" delay={200} sub={`Chegada estimada em ${wo.etaMin} min`}>
          <span className="tnum">{km(wo.distanceKm)}</span>
        </Tile>
        <Tile icon={Clock3} label="Tempo de atendimento" delay={260} sub={wo.result.service}>
          <span className="tnum">{wo.result.duration}</span>
        </Tile>
        <Tile icon={Check} label="Primeira visita" delay={320} sub={wo.result.diagnosis}>
          <span className="flex items-center gap-2">
            Resolvido <Badge tone="ok">sem retorno</Badge>
          </span>
        </Tile>
        <Tile icon={Star} label="Avaliação do cliente" delay={380} sub={`“${wo.result.comment}”`}>
          <Stars value={wo.result.rating} size={24} />
        </Tile>
      </div>

      <section className="card mt-4 animate-rise p-6" style={{ animationDelay: "440ms" }}>
        <div className="mb-5 flex items-center gap-2 text-[14px] font-semibold text-ink">
          <Sparkles className="size-4 text-brand" /> Jornada do chamado
        </div>
        <ol className="relative grid grid-cols-5 gap-2">
          <span className="absolute top-[9px] right-[10%] left-[10%] h-[2px] bg-ok/30" />
          {journey.map((e) => (
            <li key={e.key} className="relative flex flex-col items-center text-center">
              <span className="flex size-5 items-center justify-center rounded-full bg-ok ring-4 ring-white">
                <Check className="size-3 text-white" strokeWidth={3} />
              </span>
              <span className="mt-2.5 text-[15px] font-semibold text-ink tnum">{e.time}</span>
              <span className="mt-0.5 text-[12.5px] text-ink-3">{JOURNEY_LABEL[e.key]}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button onClick={() => navigate("/")}>Voltar ao dashboard</Button>
        <Button variant="brand" size="lg" icon={<Plus className="size-4" />} onClick={() => navigate("/chamados/novo")}>
          Próximo chamado
        </Button>
      </div>
    </>
  );
}
