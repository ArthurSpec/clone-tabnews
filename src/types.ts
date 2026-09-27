// Tipos de domínio do DispatchAI.
// Espelham o formato esperado de uma futura API — os mocks em src/data seguem o mesmo contrato.

export type Priority = "alta" | "media" | "baixa";

export type Category = "climatizacao" | "hidraulica" | "eletrica" | "refrigeracao";

export type TechStatus = "disponivel" | "em_atendimento" | "em_deslocamento" | "folga";

export type TicketStatus =
  | "aguardando"
  | "agendado"
  | "a_caminho"
  | "em_atendimento"
  | "diagnostico"
  | "concluido";

export type Channel = "WhatsApp" | "Telefone" | "Portal" | "E-mail";

export interface Technician {
  id: string;
  name: string;
  role: string;
  area: string;
  status: TechStatus;
  rating: number;
  completionRate: number; // %
  firstVisitRate: number; // %
  avgDurationMin: number;
  skills: string[];
  brands: string[];
  /** Serviços semelhantes concluídos, por tipo de trabalho (ex.: "split", "vazamento"). */
  similarJobs: Record<string, number>;
  /** Taxa de resolução na primeira visita por categoria (%). */
  categoryFirstVisit: Partial<Record<Category, number>>;
  servicesMonth: number;
  region: string;
  since: string;
  phone: string;
  /** Posição no mapa estilizado (0–100). */
  pos: { x: number; y: number };
  /** Horário em que fica livre (técnicos em atendimento). */
  freeAt?: string;
  /** Restrição operacional (ex.: agenda completa) — usada quando o técnico é descartado. */
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  type: "Residencial" | "Comercial" | "Condomínio";
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
  since: string;
  equipment: number;
  services: number;
  lastService: string;
  pos: { x: number; y: number };
}

export interface Equipment {
  id: string;
  type: string;
  brand: string;
  model: string;
  capacity: string;
  customer: string;
  installedAt: string;
  lastService: string;
  health: "ok" | "atencao" | "critico";
}

export interface ChatMessage {
  from: "customer" | "company";
  text: string;
  time: string;
}

export interface Ticket {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  title: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  channel: Channel;
  createdAt: string; // HH:mm
  technicianId?: string;
  workOrderNumber?: number;
  /** Conversa original (chamados recebidos por mensagem). */
  messages?: ChatMessage[];
}

export interface Analysis {
  ticketId: string;
  summary: string;
  problem: string;
  category: Category;
  categoryLabel: string;
  equipment: string;
  brand?: string;
  capacity?: string;
  priority: Priority;
  estimatedDuration: string;
  jobType: string;
  skills: string[];
  confidence: number;
  signals: string[];
  /** Trechos da mensagem original que sustentaram a análise. */
  highlights: string[];
}

export interface ScoreFactor {
  key: "skills" | "experience" | "proximity" | "availability" | "quality";
  label: string;
  value: number; // 0–100
  weight: number; // 0–1
}

export interface Reason {
  text: string;
  detail: string;
}

export interface Candidate {
  technician: Technician;
  score: number;
  distanceKm: number;
  etaMin: number;
  similarJobs: number;
  available: boolean;
  availabilityLabel: string;
  factors: ScoreFactor[];
  reasons: Reason[];
  caveat?: string;
  excluded?: boolean;
}

export interface DispatchResult {
  ticketId: string;
  evaluated: number;
  candidates: Candidate[];
  scheduledAt: string;
}

export type WorkOrderStatus = "agendado" | "a_caminho" | "em_atendimento" | "diagnostico" | "concluido";

export interface TimelineEvent {
  key: string;
  label: string;
  time?: string;
  detail?: string;
}

export interface ServiceResult {
  diagnosis: string;
  service: string;
  duration: string;
  rating: number;
  firstVisit: boolean;
  comment: string;
}

export interface WorkOrder {
  number: number;
  ticketId: string;
  customerId: string;
  customerName: string;
  address: string;
  problem: string;
  category: Category;
  technicianId: string;
  score: number;
  distanceKm: number;
  etaMin: number;
  scheduledAt: string;
  priority: Priority;
  status: WorkOrderStatus;
  events: TimelineEvent[];
  dispatchTime: string;
  result?: ServiceResult;
  createdAt: string;
}

export interface Appointment {
  id: string;
  technicianId: string;
  day: number; // 0 = hoje
  start: string; // HH:mm
  durationMin: number;
  title: string;
  customer: string;
  address: string;
  kind: "manutencao" | "instalacao" | "corretiva" | "preventiva";
  workOrderNumber?: number;
}
