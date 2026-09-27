import type { Ticket } from "../types";

// Chamados de hoje (amostra dos 37 recebidos). Os quatro primeiros aguardam despacho.
export const seedTickets: Ticket[] = [
  {
    id: "CH-2291",
    code: "CH-2291",
    customerId: "joao-silva",
    customerName: "João Silva",
    title: "Ar-condicionado não gela",
    category: "climatizacao",
    priority: "alta",
    status: "aguardando",
    channel: "WhatsApp",
    createdAt: "13:08",
    messages: [
      {
        from: "customer",
        text: "Oi, meu ar-condicionado Samsung de 12 mil BTUs liga normalmente, mas não está gelando. Preciso de alguém hoje.",
        time: "13:08",
      },
    ],
  },
  {
    id: "CH-2290",
    code: "CH-2290",
    customerId: "fernanda-rocha",
    customerName: "Fernanda Rocha",
    title: "Vazamento embaixo da pia",
    category: "hidraulica",
    priority: "media",
    status: "aguardando",
    channel: "WhatsApp",
    createdAt: "12:57",
    messages: [
      {
        from: "customer",
        text: "Tem um vazamento embaixo da pia e está molhando o armário.",
        time: "12:57",
      },
    ],
  },
  {
    id: "CH-2289",
    code: "CH-2289",
    customerId: "luiza-martins",
    customerName: "Luiza Martins",
    title: "Disjuntor desarmando",
    category: "eletrica",
    priority: "alta",
    status: "aguardando",
    channel: "Telefone",
    createdAt: "12:48",
    messages: [
      {
        from: "customer",
        text: "O disjuntor da cozinha desarma toda vez que ligo o micro-ondas junto com a geladeira. Já caiu três vezes desde cedo.",
        time: "12:48",
      },
    ],
  },
  {
    id: "CH-2288",
    code: "CH-2288",
    customerId: "cond-solar",
    customerName: "Condomínio Solar das Palmeiras",
    title: "Bomba d'água com ruído",
    category: "hidraulica",
    priority: "media",
    status: "aguardando",
    channel: "Portal",
    createdAt: "12:36",
    messages: [
      {
        from: "customer",
        text: "A bomba d'água do bloco B está fazendo um ruído alto e a pressão caiu nos andares de cima.",
        time: "12:36",
      },
    ],
  },
  { id: "CH-2287", code: "CH-2287", customerId: "maria-souza", customerName: "Maria Souza", title: "Vazamento hidráulico", category: "hidraulica", priority: "media", status: "agendado", channel: "WhatsApp", createdAt: "12:21", technicianId: "marcos-lima", workOrderNumber: 10481 },
  { id: "CH-2286", code: "CH-2286", customerId: "pedro-oliveira", customerName: "Pedro Oliveira", title: "Manutenção preventiva", category: "climatizacao", priority: "baixa", status: "agendado", channel: "Portal", createdAt: "12:04", technicianId: "juliana-alves", workOrderNumber: 10480 },
  { id: "CH-2285", code: "CH-2285", customerId: "sabor-vila", customerName: "Restaurante Sabor da Vila", title: "Câmara fria sem temperatura", category: "refrigeracao", priority: "alta", status: "a_caminho", channel: "Telefone", createdAt: "11:47", technicianId: "diego-martins", workOrderNumber: 10479 },
  { id: "CH-2284", code: "CH-2284", customerId: "clinica-bem-viver", customerName: "Clínica Bem Viver", title: "Split pingando água", category: "climatizacao", priority: "media", status: "em_atendimento", channel: "WhatsApp", createdAt: "11:30", technicianId: "lucas-ferreira", workOrderNumber: 10478 },
  { id: "CH-2283", code: "CH-2283", customerId: "ricardo-almeida", customerName: "Ricardo Almeida", title: "Tomadas sem energia", category: "eletrica", priority: "media", status: "em_atendimento", channel: "WhatsApp", createdAt: "11:12", technicianId: "felipe-nunes", workOrderNumber: 10477 },
  { id: "CH-2282", code: "CH-2282", customerId: "pao-dourado", customerName: "Padaria Pão Dourado", title: "Quadro elétrico aquecendo", category: "eletrica", priority: "alta", status: "em_atendimento", channel: "Telefone", createdAt: "10:40", technicianId: "gustavo-rocha", workOrderNumber: 10476 },
  { id: "CH-2281", code: "CH-2281", customerId: "beatriz-campos", customerName: "Beatriz Campos", title: "Instalação de split 9.000 BTUs", category: "climatizacao", priority: "baixa", status: "em_atendimento", channel: "Portal", createdAt: "10:26", technicianId: "vinicius-araujo", workOrderNumber: 10475 },
  { id: "CH-2280", code: "CH-2280", customerId: "helena-duarte", customerName: "Helena Duarte", title: "Ar-condicionado com mau cheiro", category: "climatizacao", priority: "baixa", status: "em_atendimento", channel: "WhatsApp", createdAt: "10:05", technicianId: "renata-gomes", workOrderNumber: 10474 },
  { id: "CH-2279", code: "CH-2279", customerId: "nobre-contabil", customerName: "Nobre Contabilidade", title: "Preventiva em 4 splits", category: "climatizacao", priority: "baixa", status: "em_atendimento", channel: "E-mail", createdAt: "09:48", technicianId: "rodrigo-barros", workOrderNumber: 10473 },
  { id: "CH-2278", code: "CH-2278", customerId: "gabriel-moraes", customerName: "Gabriel Moraes", title: "Chuveiro sem aquecer", category: "eletrica", priority: "baixa", status: "concluido", channel: "WhatsApp", createdAt: "09:40", technicianId: "ana-dias", workOrderNumber: 10472 },
  { id: "CH-2277", code: "CH-2277", customerId: "academia-movimento", customerName: "Academia Movimento", title: "Vazamento no vestiário", category: "hidraulica", priority: "media", status: "concluido", channel: "Portal", createdAt: "09:31", technicianId: "eduardo-santos", workOrderNumber: 10471 },
  { id: "CH-2276", code: "CH-2276", customerId: "carla-nogueira", customerName: "Carla Nogueira", title: "Split Samsung não liga", category: "climatizacao", priority: "alta", status: "concluido", channel: "WhatsApp", createdAt: "07:46", technicianId: "carlos-mendes", workOrderNumber: 10470 },
  { id: "CH-2275", code: "CH-2275", customerId: "cond-bela-vista", customerName: "Condomínio Bela Vista", title: "Iluminação da garagem", category: "eletrica", priority: "media", status: "concluido", channel: "Portal", createdAt: "08:52", technicianId: "patricia-lopes", workOrderNumber: 10469 },
  { id: "CH-2274", code: "CH-2274", customerId: "otavio-reis", customerName: "Otávio Reis", title: "Registro do banheiro pingando", category: "hidraulica", priority: "baixa", status: "concluido", channel: "WhatsApp", createdAt: "08:31", technicianId: "thiago-ramos", workOrderNumber: 10468 },
];

/** Totais do dia (a amostra acima são os mais recentes). */
export const TODAY_BASELINE = {
  received: 37,
  inService: 12,
  awaiting: 4,
  done: 21,
};

/**
 * Roteiro de horários da demonstração: quando cada chamado em espera foi recebido,
 * analisado e despachado. Garante números estáveis a cada gravação.
 */
export const DEMO_CLOCK: Record<string, { receivedAt: string; analyzedAt: string; assignedAt: string }> = {
  "CH-2291": { receivedAt: "13:08:05", analyzedAt: "13:09:21", assignedAt: "13:11:47" },
  "CH-2290": { receivedAt: "12:57:40", analyzedAt: "12:58:32", assignedAt: "13:00:36" },
  "CH-2289": { receivedAt: "12:48:12", analyzedAt: "12:49:05", assignedAt: "12:51:20" },
  "CH-2288": { receivedAt: "12:36:30", analyzedAt: "12:37:18", assignedAt: "12:40:02" },
};

export const DEMO_NOW = "13:12";
