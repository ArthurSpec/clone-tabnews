import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type {
  Analysis,
  Appointment,
  Candidate,
  DispatchResult,
  TechStatus,
  Ticket,
  TicketStatus,
  TimelineEvent,
  WorkOrder,
  WorkOrderStatus,
} from "../types";
import { seedTickets, DEMO_CLOCK, TODAY_BASELINE } from "../data/tickets";
import { buildSeedAppointments } from "../data/schedule";
import { customerById } from "../data/customers";
import { technicianById } from "../data/technicians";
import { JOB_BY_CATEGORY, RESOLUTIONS } from "../data/resolutions";
import { addMinutes, secondsLabel, toMinutes, toSeconds } from "../lib/format";

// Estado da aplicação. Nesta versão vive no navegador (localStorage);
// cada ação do reducer corresponde a um endpoint da futura API.

const STORAGE_KEY = "dispatchai:demo:v1";

export interface State {
  tickets: Ticket[];
  workOrders: WorkOrder[];
  appointments: Appointment[];
  analyses: Record<string, Analysis>;
  dispatches: Record<string, DispatchResult>;
  techStatus: Record<string, TechStatus>;
  nextWorkOrder: number;
  demoMode: boolean;
}

export const WO_FLOW: WorkOrderStatus[] = ["agendado", "a_caminho", "em_atendimento", "diagnostico", "concluido"];

function timelineFor(
  ticket: Ticket,
  opts: { receivedAt: string; analyzedAt: string; assignedAt: string; problem: string; confidence: number; techName: string; score: number; scheduledAt: string },
): TimelineEvent[] {
  return [
    { key: "recebido", label: "Chamado recebido", time: opts.receivedAt.slice(0, 5), detail: `Via ${ticket.channel}` },
    { key: "analise", label: "IA analisou", time: opts.analyzedAt.slice(0, 5), detail: `${opts.problem} · confiança ${opts.confidence}%` },
    { key: "selecionado", label: "Técnico selecionado", time: opts.assignedAt.slice(0, 5), detail: `${opts.techName} · score ${opts.score}/100` },
    { key: "agendado", label: "Atendimento agendado", time: opts.assignedAt.slice(0, 5), detail: `Hoje às ${opts.scheduledAt} · cliente notificado` },
    { key: "a_caminho", label: "Técnico a caminho" },
    { key: "em_atendimento", label: "Em atendimento" },
    { key: "diagnostico", label: "Diagnóstico" },
    { key: "concluido", label: "Concluído" },
  ];
}

function progressEvents(wo: WorkOrder, upTo: WorkOrderStatus): WorkOrder {
  const res = RESOLUTIONS[JOB_BY_CATEGORY[wo.category]];
  const start = addMinutes(wo.scheduledAt, -1);
  const times: Record<string, [string, string]> = {
    a_caminho: [addMinutes(wo.scheduledAt, -18), `Saiu para o atendimento · ETA ${wo.etaMin} min`],
    em_atendimento: [start, "Check-in no endereço do cliente"],
    diagnostico: [addMinutes(start, 18), res.diagnosis],
    concluido: [addMinutes(start, res.minutes), res.service],
  };
  const idx = WO_FLOW.indexOf(upTo);
  const events = wo.events.map((e) => {
    const stepIdx = WO_FLOW.indexOf(e.key as WorkOrderStatus);
    if (stepIdx > 0 && stepIdx <= idx) return { ...e, time: times[e.key][0], detail: times[e.key][1] };
    return e;
  });
  const { minutes: _m, ...result } = res;
  void _m;
  return { ...wo, status: upTo, events, result: upTo === "concluido" ? result : wo.result };
}

const TICKET_BY_WO: Record<WorkOrderStatus, TicketStatus> = {
  agendado: "agendado",
  a_caminho: "a_caminho",
  em_atendimento: "em_atendimento",
  diagnostico: "diagnostico",
  concluido: "concluido",
};

function seedWorkOrders(appointments: Appointment[]): WorkOrder[] {
  return seedTickets
    .filter((t) => t.workOrderNumber && t.technicianId)
    .map((t) => {
      const tech = technicianById(t.technicianId!)!;
      const customer = customerById(t.customerId)!;
      const appt = appointments.find((a) => a.workOrderNumber === t.workOrderNumber);
      const scheduledAt = appt?.start ?? addMinutes(t.createdAt, 50);
      const status = (t.status === "aguardando" ? "agendado" : t.status) as WorkOrderStatus;
      const assignedAt = addMinutes(t.createdAt, 3);
      const base: WorkOrder = {
        number: t.workOrderNumber!,
        ticketId: t.id,
        customerId: t.customerId,
        customerName: t.customerName,
        address: `${customer.address} · ${customer.neighborhood}`,
        problem: t.title,
        category: t.category,
        technicianId: tech.id,
        score: 84 + ((t.workOrderNumber! * 7) % 13),
        distanceKm: 2 + ((t.workOrderNumber! * 3) % 60) / 10,
        etaMin: 6 + ((t.workOrderNumber! * 5) % 18),
        scheduledAt,
        priority: t.priority,
        status: "agendado",
        dispatchTime: secondsLabel(150 + ((t.workOrderNumber! * 37) % 120)),
        createdAt: t.createdAt,
        events: timelineFor(t, {
          receivedAt: t.createdAt,
          analyzedAt: addMinutes(t.createdAt, 1),
          assignedAt,
          problem: t.title,
          confidence: 93 + (t.workOrderNumber! % 4),
          techName: tech.name,
          score: 84 + ((t.workOrderNumber! * 7) % 13),
          scheduledAt,
        }),
      };
      return status === "agendado" ? base : progressEvents(base, status);
    })
    .sort((a, b) => b.number - a.number);
}

export function buildInitialState(): State {
  const appointments = buildSeedAppointments();
  return {
    tickets: seedTickets,
    workOrders: seedWorkOrders(appointments),
    appointments,
    analyses: {},
    dispatches: {},
    techStatus: {},
    nextWorkOrder: 10482,
    demoMode: false,
  };
}

type Action =
  | { type: "saveAnalysis"; analysis: Analysis }
  | { type: "saveDispatch"; result: DispatchResult }
  | { type: "assign"; ticketId: string; candidate: Candidate; scheduledAt: string }
  | { type: "advance"; number: number }
  | { type: "setDemoMode"; on: boolean }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "saveAnalysis":
      return { ...state, analyses: { ...state.analyses, [action.analysis.ticketId]: action.analysis } };

    case "saveDispatch":
      return { ...state, dispatches: { ...state.dispatches, [action.result.ticketId]: action.result } };

    case "assign": {
      const ticket = state.tickets.find((t) => t.id === action.ticketId);
      if (!ticket || ticket.workOrderNumber) return state;
      const analysis = state.analyses[ticket.id];
      const customer = customerById(ticket.customerId)!;
      const { candidate, scheduledAt } = action;
      const tech = candidate.technician;
      const clock = DEMO_CLOCK[ticket.id] ?? {
        receivedAt: `${ticket.createdAt}:00`,
        analyzedAt: `${addMinutes(ticket.createdAt, 1)}:10`,
        assignedAt: `${addMinutes(ticket.createdAt, 3)}:20`,
      };
      const number = state.nextWorkOrder;
      const durationMin = RESOLUTIONS[analysis?.jobType ?? JOB_BY_CATEGORY[ticket.category]]?.minutes ?? 90;

      const wo: WorkOrder = {
        number,
        ticketId: ticket.id,
        customerId: ticket.customerId,
        customerName: ticket.customerName,
        address: `${customer.address} · ${customer.neighborhood}`,
        problem: analysis ? `${analysis.equipment} — ${analysis.problem.toLowerCase()}` : ticket.title,
        category: analysis?.category ?? ticket.category,
        technicianId: tech.id,
        score: candidate.score,
        distanceKm: candidate.distanceKm,
        etaMin: candidate.etaMin,
        scheduledAt,
        priority: analysis?.priority ?? ticket.priority,
        status: "agendado",
        dispatchTime: secondsLabel(toSeconds(clock.assignedAt) - toSeconds(clock.receivedAt)),
        createdAt: clock.assignedAt.slice(0, 5),
        events: timelineFor(ticket, {
          ...clock,
          problem: analysis?.problem ?? ticket.title,
          confidence: analysis?.confidence ?? 94,
          techName: tech.name,
          score: candidate.score,
          scheduledAt,
        }),
      };

      const appointment: Appointment = {
        id: `ag-os-${number}`,
        technicianId: tech.id,
        day: 0,
        start: scheduledAt,
        durationMin: Math.max(60, Math.round(durationMin / 30) * 30),
        title: ticket.customerName,
        customer: analysis?.problem ?? ticket.title,
        address: `${customer.address} · ${customer.neighborhood}`,
        kind: "corretiva",
        workOrderNumber: number,
      };

      return {
        ...state,
        nextWorkOrder: number + 1,
        workOrders: [wo, ...state.workOrders],
        appointments: [...state.appointments, appointment].sort((a, b) => toMinutes(a.start) - toMinutes(b.start)),
        tickets: state.tickets.map((t) =>
          t.id === ticket.id
            ? { ...t, status: "agendado", technicianId: tech.id, workOrderNumber: number, priority: wo.priority, title: analysis?.problem ?? t.title }
            : t,
        ),
      };
    }

    case "advance": {
      const wo = state.workOrders.find((w) => w.number === action.number);
      if (!wo || wo.status === "concluido") return state;
      const next = WO_FLOW[WO_FLOW.indexOf(wo.status) + 1];
      const updated = progressEvents(wo, next);
      const techStatus: TechStatus =
        next === "a_caminho" ? "em_deslocamento" : next === "concluido" ? "disponivel" : "em_atendimento";
      return {
        ...state,
        workOrders: state.workOrders.map((w) => (w.number === wo.number ? updated : w)),
        tickets: state.tickets.map((t) => (t.id === wo.ticketId ? { ...t, status: TICKET_BY_WO[next] } : t)),
        techStatus: { ...state.techStatus, [wo.technicianId]: techStatus },
      };
    }

    case "setDemoMode":
      return { ...state, demoMode: action.on };

    case "reset":
      return { ...buildInitialState(), demoMode: state.demoMode };
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as State;
  } catch {
    /* sem storage disponível: segue com o estado inicial */
  }
  return buildInitialState();
}

interface Store {
  state: State;
  dispatch: React.Dispatch<Action>;
  stats: { received: number; inService: number; awaiting: number; done: number };
  techStatus: (id: string) => TechStatus;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignora */
    }
  }, [state]);

  const stats = useMemo(() => {
    const awaiting = state.tickets.filter((t) => t.status === "aguardando").length;
    const newlyDone = state.workOrders.filter((w) => w.number >= 10482 && w.status === "concluido").length;
    const done = TODAY_BASELINE.done + newlyDone;
    return { received: TODAY_BASELINE.received, awaiting, done, inService: TODAY_BASELINE.received - awaiting - done };
  }, [state.tickets, state.workOrders]);

  const techStatus = useCallback(
    (id: string) => state.techStatus[id] ?? technicianById(id)?.status ?? "disponivel",
    [state.techStatus],
  );

  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const value = useMemo(() => ({ state, dispatch, stats, techStatus, reset }), [state, stats, techStatus, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore fora do DemoStoreProvider");
  return ctx;
}
