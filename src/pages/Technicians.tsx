import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star } from "lucide-react";
import { useStore } from "../store/DemoStore";
import { technicians } from "../data/technicians";
import { Avatar, PageHeader, TechStatusLabel, Td, Th } from "../components/ui";
import { Tabs } from "./Tickets";
import { rating } from "../lib/format";

const AREAS = ["Todas", "Climatização", "Elétrica", "Hidráulica", "Refrigeração", "Manutenção geral"];

// Ordem de exibição: técnicos citados na demonstração primeiro.
const FEATURED = ["carlos-mendes", "rafael-costa", "marcos-lima", "juliana-alves"];

export default function Technicians() {
  const { techStatus } = useStore();
  const navigate = useNavigate();
  const [area, setArea] = useState("Todas");
  const [q, setQ] = useState("");

  const list = [...technicians]
    .sort((a, b) => {
      const fa = FEATURED.indexOf(a.id);
      const fb = FEATURED.indexOf(b.id);
      if (fa !== -1 || fb !== -1) return (fa === -1 ? 99 : fa) - (fb === -1 ? 99 : fb);
      return (a.status === "folga" ? 1 : 0) - (b.status === "folga" ? 1 : 0);
    })
    .filter((t) => area === "Todas" || t.area === area)
    .filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()));

  const active = technicians.filter((t) => techStatus(t.id) !== "folga").length;

  return (
    <>
      <PageHeader title="Técnicos" subtitle={`${technicians.length} técnicos · ${active} ativos hoje`} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs items={AREAS.map((a) => ({ key: a, label: a }))} value={area} onChange={setArea} />
        <label className="flex h-9 w-[240px] items-center gap-2 rounded-lg bg-surface px-3 text-[13px] shadow-card">
          <Search className="size-3.5 text-ink-4" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar técnico" className="w-full bg-transparent outline-none placeholder:text-ink-4" />
        </label>
      </div>
      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-line-soft bg-subtle">
              <tr>
                <Th>Técnico</Th>
                <Th>Especialidade</Th>
                <Th>Status</Th>
                <Th>Avaliação</Th>
                <Th>Conclusão</Th>
                <Th>1ª visita</Th>
                <Th>Serviços no mês</Th>
                <Th>Região</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {list.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/tecnicos/${t.id}`)} className="cursor-pointer transition-colors hover:bg-subtle">
                  <Td>
                    <span className="flex items-center gap-3">
                      <Avatar name={t.name} size={32} />
                      <span>
                        <span className="block font-medium text-ink">{t.name}</span>
                        <span className="block text-[12px] text-ink-4">{t.role}</span>
                      </span>
                    </span>
                  </Td>
                  <Td>{t.area}</Td>
                  <Td>
                    <TechStatusLabel status={techStatus(t.id)} />
                  </Td>
                  <Td>
                    <span className="flex items-center gap-1 font-medium text-ink tnum">
                      <Star className="size-3.5 fill-[#f5a524] text-[#f5a524]" /> {rating(t.rating)}
                    </span>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <span className="relative h-1.5 w-14 overflow-hidden rounded-full bg-[#ececf0]">
                        <span className="absolute inset-y-0 left-0 rounded-full bg-ok" style={{ width: `${t.completionRate}%` }} />
                      </span>
                      <span className="tnum">{t.completionRate}%</span>
                    </span>
                  </Td>
                  <Td className="tnum">{t.firstVisitRate}%</Td>
                  <Td className="tnum">{t.servicesMonth}</Td>
                  <Td>{t.region}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line-soft px-4 py-3 text-[12.5px] text-ink-4">{list.length} técnicos</div>
      </section>
    </>
  );
}
