import type { Analysis, Appointment, Candidate, Category, Customer, DispatchResult, Priority, Reason, ScoreFactor, Technician } from "../types";
import { CATEGORY_LABEL, km, toMinutes } from "../lib/format";
import { getRoute } from "./routing";
import { findNextSlot } from "./scheduling";

/**
 * aiService — camada de inteligência do DispatchAI.
 *
 * Esta implementação é determinística (motor de regras + score ponderado), o que garante
 * resultados estáveis. Para conectar um LLM (OpenAI, Anthropic…), implemente `AIProvider`
 * e registre com `setAIProvider()`: a interface do produto não muda.
 */
export interface AIProvider {
  analyzeRequest(input: AnalyzeInput): Promise<Analysis>;
}

export interface AnalyzeInput {
  ticketId: string;
  text: string;
  customer: Customer;
  /** Equipamentos do cliente já cadastrados (ajudam a identificar marca/modelo). */
  knownEquipment?: { id: string; brand: string; capacity: string; type: string }[];
}

export interface DispatchContext {
  technicians: Technician[];
  appointments: Appointment[];
  now: string;
}

let provider: AIProvider | null = null;
export const setAIProvider = (p: AIProvider | null) => {
  provider = p;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────────────────────
// 1. Entendimento do chamado
// ─────────────────────────────────────────────────────────────────────────────

const BRANDS = ["Samsung", "LG", "Midea", "Daikin", "Consul", "Elgin", "Fujitsu", "Gree", "Springer", "Carrier", "Electrolux"];

interface JobProfile {
  jobType: string;
  category: Category;
  skills: string[];
  duration: string;
}

const JOBS: { match: RegExp; profile: JobProfile }[] = [
  {
    match: /ar[- ]?condicionado|split|btu|gelando|gela\b|refriger/i,
    profile: { jobType: "split", category: "climatizacao", skills: ["Ar-condicionado", "Split", "Refrigeração"], duration: "2h" },
  },
  {
    match: /bomba/i,
    profile: { jobType: "bomba", category: "hidraulica", skills: ["Hidráulica", "Bombas"], duration: "1h 30min" },
  },
  {
    match: /vaza|pia|cano|torneira|registro|infiltra/i,
    profile: { jobType: "vazamento", category: "hidraulica", skills: ["Hidráulica", "Detecção de vazamento"], duration: "1h" },
  },
  {
    match: /disjuntor|tomada|energia|curto|quadro|fia[çc][ãa]o/i,
    profile: { jobType: "eletrica", category: "eletrica", skills: ["Elétrica", "Quadro de distribuição"], duration: "1h 30min" },
  },
  {
    match: /c[âa]mara fria|balc[ãa]o/i,
    profile: { jobType: "camara", category: "refrigeracao", skills: ["Refrigeração", "Câmara fria"], duration: "2h 30min" },
  },
];

function find(text: string, re: RegExp) {
  const m = text.match(re);
  return m ? m[0] : undefined;
}

export async function analyzeRequest(input: AnalyzeInput, opts: { latencyMs?: number } = {}): Promise<Analysis> {
  if (provider) return provider.analyzeRequest(input);
  if (opts.latencyMs) await wait(opts.latencyMs);

  const { text } = input;
  const job = (JOBS.find((j) => j.match.test(text)) ?? JOBS[0]).profile;
  const highlights: string[] = [];
  const signals: string[] = [];
  let found = 1; // categoria

  const brand = BRANDS.find((b) => new RegExp(`\\b${b}\\b`, "i").test(text));
  const capacityRaw = find(text, /\d+(?:[.,]\d+)?\s*mil\s*btus?/i) ?? find(text, /\d{1,2}\.?\d{3}\s*btus?/i);
  const capacity = capacityRaw ? `${capacityRaw.match(/\d+/)![0].padEnd(2, "0")}.000 BTUs` : undefined;
  const urgentTerm = find(text, /\bhoje\b|urgente|agora|três vezes|parou/i);
  const damageTerm = find(text, /molhando[^.,]*|pressão caiu|ruído alto/i);

  let problem = "Solicitação de manutenção";
  let equipment = "Equipamento não informado";
  let summary = "";

  if (job.jobType === "split") {
    const symptom = find(text, /não est[áa] gelando|não gela|não refrigera|não liga/i);
    const works = find(text, /liga normalmente/i);
    if (symptom) {
      highlights.push(symptom);
      found++;
    }
    if (works) highlights.push(works);
    problem = symptom && /liga/i.test(symptom) ? "Ar-condicionado não liga" : "Ar-condicionado não refrigerando";
    equipment = brand ? `Split ${brand}` : "Split";
    summary = works
      ? "Equipamento energiza normalmente, mas não troca calor — provável falha no ciclo de refrigeração."
      : "Falha de refrigeração em equipamento split.";
    signals.push(works ? "Liga normalmente, mas não gela → falha no ciclo de refrigeração" : "Sintoma de falha na refrigeração");
  } else if (job.jobType === "vazamento") {
    const where = find(text, /embaixo da pia|sob a pia|no banheiro|na cozinha|no teto/i);
    const leak = find(text, /vazamento|vazando/i);
    if (leak) {
      highlights.push(leak);
      found++;
    }
    if (where) {
      highlights.push(where);
      found++;
    }
    problem = "Vazamento";
    equipment = where && /pia/i.test(where) ? "Tubulação e sifão da pia" : "Rede hidráulica";
    summary = "Vazamento ativo na tubulação sob a pia, com água atingindo o móvel.";
    signals.push("Vazamento ativo em ponto de uso → reparo hidráulico localizado");
  } else if (job.jobType === "eletrica") {
    const symptom = find(text, /disjuntor[^.,]*desarma/i) ?? find(text, /disjuntor/i);
    if (symptom) {
      highlights.push(symptom);
      found++;
    }
    const loads = find(text, /micro-ondas junto com a geladeira/i);
    if (loads) highlights.push(loads);
    problem = "Disjuntor desarmando por sobrecarga";
    equipment = "Circuito da cozinha";
    summary = "Desarme recorrente ao somar cargas — provável circuito subdimensionado.";
    signals.push("Desarma com cargas simultâneas → sobrecarga no circuito");
  } else if (job.jobType === "bomba") {
    const symptom = find(text, /bomba d'água[^.,]*ruído alto/i) ?? find(text, /bomba/i);
    if (symptom) {
      highlights.push(symptom);
      found++;
    }
    problem = "Bomba d'água com ruído e baixa pressão";
    equipment = "Bomba de recalque";
    summary = "Ruído anormal com queda de pressão — possível desgaste mecânico na bomba.";
    signals.push("Ruído + queda de pressão → desgaste mecânico provável");
  } else {
    problem = "Câmara fria sem temperatura";
    equipment = "Câmara fria";
    summary = "Perda de temperatura em câmara fria comercial.";
  }

  if (brand) {
    highlights.push(brand);
    found++;
  }
  if (capacityRaw) {
    highlights.push(capacityRaw);
    found++;
  }
  if (brand && capacity) signals.push(`Marca e capacidade informadas: ${brand} ${capacity}`);

  let priority: Priority = "baixa";
  if (urgentTerm) {
    priority = "alta";
    highlights.push(urgentTerm);
    found++;
    signals.push(/hoje/i.test(urgentTerm) ? "Cliente pede atendimento hoje → urgência alta" : "Falha recorrente → urgência alta");
  } else if (damageTerm || job.category === "hidraulica") {
    priority = "media";
    if (damageTerm) {
      highlights.push(damageTerm);
      found++;
      signals.push("Dano em andamento, sem risco imediato → prioridade média");
    }
  }

  const known = input.knownEquipment?.find((e) => brand && e.brand === brand && (!capacity || e.capacity === capacity));
  if (known) signals.push(`Equipamento localizado no cadastro do cliente (${known.id})`);

  const skills = brand && job.category === "climatizacao" ? [...job.skills, brand] : job.skills;

  return {
    ticketId: input.ticketId,
    summary,
    problem,
    category: job.category,
    categoryLabel: CATEGORY_LABEL[job.category],
    equipment,
    brand,
    capacity,
    priority,
    estimatedDuration: job.duration,
    jobType: job.jobType,
    skills,
    confidence: Math.min(97, 86 + found * 2),
    signals,
    highlights,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Matching de técnicos
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHTS: Record<ScoreFactor["key"], number> = {
  skills: 0.35,
  experience: 0.2,
  proximity: 0.15,
  availability: 0.15,
  quality: 0.15,
};

const FACTOR_LABEL: Record<ScoreFactor["key"], string> = {
  skills: "Compatibilidade técnica",
  experience: "Experiência em casos semelhantes",
  proximity: "Proximidade",
  availability: "Disponibilidade",
  quality: "Qualidade e 1ª visita",
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));

function hasSkill(t: Technician, skill: string) {
  return t.skills.includes(skill) || t.brands.includes(skill);
}

function availability(t: Technician, now: string): { value: number; label: string; available: boolean; excluded?: string } {
  if (t.status === "folga") return { value: 0, label: "Folga hoje", available: false, excluded: "Folga hoje" };
  if (t.note) return { value: 0, label: t.note, available: false, excluded: t.note };
  if (t.status === "disponivel") return { value: 100, label: "Disponível agora", available: true };
  const freeIn = t.freeAt ? toMinutes(t.freeAt) - toMinutes(now) : 999;
  return { value: freeIn <= 60 ? 80 : 60, label: `Disponível às ${t.freeAt}`, available: false };
}

function scoreTechnician(t: Technician, analysis: Analysis, customer: Customer, now: string) {
  const route = getRoute(t.pos, customer.pos);
  const matched = analysis.skills.filter((s) => hasSkill(t, s));
  const missing = analysis.skills.filter((s) => !hasSkill(t, s));
  const avail = availability(t, now);
  const similar = t.similarJobs[analysis.jobType] ?? 0;
  const cfv = t.categoryFirstVisit[analysis.category] ?? t.firstVisitRate - 10;

  const values: Record<ScoreFactor["key"], number> = {
    skills: (matched.length / analysis.skills.length) * 100,
    experience: clamp((similar / 45) * 100),
    proximity: clamp(100 - route.distanceKm * 5),
    availability: avail.value,
    quality: clamp((t.rating - 4) * 100) * 0.4 + cfv * 0.6,
  };
  const factors: ScoreFactor[] = (Object.keys(WEIGHTS) as ScoreFactor["key"][]).map((key) => ({
    key,
    label: FACTOR_LABEL[key],
    value: Math.round(values[key]),
    weight: WEIGHTS[key],
  }));
  const score = Math.round(factors.reduce((sum, f) => sum + (values[f.key] * f.weight), 0));
  const noSkill = matched.length === 0 || !hasSkill(t, analysis.skills[0]);

  return {
    route,
    matched,
    missing,
    avail,
    similar,
    cfv,
    factors,
    score,
    excludedReason: noSkill ? `Sem habilidade em ${analysis.categoryLabel.toLowerCase()}` : avail.excluded,
  };
}

/**
 * Avalia todos os técnicos e devolve o ranking com score, explicação e ressalvas.
 */
export async function findBestTechnician(
  analysis: Analysis,
  customer: Customer,
  ctx: DispatchContext,
  opts: { latencyMs?: number } = {},
): Promise<DispatchResult> {
  if (opts.latencyMs) await wait(opts.latencyMs);

  const scored = ctx.technicians.map((t) => ({ t, s: scoreTechnician(t, analysis, customer, ctx.now) }));
  scored.sort((a, b) => {
    if (!!a.s.excludedReason !== !!b.s.excludedReason) return a.s.excludedReason ? 1 : -1;
    return b.s.score - a.s.score;
  });

  const best = scored[0];
  const candidates: Candidate[] = scored.map(({ t, s }, i) => ({
    technician: t,
    score: s.excludedReason ? Math.min(s.score, 45) : s.score,
    distanceKm: s.route.distanceKm,
    etaMin: s.route.etaMin,
    similarJobs: s.similar,
    available: s.avail.available,
    availabilityLabel: s.avail.label,
    factors: s.factors,
    reasons: i === 0 ? generateDispatchReason(t, analysis, s) : [],
    caveat: i === 0 ? undefined : s.excludedReason ?? caveatFor(t, analysis, s, best.s),
    excluded: !!s.excludedReason,
  }));

  const durationMin = /(\d+)h(?:\s*(\d+))?/.exec(analysis.estimatedDuration);
  const minutes = durationMin ? Number(durationMin[1]) * 60 + Number(durationMin[2] ?? 0) : 60;

  return {
    ticketId: analysis.ticketId,
    evaluated: ctx.technicians.length,
    candidates,
    scheduledAt: findNextSlot(ctx.appointments, best.t.id, minutes, ctx.now, best.t.status === "disponivel" ? undefined : best.t.freeAt),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Explicação da recomendação
// ─────────────────────────────────────────────────────────────────────────────

type Scored = ReturnType<typeof scoreTechnician>;

export function generateDispatchReason(t: Technician, analysis: Analysis, s: Scored): Reason[] {
  const reasons: Reason[] = [];
  if (analysis.brand && t.brands.includes(analysis.brand)) {
    reasons.push({ text: `Especialista em ${analysis.brand}`, detail: `Certificado em ${t.brands.slice(0, 4).join(", ")}` });
  } else {
    reasons.push({ text: `Especialista em ${analysis.categoryLabel.toLowerCase()}`, detail: s.matched.join(" · ") });
  }
  reasons.push({ text: `Já resolveu ${s.similar} chamados semelhantes`, detail: `${analysis.problem} · últimos 12 meses` });
  reasons.push(
    s.avail.available
      ? { text: "Está disponível", detail: "Sem conflito de agenda para hoje" }
      : { text: s.avail.label, detail: "Encaixe sem remanejar outros atendimentos" },
  );
  reasons.push({ text: `Está a ${km(s.route.distanceKm)} do cliente`, detail: `Chegada estimada em ${s.route.etaMin} min` });
  if (s.cfv >= 85) {
    reasons.push({
      text: "Alta taxa de resolução na primeira visita",
      detail: `${s.cfv}% em ${analysis.categoryLabel.toLowerCase()}`,
    });
  }
  return reasons;
}

function caveatFor(t: Technician, analysis: Analysis, s: Scored, best: Scored): string {
  if (s.missing.length) {
    const brandMissing = analysis.brand && s.missing.includes(analysis.brand);
    return brandMissing ? `Sem especialização ${analysis.brand}` : `Sem habilidade: ${s.missing[0].toLowerCase()}`;
  }
  const gaps = s.factors
    .filter((f) => f.key !== "skills")
    .map((f) => ({ key: f.key, gap: (best.factors.find((b) => b.key === f.key)!.value - f.value) * f.weight }))
    .sort((a, b) => b.gap - a.gap);
  switch (gaps[0]?.key) {
    case "availability":
      return t.freeAt ? `Em atendimento até ${t.freeAt}` : "Agenda mais apertada";
    case "proximity":
      return `Mais distante do cliente`;
    case "experience":
      return `Menos casos semelhantes (${s.similar})`;
    default:
      return "Menor taxa de resolução na 1ª visita";
  }
}
