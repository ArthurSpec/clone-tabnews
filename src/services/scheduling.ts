import type { Appointment } from "../types";
import { fromMinutes, toMinutes } from "../lib/format";

// Encontra a próxima janela livre na agenda do técnico (hoje).
// Para produção: mover para o backend, respeitando jornada, deslocamento e SLA do contrato.

const LEAD_MIN = 60; // antecedência mínima para confirmar com o cliente
const SLOT_STEP = 30;
const DAY_END = 19 * 60;

export function findNextSlot(appointments: Appointment[], technicianId: string, durationMin: number, now: string, freeAt?: string): string {
  const busy = appointments
    .filter((a) => a.technicianId === technicianId && a.day === 0)
    .map((a) => [toMinutes(a.start), toMinutes(a.start) + a.durationMin] as const);

  const earliest = Math.max(toMinutes(now) + LEAD_MIN, freeAt ? toMinutes(freeAt) : 0);
  let start = Math.ceil(earliest / SLOT_STEP) * SLOT_STEP;
  while (start + durationMin <= DAY_END) {
    const end = start + durationMin;
    const clash = busy.find(([s, e]) => start < e && end > s);
    if (!clash) return fromMinutes(start);
    start = Math.ceil(clash[1] / SLOT_STEP) * SLOT_STEP;
  }
  return fromMinutes(start);
}
