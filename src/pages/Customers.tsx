import { useState } from "react";
import { Search } from "lucide-react";
import { customers, COMPANY } from "../data/customers";
import { Avatar, Badge, PageHeader, Td, Th } from "../components/ui";
import { int } from "../lib/format";

export default function Customers() {
  const [q, setQ] = useState("");
  const list = customers.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.neighborhood.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Clientes" subtitle={`${int(COMPANY.customers)} clientes ativos`} />
      <div className="mb-4 flex justify-end">
        <label className="flex h-9 w-[260px] items-center gap-2 rounded-lg bg-surface px-3 text-[13px] shadow-card">
          <Search className="size-3.5 text-ink-4" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente ou bairro" className="w-full bg-transparent outline-none placeholder:text-ink-4" />
        </label>
      </div>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-line-soft bg-subtle">
              <tr>
                <Th>Cliente</Th>
                <Th>Tipo</Th>
                <Th>Endereço</Th>
                <Th>Telefone</Th>
                <Th>Equipamentos</Th>
                <Th>Atendimentos</Th>
                <Th className="text-right">Último serviço</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {list.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-subtle">
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <Avatar name={c.name} size={28} />
                      <span>
                        <span className="block font-medium text-ink">{c.name}</span>
                        <span className="block text-[12px] text-ink-4">Cliente desde {c.since}</span>
                      </span>
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={c.type === "Residencial" ? "neutral" : c.type === "Comercial" ? "info" : "brand"}>{c.type}</Badge>
                  </Td>
                  <Td>
                    <span className="block text-ink">{c.address}</span>
                    <span className="block text-[12px] text-ink-4">{c.neighborhood}</span>
                  </Td>
                  <Td className="tnum">{c.phone}</Td>
                  <Td className="tnum">{c.equipment}</Td>
                  <Td className="tnum">{c.services}</Td>
                  <Td className="text-right">{c.lastService}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line-soft px-4 py-3 text-[12.5px] text-ink-4">
          <span>
            Mostrando {list.length} de {int(COMPANY.customers)} clientes
          </span>
          <span>Página 1 de 72</span>
        </div>
      </section>
    </>
  );
}
