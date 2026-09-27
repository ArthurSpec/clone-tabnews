import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, MapPin, User, X } from "lucide-react";
import { useStore } from "../store/DemoStore";
import { AGENDA_TECHS } from "../data/schedule";
import { technicianById } from "../data/technicians";
import { DEMO_NOW } from "../data/tickets";
import { Avatar, Badge, Button, PageHeader, cx } from "../components/ui";
import { Tabs } from "./Tickets";
import { addMinutes, dateLong, dateParts, toMinutes } from "../lib/format";
import type { Appointment } from "../types";

const KIND: Record<Appointment["kind"], { label: string; bar: string; bg: string }> = {
  preventiva: { label: "Preventiva", bar: "bg-ok", bg: "bg-ok-soft/60" },
  manutencao: { label: "Manutenção", bar: "bg-info", bg: "bg-info-soft/70" },
  instalacao: { label: "Instalação", bar: "bg-[#8b5cf6]", bg: "bg-[#f4f0fe]" },
  corretiva: { label: "Corretiva", bar: "bg-warn", bg: "bg-warn-soft/70" },
};

const DAY_START = 7 * 60;
const DAY_END = 19 * 60;

function isNew(a: Appointment) {
  return (a.workOrderNumber ?? 0) >= 10482;
}

function Chip({ a, onClick }: { a: Appointment; onClick: () => void }) {
  const k = KIND[a.kind];
  return (
    <button
      onClick={onClick}
      className={cx(
        "group relative flex w-full items-center gap-1.5 overflow-hidden rounded-md py-1 pr-1.5 pl-2.5 text-left text-[11.5px] transition-all hover:shadow-card",
        isNew(a) ? "bg-brand text-white shadow-[0_2px_8px_-2px_rgb(67_80_196/0.5)] animate-pop" : cx(k.bg, "text-ink-2 hover:brightness-[0.98]"),
      )}
    >
      <span className={cx("absolute inset-y-0 left-0 w-[3px]", isNew(a) ? "bg-white/50" : k.bar)} />
      <span className={cx("font-semibold tnum", isNew(a) ? "text-white" : "text-ink")}>{a.start}</span>
      <span className="truncate">{a.title}</span>
    </button>
  );
}

function Drawer({ a, onClose }: { a: Appointment; onClose: () => void }) {
  const navigate = useNavigate();
  const tech = technicianById(a.technicianId)!;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 animate-fade-in bg-ink/10" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-[400px] flex-col bg-surface"
        style={{ boxShadow: "var(--shadow-pop)", animation: "rise 240ms cubic-bezier(0.2,0.7,0.2,1) both" }}
      >
        <div className="flex items-center justify-between border-b border-line-soft px-6 py-4">
          <Badge tone={isNew(a) ? "brand" : "neutral"}>{isNew(a) ? "Despacho IA" : KIND[a.kind].label}</Badge>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-ink-3 hover:bg-black/[0.04] hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 space-y-6 px-6 py-6">
          <div>
            <div className="text-[13px] text-ink-3">{a.day === 0 ? "Hoje" : dateLong(a.day)}</div>
            <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-ink">{a.title}</h2>
            <div className="mt-1 text-[14px] text-ink-3">{a.customer}</div>
          </div>
          <div className="space-y-3 text-[13.5px]">
            <div className="flex items-center gap-2.5 text-ink-2">
              <Clock3 className="size-4 text-ink-4" /> {a.start} – {addMinutes(a.start, a.durationMin)}
            </div>
            <div className="flex items-center gap-2.5 text-ink-2">
              <MapPin className="size-4 text-ink-4" /> {a.address}
            </div>
            <div className="flex items-center gap-2.5 text-ink-2">
              <User className="size-4 text-ink-4" /> {tech.name}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-subtle p-4">
            <Avatar name={tech.name} size={40} />
            <div>
              <div className="text-[14px] font-medium text-ink">{tech.name}</div>
              <div className="text-[12.5px] text-ink-3">{tech.role}</div>
            </div>
          </div>
        </div>
        {a.workOrderNumber && (
          <div className="border-t border-line-soft px-6 py-4">
            <Button variant="primary" className="w-full" size="lg" onClick={() => navigate(`/ordens/${a.workOrderNumber}`)}>
              Abrir OS #{a.workOrderNumber} <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}

function WeekView({ appointments, onOpen }: { appointments: Appointment[]; onOpen: (a: Appointment) => void }) {
  const days = [0, 1, 2, 3, 4, 5];
  return (
    <section className="card overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[200px_repeat(6,minmax(0,1fr))] border-b border-line-soft bg-subtle">
            <div className="px-4 py-3 text-[12px] font-medium text-ink-3">Técnico</div>
            {days.map((d) => {
              const p = dateParts(d);
              return (
                <div key={d} className={cx("border-l border-line-soft px-3 py-2.5", d === 0 && "bg-brand-soft/50")}>
                  <div className={cx("text-[11.5px] font-medium", d === 0 ? "text-brand-700" : "text-ink-4")}>{d === 0 ? "Hoje" : p.weekday}</div>
                  <div className={cx("text-[15px] font-semibold tnum", d === 0 ? "text-brand-700" : "text-ink")}>
                    {p.day} <span className="text-[12px] font-normal text-ink-4">{p.month}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {AGENDA_TECHS.map((id) => {
            const tech = technicianById(id)!;
            return (
              <div key={id} className="grid grid-cols-[200px_repeat(6,minmax(0,1fr))] border-b border-line-soft last:border-b-0">
                <div className="flex items-start gap-2.5 px-4 py-3">
                  <Avatar name={tech.name} size={28} />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-ink">{tech.name}</div>
                    <div className="truncate text-[11.5px] text-ink-4">{tech.area}</div>
                  </div>
                </div>
                {days.map((d) => (
                  <div key={d} className={cx("min-h-[96px] space-y-1 border-l border-line-soft p-1.5", d === 0 && "bg-brand-soft/20")}>
                    {appointments
                      .filter((a) => a.technicianId === id && a.day === d)
                      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
                      .map((a) => (
                        <Chip key={a.id} a={a} onClick={() => onOpen(a)} />
                      ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DayView({ appointments, day, onOpen }: { appointments: Appointment[]; day: number; onOpen: (a: Appointment) => void }) {
  const hours = Array.from({ length: 12 }, (_, i) => 7 + i);
  const pos = (min: number) => `${((min - DAY_START) / (DAY_END - DAY_START)) * 100}%`;
  return (
    <section className="card overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[200px_minmax(0,1fr)] border-b border-line-soft bg-subtle">
            <div className="px-4 py-3 text-[12px] font-medium text-ink-3">Técnico</div>
            <div className="relative h-full">
              {hours.map((h) => (
                <span key={h} className="absolute top-1/2 -translate-y-1/2 pl-1.5 text-[11.5px] text-ink-4 tnum" style={{ left: pos(h * 60) }}>
                  {String(h).padStart(2, "0")}:00
                </span>
              ))}
            </div>
          </div>
          {AGENDA_TECHS.map((id) => {
            const tech = technicianById(id)!;
            return (
              <div key={id} className="grid grid-cols-[200px_minmax(0,1fr)] border-b border-line-soft last:border-b-0">
                <div className="flex items-center gap-2.5 px-4 py-3">
                  <Avatar name={tech.name} size={28} />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-ink">{tech.name}</div>
                    <div className="truncate text-[11.5px] text-ink-4">{tech.area}</div>
                  </div>
                </div>
                <div className="relative h-[64px]">
                  {hours.map((h) => (
                    <span key={h} className="absolute inset-y-0 w-px bg-line-soft" style={{ left: pos(h * 60) }} />
                  ))}
                  {day === 0 && <span className="absolute inset-y-0 z-10 w-px bg-bad/60" style={{ left: pos(toMinutes(DEMO_NOW)) }} />}
                  {appointments
                    .filter((a) => a.technicianId === id && a.day === day)
                    .map((a) => {
                      const s = toMinutes(a.start);
                      const k = KIND[a.kind];
                      return (
                        <button
                          key={a.id}
                          onClick={() => onOpen(a)}
                          className={cx(
                            "absolute top-2 bottom-2 overflow-hidden rounded-md py-1 pr-1.5 pl-2.5 text-left transition-shadow hover:shadow-card",
                            isNew(a) ? "bg-brand text-white animate-pop" : cx(k.bg, "text-ink-2"),
                          )}
                          style={{ left: `calc(${pos(s)} + 2px)`, width: `calc(${pos(DAY_START + a.durationMin)} - 4px)` }}
                        >
                          <span className={cx("absolute inset-y-0 left-0 w-[3px]", isNew(a) ? "bg-white/50" : k.bar)} />
                          <div className={cx("truncate text-[11.5px] font-semibold", isNew(a) ? "text-white" : "text-ink")}>{a.title}</div>
                          <div className={cx("truncate text-[11px] tnum", isNew(a) ? "text-white/80" : "text-ink-3")}>
                            {a.start} · {a.customer}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {day === 0 && (
        <div className="flex items-center gap-2 border-t border-line-soft px-4 py-2.5 text-[12px] text-ink-4">
          <span className="h-3 w-px bg-bad/60" /> Agora · {DEMO_NOW}
        </div>
      )}
    </section>
  );
}

export default function Agenda() {
  const { state } = useStore();
  const [view, setView] = useState("semana");
  const [day, setDay] = useState(0);
  const [open, setOpen] = useState<Appointment | null>(null);
  const todayCount = state.appointments.filter((a) => a.day === 0).length;

  return (
    <>
      <PageHeader
        title="Agenda"
        subtitle={`${dateLong()} · ${todayCount} atendimentos hoje`}
        actions={<Tabs items={[{ key: "semana", label: "Semana" }, { key: "dia", label: "Dia" }]} value={view} onChange={setView} />}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {view === "dia" ? (
          <Tabs
            items={[0, 1, 2, 3, 4, 5].map((d) => ({ key: String(d), label: d === 0 ? "Hoje" : `${dateParts(d).weekday} ${dateParts(d).day}` }))}
            value={String(day)}
            onChange={(k) => setDay(Number(k))}
          />
        ) : (
          <span className="text-[13px] text-ink-3">Próximos 6 dias · {AGENDA_TECHS.length} técnicos</span>
        )}
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-ink-3">
          {Object.values(KIND).map((k) => (
            <span key={k.label} className="flex items-center gap-1.5">
              <span className={cx("h-3 w-[3px] rounded", k.bar)} /> {k.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-[3px] rounded bg-brand" /> Despacho IA
          </span>
        </div>
      </div>

      {view === "semana" ? (
        <WeekView appointments={state.appointments} onOpen={setOpen} />
      ) : (
        <DayView appointments={state.appointments} day={day} onOpen={setOpen} />
      )}

      {open && <Drawer a={open} onClose={() => setOpen(null)} />}
    </>
  );
}
