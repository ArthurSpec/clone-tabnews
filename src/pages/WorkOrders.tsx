import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/DemoStore";
import { PageHeader, PriorityBadge, Td, Th, WorkOrderStatusBadge } from "../components/ui";
import { TechCell } from "./Dashboard";
import { Tabs } from "./Tickets";
import type { WorkOrder } from "../types";

const FILTERS: { key: string; label: string; match: (w: WorkOrder) => boolean }[] = [
  { key: "todas", label: "Todas", match: () => true },
  { key: "agendadas", label: "Agendadas", match: (w) => w.status === "agendado" },
  { key: "execucao", label: "Em execução", match: (w) => ["a_caminho", "em_atendimento", "diagnostico"].includes(w.status) },
  { key: "concluidas", label: "Concluídas", match: (w) => w.status === "concluido" },
];

export default function WorkOrders() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("todas");
  const f = FILTERS.find((x) => x.key === filter)!;
  const rows = state.workOrders.filter(f.match);

  return (
    <>
      <PageHeader title="Ordens de serviço" subtitle="Criadas automaticamente a partir do Despacho IA" />
      <div className="mb-4">
        <Tabs items={FILTERS.map((x) => ({ key: x.key, label: x.label, count: state.workOrders.filter(x.match).length }))} value={filter} onChange={setFilter} />
      </div>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-line-soft bg-subtle">
              <tr>
                <Th>OS</Th>
                <Th>Cliente</Th>
                <Th>Problema</Th>
                <Th>Técnico</Th>
                <Th>Horário</Th>
                <Th>Prioridade</Th>
                <Th>Status</Th>
                <Th className="text-right">Score IA</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map((w) => (
                <tr key={w.number} onClick={() => navigate(`/ordens/${w.number}`)} className="cursor-pointer transition-colors hover:bg-subtle">
                  <Td className="font-medium text-ink tnum">#{w.number}</Td>
                  <Td className="text-ink">{w.customerName}</Td>
                  <Td className="max-w-[280px] truncate">{w.problem}</Td>
                  <Td>
                    <TechCell id={w.technicianId} />
                  </Td>
                  <Td className="tnum">Hoje, {w.scheduledAt}</Td>
                  <Td>
                    <PriorityBadge priority={w.priority} />
                  </Td>
                  <Td>
                    <WorkOrderStatusBadge status={w.status} />
                  </Td>
                  <Td className="text-right">
                    <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[12px] font-semibold text-brand-700 tnum">{w.score}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line-soft px-4 py-3 text-[12.5px] text-ink-4">{rows.length} ordens de serviço hoje</div>
      </section>
    </>
  );
}
