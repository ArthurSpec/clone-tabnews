import type { Appointment } from "../types";

// Agenda da semana. `day` 0 = hoje. Os horários de hoje foram montados à mão;
// os próximos dias são gerados de forma determinística para dar volume ao calendário.

export const AGENDA_TECHS = [
  "carlos-mendes",
  "juliana-alves",
  "rafael-costa",
  "marcos-lima",
  "thiago-ramos",
  "ana-dias",
  "lucas-ferreira",
  "renata-gomes",
];

type A = Omit<Appointment, "id" | "day">;

const today: A[] = [
  { technicianId: "carlos-mendes", start: "08:00", durationMin: 90, title: "Manutenção Samsung", customer: "Carla Nogueira", address: "Rua Flamboyant, 71", kind: "corretiva", workOrderNumber: 10470 },
  { technicianId: "carlos-mendes", start: "10:30", durationMin: 120, title: "Instalação LG", customer: "Residencial Monte Verde", address: "Rua das Hortênsias, 902", kind: "instalacao" },
  { technicianId: "carlos-mendes", start: "17:00", durationMin: 60, title: "Preventiva", customer: "Condomínio Bela Vista", address: "Rua Horizonte, 1.500", kind: "preventiva" },

  { technicianId: "juliana-alves", start: "08:30", durationMin: 90, title: "Higienização de splits", customer: "Escola Pequeno Saber", address: "Rua Alecrim, 44", kind: "manutencao" },
  { technicianId: "juliana-alves", start: "10:30", durationMin: 120, title: "Manutenção VRF", customer: "Edifício Aurora Office", address: "Av. Central, 3.020", kind: "manutencao" },
  { technicianId: "juliana-alves", start: "14:00", durationMin: 90, title: "Preventiva", customer: "Pedro Oliveira", address: "Rua Cedro Rosa, 410", kind: "preventiva", workOrderNumber: 10480 },
  { technicianId: "juliana-alves", start: "16:00", durationMin: 120, title: "Instalação Daikin", customer: "Otávio Reis", address: "Rua Canela, 38", kind: "instalacao" },

  { technicianId: "rafael-costa", start: "09:00", durationMin: 90, title: "Revisão de quadro elétrico", customer: "Mercado Bom Preço", address: "Av. das Magnólias, 88", kind: "manutencao" },
  { technicianId: "rafael-costa", start: "11:30", durationMin: 130, title: "Circuito dedicado para split", customer: "Lívia Tavares", address: "Rua Jasmim, 310", kind: "instalacao" },
  { technicianId: "rafael-costa", start: "15:00", durationMin: 90, title: "Instalação elétrica", customer: "Studio Forma", address: "Rua Lavanda, 55", kind: "instalacao" },

  { technicianId: "marcos-lima", start: "08:30", durationMin: 60, title: "Troca de registro", customer: "Sônia Batista", address: "Rua Violeta, 12", kind: "corretiva" },
  { technicianId: "marcos-lima", start: "10:30", durationMin: 90, title: "Revisão de aquecedor", customer: "Hugo Prado", address: "Rua Sálvia, 402", kind: "manutencao" },
  { technicianId: "marcos-lima", start: "15:00", durationMin: 60, title: "Vazamento hidráulico", customer: "Maria Souza", address: "Rua dos Girassóis, 57", kind: "corretiva", workOrderNumber: 10481 },

  { technicianId: "thiago-ramos", start: "08:30", durationMin: 60, title: "Registro pingando", customer: "Otávio Reis", address: "Rua Canela, 38", kind: "corretiva", workOrderNumber: 10468 },
  { technicianId: "thiago-ramos", start: "10:00", durationMin: 90, title: "Desentupimento", customer: "Café Grão Nobre", address: "Av. Central, 760", kind: "corretiva" },
  { technicianId: "thiago-ramos", start: "13:30", durationMin: 90, title: "Limpeza de caixa d'água", customer: "Condomínio Jardins", address: "Rua do Lago, 1.200", kind: "preventiva" },
  { technicianId: "thiago-ramos", start: "16:30", durationMin: 60, title: "Troca de sifão", customer: "Renan Vieira", address: "Rua Begônia, 91", kind: "corretiva" },

  { technicianId: "ana-dias", start: "09:30", durationMin: 60, title: "Chuveiro sem aquecer", customer: "Gabriel Moraes", address: "Rua Ypê Branco, 12", kind: "corretiva", workOrderNumber: 10472 },
  { technicianId: "ana-dias", start: "11:00", durationMin: 120, title: "Automação de iluminação", customer: "Casa Alameda", address: "Alameda dos Pinheiros, 18", kind: "instalacao" },
  { technicianId: "ana-dias", start: "15:30", durationMin: 90, title: "Iluminação externa", customer: "Pousada Recanto", address: "Rua da Serra, 700", kind: "instalacao" },

  { technicianId: "lucas-ferreira", start: "08:00", durationMin: 90, title: "Preventiva", customer: "Farmácia Vida", address: "Av. Central, 1.940", kind: "preventiva" },
  { technicianId: "lucas-ferreira", start: "11:15", durationMin: 205, title: "Split pingando água", customer: "Clínica Bem Viver", address: "Rua Orquídea, 75", kind: "corretiva", workOrderNumber: 10478 },
  { technicianId: "lucas-ferreira", start: "16:00", durationMin: 90, title: "Instalação Midea", customer: "Tânia Ribeiro", address: "Rua Açucena, 27", kind: "instalacao" },

  { technicianId: "renata-gomes", start: "08:30", durationMin: 60, title: "Higienização", customer: "Consultório Sorriso", address: "Rua Tulipa, 300", kind: "manutencao" },
  { technicianId: "renata-gomes", start: "10:05", durationMin: 240, title: "Ar-condicionado com mau cheiro", customer: "Helena Duarte", address: "Rua Aroeira, 890", kind: "corretiva", workOrderNumber: 10474 },
  { technicianId: "renata-gomes", start: "15:00", durationMin: 90, title: "Preventiva", customer: "Loja Estilo", address: "Rua Comercial, 45", kind: "preventiva" },
];

const TEMPLATES: { title: string; kind: Appointment["kind"]; dur: number }[] = [
  { title: "Preventiva", kind: "preventiva", dur: 60 },
  { title: "Manutenção split", kind: "manutencao", dur: 90 },
  { title: "Instalação", kind: "instalacao", dur: 120 },
  { title: "Visita técnica", kind: "corretiva", dur: 60 },
  { title: "Higienização", kind: "manutencao", dur: 60 },
  { title: "Diagnóstico", kind: "corretiva", dur: 90 },
];
const CUSTOMERS: [string, string][] = [
  ["Condomínio Bela Vista", "Rua Horizonte, 1.500"],
  ["Clínica Bem Viver", "Rua Orquídea, 75"],
  ["Luiza Martins", "Av. das Magnólias, 1.020"],
  ["Padaria Pão Dourado", "Av. das Magnólias, 455"],
  ["Academia Movimento", "Rua do Bosque, 640"],
  ["Nobre Contabilidade", "Av. Central, 1.110"],
  ["Beatriz Campos", "Rua Manacá, 233"],
  ["Ricardo Almeida", "Rua Jequitibá, 19"],
  ["Helena Duarte", "Rua Aroeira, 890"],
  ["Restaurante Sabor da Vila", "Av. Central, 2.380"],
];
const STARTS = ["08:00", "08:30", "09:00", "10:30", "11:00", "13:30", "14:00", "15:00", "16:00", "16:30"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function buildSeedAppointments(): Appointment[] {
  const list: Appointment[] = today.map((a, i) => ({ ...a, id: `ag-0-${i}`, day: 0 }));
  AGENDA_TECHS.forEach((techId, ti) => {
    for (let day = 1; day <= 5; day++) {
      const r = rng(ti * 97 + day * 13 + 7);
      const count = 2 + Math.floor(r() * 3);
      const starts = [...STARTS].sort(() => r() - 0.5).slice(0, count).sort();
      let lastEnd = 0;
      starts.forEach((start, k) => {
        const [h, m] = start.split(":").map(Number);
        const startMin = h * 60 + m;
        if (startMin < lastEnd) return;
        const tpl = TEMPLATES[Math.floor(r() * TEMPLATES.length)];
        lastEnd = startMin + tpl.dur;
        const [customer, address] = CUSTOMERS[Math.floor(r() * CUSTOMERS.length)];
        list.push({
          id: `ag-${day}-${ti}-${k}`,
          technicianId: techId,
          day,
          start,
          durationMin: tpl.dur,
          title: tpl.title,
          customer,
          address,
          kind: tpl.kind,
        });
      });
    }
  });
  return list;
}
