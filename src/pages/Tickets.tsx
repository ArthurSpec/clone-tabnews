import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Mail, MessageCircle, Phone, Plus } from "lucide-react";
import { useStore } from "../store/DemoStore";
import { Avatar, Badge, Button, PageHeader, PriorityBadge, TicketStatusBadge, Td, Th, cx } from "../components/ui";
import { TechCell, ticketLink } from "./Dashboard";
import { CATEGORY_LABEL, toMinutes } from "../lib/format";
import type { Channel, Ticket } from "../types";

export const CHANNEL_ICON: Record<Channel, typeof Phone> = { WhatsApp: MessageCircle, Telefone: Phone, Portal: Globe, "E-mail": Mail };

const FILTERS: { key: string; label: string; match: (t: Ticket) => boolean }[] = [
  { key: "todos", label: "Todos", match: () => true },
  { key: "aguardando", label: "Aguardando despacho", match: (t) => t.status === "aguardando" },
  { key: "andamento", label: "Em andamento", match: (t) => !["aguardando", "concluido"].includes(t.status) },
  { key: "concluidos", label: "Concluídos", match: (t) => t.status === "concluido" },
];

export function Tabs({ items, value, onChange }: { items: { key: string; label: string; count?: number }[]; value: string; onChange: (k: string) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-[#efeff2] p-1">
      {items.map((i) => (
        <button
          key={i.key}
          onClick={() => onChange(i.key)}
          className={cx(
            "flex h-7 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-all",
            value === i.key ? "bg-white text-ink shadow-card" : "text-ink-3 hover:text-ink",
          )}
        >
          {i.label}
          {i.count !== undefined && <span className={cx("tnum text-[11.5px]", value === i.key ? "text-ink-3" : "text-ink-4")}>{i.count}</span>}
        </button>
      ))}
    </div>
  );
}

export default function Tickets() {
  const { state, stats } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("todos");
  const sorted = [...state.tickets].sort((a, b) => toMinutes(b.createdAt) - toMinutes(a.createdAt));
  const f = FILTERS.find((x) => x.key === filter)!;
  const rows = sorted.filter(f.match);

  return (
    <>
      <PageHeader
        title="Chamados"
        subtitle={`${stats.received} recebidos hoje · ${stats.awaiting} aguardando despacho`}
        actions={
          <Button variant="brand" icon={<Plus className="size-4" />} onClick={() => navigate("/chamados/novo")}>
            Novo chamado
          </Button>
        }
      />
      <div className="mb-4">
        <Tabs items={FILTERS.map((x) => ({ key: x.key, label: x.label, count: sorted.filter(x.match).length }))} value={filter} onChange={setFilter} />
      </div>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-line-soft bg-subtle">
              <tr>
                <Th>Chamado</Th>
                <Th>Cliente</Th>
                <Th>Problema</Th>
                <Th>Categoria</Th>
                <Th>Prioridade</Th>
                <Th>Técnico</Th>
                <Th>Status</Th>
                <Th className="text-right">Recebido</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {rows.map((t) => {
                const Icon = CHANNEL_ICON[t.channel];
                return (
                  <tr key={t.id} onClick={() => navigate(ticketLink(t))} className="cursor-pointer transition-colors hover:bg-subtle">
                    <Td>
                      <span className="flex items-center gap-2 text-ink-3 tnum">
                        <Icon className="size-3.5 text-ink-4" /> {t.code}
                      </span>
                    </Td>
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={t.customerName} size={24} />
                        <span className="font-medium text-ink">{t.customerName}</span>
                      </span>
                    </Td>
                    <Td className="text-ink">{t.title}</Td>
                    <Td>{CATEGORY_LABEL[t.category]}</Td>
                    <Td>
                      <PriorityBadge priority={t.priority} />
                    </Td>
                    <Td>
                      <TechCell id={t.technicianId} fallback={<span className="text-ink-4">Não atribuído</span>} />
                    </Td>
                    <Td>
                      {t.status === "aguardando" ? (
                        <Badge tone="warn" dot>
                          Aguardando despacho
                        </Badge>
                      ) : (
                        <TicketStatusBadge status={t.status} />
                      )}
                    </Td>
                    <Td className="text-right text-ink-3 tnum">{t.createdAt}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[12.5px] text-ink-4">
          <span>
            Mostrando {rows.length} de {filter === "todos" ? stats.received : rows.length} chamados de hoje
          </span>
          <span>Atualizado agora</span>
        </div>
      </section>
    </>
  );
}
