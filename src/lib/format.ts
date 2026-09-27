import type { Category, Priority, TechStatus, TicketStatus, WorkOrderStatus } from "../types";

export const km = (v: number) => `${v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;

export const pct = (v: number, digits = 0) =>
  `${v.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

export const rating = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const int = (v: number) => v.toLocaleString("pt-BR");

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const addMinutes = (hhmm: string, delta: number) => fromMinutes(toMinutes(hhmm) + delta);

/** "13:08:05" → segundos desde 00:00 */
export function toSeconds(hms: string) {
  const [h, m, s = 0] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export function durationLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}min`;
  if (!m) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

export function secondsLabel(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export const initials = (name: string) =>
  name
    .split(" ")
    .filter((p) => p.length > 2 || p === p.toUpperCase())
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export const firstName = (name: string) => name.split(" ")[0];

export const CATEGORY_LABEL: Record<Category, string> = {
  climatizacao: "Climatização",
  hidraulica: "Hidráulica",
  eletrica: "Elétrica",
  refrigeracao: "Refrigeração",
};

export const PRIORITY_LABEL: Record<Priority, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };

export const TECH_STATUS_LABEL: Record<TechStatus, string> = {
  disponivel: "Disponível",
  em_atendimento: "Em atendimento",
  em_deslocamento: "Em deslocamento",
  folga: "Folga",
};

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  aguardando: "Aguardando despacho",
  agendado: "Agendado",
  a_caminho: "Técnico a caminho",
  em_atendimento: "Em atendimento",
  diagnostico: "Diagnóstico realizado",
  concluido: "Concluído",
};

export const WO_STATUS_LABEL: Record<WorkOrderStatus, string> = {
  agendado: "Agendado",
  a_caminho: "Técnico a caminho",
  em_atendimento: "Em atendimento",
  diagnostico: "Diagnóstico realizado",
  concluido: "Concluído",
};

export function dateLong(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const s = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function dateParts(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    day: d.getDate(),
    month: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
  };
}
