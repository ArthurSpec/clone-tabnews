import type { Equipment } from "../types";

// Amostra dos 3.742 equipamentos cadastrados (dados fictícios).
export const equipment: Equipment[] = [
  { id: "EQ-08812", type: "Split Hi-Wall", brand: "Samsung", model: "WindFree Connect", capacity: "12.000 BTUs", customer: "João Silva", installedAt: "mai 2023", lastService: "12 mar", health: "atencao" },
  { id: "EQ-08813", type: "Split Hi-Wall", brand: "LG", model: "Dual Inverter", capacity: "9.000 BTUs", customer: "João Silva", installedAt: "mai 2023", lastService: "12 mar", health: "ok" },
  { id: "EQ-09140", type: "Aquecedor a gás", brand: "Rinnai", model: "E21", capacity: "21 L/min", customer: "Fernanda Rocha", installedAt: "jan 2024", lastService: "04 jul", health: "ok" },
  { id: "EQ-07731", type: "Split Piso-Teto", brand: "Daikin", model: "SkyAir", capacity: "36.000 BTUs", customer: "Clínica Bem Viver", installedAt: "ago 2022", lastService: "Hoje", health: "atencao" },
  { id: "EQ-06620", type: "Câmara fria", brand: "Elgin", model: "UC-3000", capacity: "3 HP", customer: "Restaurante Sabor da Vila", installedAt: "mar 2021", lastService: "Hoje", health: "critico" },
  { id: "EQ-06004", type: "Bomba d'água", brand: "Schneider", model: "BC-92", capacity: "1 CV", customer: "Condomínio Solar das Palmeiras", installedAt: "fev 2021", lastService: "02 set", health: "atencao" },
  { id: "EQ-07210", type: "Quadro de distribuição", brand: "Steck", model: "QDI 24", capacity: "24 circuitos", customer: "Padaria Pão Dourado", installedAt: "out 2020", lastService: "Hoje", health: "critico" },
  { id: "EQ-09988", type: "Split Hi-Wall", brand: "Midea", model: "AirVolution", capacity: "9.000 BTUs", customer: "Beatriz Campos", installedAt: "Hoje", lastService: "Hoje", health: "ok" },
  { id: "EQ-05530", type: "Split Cassete", brand: "LG", model: "Multi V", capacity: "48.000 BTUs", customer: "Nobre Contabilidade", installedAt: "jun 2022", lastService: "Hoje", health: "ok" },
  { id: "EQ-08455", type: "Split Hi-Wall", brand: "Samsung", model: "Digital Inverter", capacity: "18.000 BTUs", customer: "Carla Nogueira", installedAt: "set 2022", lastService: "Hoje", health: "ok" },
  { id: "EQ-04471", type: "VRF", brand: "Daikin", model: "VRV IV", capacity: "120.000 BTUs", customer: "Condomínio Bela Vista", installedAt: "abr 2020", lastService: "19 set", health: "ok" },
  { id: "EQ-09302", type: "Chuveiro elétrico", brand: "Lorenzetti", model: "Acqua Ultra", capacity: "7.800 W", customer: "Gabriel Moraes", installedAt: "jul 2023", lastService: "Hoje", health: "ok" },
  { id: "EQ-07015", type: "Split Hi-Wall", brand: "Gree", model: "G-Top", capacity: "12.000 BTUs", customer: "Helena Duarte", installedAt: "nov 2021", lastService: "Hoje", health: "atencao" },
  { id: "EQ-06893", type: "Split Hi-Wall", brand: "Samsung", model: "WindFree", capacity: "24.000 BTUs", customer: "Academia Movimento", installedAt: "jan 2023", lastService: "28 ago", health: "ok" },
  { id: "EQ-08120", type: "Aquecedor solar", brand: "Soletrol", model: "Max 400", capacity: "400 L", customer: "Pedro Oliveira", installedAt: "dez 2020", lastService: "Hoje", health: "ok" },
  { id: "EQ-09511", type: "Split Hi-Wall", brand: "Consul", model: "Inverter", capacity: "12.000 BTUs", customer: "Otávio Reis", installedAt: "fev 2024", lastService: "15 set", health: "ok" },
];
