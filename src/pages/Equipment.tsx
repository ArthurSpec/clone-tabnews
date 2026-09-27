import { useState } from "react";
import { Search } from "lucide-react";
import { equipment } from "../data/equipment";
import { COMPANY } from "../data/customers";
import { Badge, PageHeader, Td, Th } from "../components/ui";
import { int } from "../lib/format";

const HEALTH = {
  ok: { tone: "ok" as const, label: "Em dia" },
  atencao: { tone: "warn" as const, label: "Atenção" },
  critico: { tone: "bad" as const, label: "Crítico" },
};

export default function EquipmentPage() {
  const [q, setQ] = useState("");
  const list = equipment.filter((e) => !q || `${e.type} ${e.brand} ${e.customer}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Equipamentos" subtitle={`${int(COMPANY.equipment)} equipamentos cadastrados`} />
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          ["Em dia", "3.418", "ok"],
          ["Preventiva vencendo", "271", "warn"],
          ["Críticos", "53", "bad"],
        ].map(([l, v, t]) => (
          <div key={l} className="card px-5 py-4">
            <div className="flex items-center gap-2 text-[12.5px] text-ink-3">
              <span className={`size-2 rounded-full ${t === "ok" ? "bg-ok" : t === "warn" ? "bg-warn" : "bg-bad"}`} /> {l}
            </div>
            <div className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-ink tnum">{v}</div>
          </div>
        ))}
      </div>
      <div className="mb-4 flex justify-end">
        <label className="flex h-9 w-[260px] items-center gap-2 rounded-lg bg-surface px-3 text-[13px] shadow-card">
          <Search className="size-3.5 text-ink-4" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por tipo, marca ou cliente" className="w-full bg-transparent outline-none placeholder:text-ink-4" />
        </label>
      </div>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-line-soft bg-subtle">
              <tr>
                <Th>Código</Th>
                <Th>Equipamento</Th>
                <Th>Capacidade</Th>
                <Th>Cliente</Th>
                <Th>Instalação</Th>
                <Th>Último serviço</Th>
                <Th className="text-right">Condição</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {list.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-subtle">
                  <Td className="text-ink-3 tnum">{e.id}</Td>
                  <Td>
                    <span className="block font-medium text-ink">{e.type}</span>
                    <span className="block text-[12px] text-ink-4">
                      {e.brand} · {e.model}
                    </span>
                  </Td>
                  <Td>{e.capacity}</Td>
                  <Td className="text-ink">{e.customer}</Td>
                  <Td>{e.installedAt}</Td>
                  <Td>{e.lastService}</Td>
                  <Td className="text-right">
                    <Badge tone={HEALTH[e.health].tone} dot>
                      {HEALTH[e.health].label}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line-soft px-4 py-3 text-[12.5px] text-ink-4">
          Mostrando {list.length} de {int(COMPANY.equipment)} equipamentos
        </div>
      </section>
    </>
  );
}
