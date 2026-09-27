import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, CalendarDays, Check, Clock3, MapPin, Phone, Star, Target, Wrench } from "lucide-react";
import { useStore } from "../store/DemoStore";
import { technicianById } from "../data/technicians";
import { Avatar, Badge, Button, CardHeader, TechStatusLabel } from "../components/ui";
import { durationLabel, rating, toMinutes } from "../lib/format";

function Stat({ icon: Icon, label, value, sub }: { icon: typeof Star; label: string; value: string; sub?: string }) {
  return (
    <div className="card px-5 py-4">
      <div className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
        <Icon className="size-3.5 text-ink-4" /> {label}
      </div>
      <div className="mt-2 text-[26px] leading-none font-semibold tracking-[-0.03em] text-ink tnum">{value}</div>
      {sub && <div className="mt-2 text-[12px] text-ink-4">{sub}</div>}
    </div>
  );
}

const HISTORY_CUSTOMERS = ["Carla Nogueira", "Residencial Monte Verde", "Helena Duarte", "Clínica Bem Viver", "Beatriz Campos"];
const HISTORY_DAYS = ["Hoje", "Ontem", "Há 2 dias", "Há 3 dias", "Há 4 dias"];

export default function TechnicianProfile() {
  const { id = "" } = useParams();
  const { state, techStatus } = useStore();
  const navigate = useNavigate();
  const t = technicianById(id);

  if (!t) {
    return (
      <div className="card p-10 text-center text-ink-3">
        Técnico não encontrado. <Link to="/tecnicos" className="font-medium text-ink underline">Ver técnicos</Link>
      </div>
    );
  }

  const similar = Object.values(t.similarJobs)[0] ?? 0;
  const isClimate = t.skills.includes("Split");
  const history = (isClimate && t.brands.length ? t.brands : t.skills).slice(0, 4).map((b, i) => ({
    title: isClimate ? `${b} Split` : b,
    detail: isClimate ? ["Recarga de gás", "Troca de capacitor", "Limpeza de dreno", "Sensor de temperatura"][i] : ["Reparo", "Manutenção", "Diagnóstico", "Instalação"][i],
    customer: HISTORY_CUSTOMERS[i],
    day: HISTORY_DAYS[i],
  }));
  const today = state.appointments.filter((a) => a.technicianId === t.id && a.day === 0).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  return (
    <>
      <div className="mb-5 text-[13px] text-ink-3">
        <Link to="/tecnicos" className="inline-flex items-center gap-1 hover:text-ink">
          <ArrowLeft className="size-3.5" /> Técnicos
        </Link>
      </div>

      <section className="card mb-4 flex flex-wrap items-center gap-5 p-6">
        <Avatar name={t.name} size={68} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] font-semibold tracking-[-0.025em] text-ink">{t.name}</h1>
          <div className="mt-0.5 text-[14px] text-ink-3">{t.role}</div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-3">
            <TechStatusLabel status={techStatus(t.id)} />
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-ink-4" /> {t.region}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-ink-4" /> {t.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="size-3.5 text-ink-4" /> Na ClimaTech desde {t.since}
            </span>
          </div>
        </div>
        <Button icon={<CalendarDays className="size-4" />} onClick={() => navigate("/agenda")}>
          Ver agenda
        </Button>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat icon={Wrench} label="Serviços semelhantes" value={String(similar)} sub="Últimos 12 meses" />
        <Stat icon={Target} label="Taxa de conclusão" value={`${t.completionRate}%`} sub="Média da equipe: 91%" />
        <Stat icon={Star} label="Avaliação" value={rating(t.rating)} sub={`${t.servicesMonth * 11} avaliações`} />
        <Stat icon={Check} label="Primeira visita resolvida" value={`${t.firstVisitRate}%`} sub="Todas as categorias" />
        <Stat icon={Clock3} label="Tempo médio" value={durationLabel(t.avgDurationMin).replace("min", "m")} sub="Por atendimento" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card">
          <CardHeader title="Especialidades" subtitle="Usadas pela IA no matching" />
          <div className="px-5 pb-5">
            {t.brands.length > 0 && (
              <>
                <div className="mb-2 text-[12px] text-ink-3">Marcas certificadas</div>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {t.brands.map((b) => (
                    <span key={b} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface pr-3 pl-2 text-[13px] font-medium text-ink">
                      <Check className="size-3.5 text-ok" strokeWidth={2.6} /> {b}
                    </span>
                  ))}
                </div>
              </>
            )}
            <div className="mb-2 text-[12px] text-ink-3">Habilidades</div>
            <div className="flex flex-wrap gap-1.5">
              {t.skills.map((s) => (
                <span key={s} className="rounded-md bg-subtle px-2 py-1 text-[12.5px] font-medium text-ink-2 ring-1 ring-line-soft">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <CardHeader title="Histórico recente" subtitle="Últimos atendimentos concluídos" />
          <ul className="divide-y divide-line-soft px-5 pb-2">
            {history.map((h) => (
              <li key={h.title} className="flex items-center gap-3 py-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-subtle text-ink-3">
                  <Wrench className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-ink">{h.title}</div>
                  <div className="truncate text-[12px] text-ink-4">
                    {h.detail} · {h.customer} · {h.day}
                  </div>
                </div>
                <Badge tone="ok" dot>
                  Resolvido
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <CardHeader title="Agenda de hoje" subtitle={`${today.length} atendimentos`} action={<Link to="/agenda" className="text-[12.5px] font-medium text-ink-3 hover:text-ink">Abrir</Link>} />
          <ul className="space-y-2 px-5 pb-5">
            {today.length === 0 && <li className="text-[13px] text-ink-4">Sem atendimentos hoje.</li>}
            {today.map((a) => {
              const body = (
                <div className="flex items-center gap-3 rounded-lg border border-line-soft px-3 py-2.5 transition-colors hover:bg-subtle">
                  <span className="w-11 text-[13px] font-semibold text-ink tnum">{a.start}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-ink">{a.title}</div>
                    <div className="truncate text-[12px] text-ink-4">{a.customer}</div>
                  </div>
                </div>
              );
              return (
                <li key={a.id}>{a.workOrderNumber ? <Link to={`/ordens/${a.workOrderNumber}`}>{body}</Link> : body}</li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
