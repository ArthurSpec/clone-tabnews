import type { Customer } from "../types";

// Amostra da base de 1.284 clientes da ClimaTech (dados fictícios).
export const customers: Customer[] = [
  { id: "joao-silva", name: "João Silva", type: "Residencial", phone: "(11) 98231-4471", address: "Rua das Acácias, 142", neighborhood: "Jardim Aurora", city: "São Paulo", since: "2023", equipment: 2, services: 5, lastService: "12 mar", pos: { x: 50, y: 46 } },
  { id: "fernanda-rocha", name: "Fernanda Rocha", type: "Residencial", phone: "(11) 97310-2286", address: "Rua Ipê Amarelo, 88 · ap. 34", neighborhood: "Vila Serena", city: "São Paulo", since: "2024", equipment: 3, services: 2, lastService: "04 jul", pos: { x: 18.2, y: 65.9 } },
  { id: "luiza-martins", name: "Luiza Martins", type: "Residencial", phone: "(11) 99125-6630", address: "Av. das Magnólias, 1.020", neighborhood: "Alto da Colina", city: "São Paulo", since: "2022", equipment: 4, services: 7, lastService: "21 ago", pos: { x: 66, y: 30 } },
  { id: "cond-solar", name: "Condomínio Solar das Palmeiras", type: "Condomínio", phone: "(11) 3345-8100", address: "Rua Palmeira Real, 300", neighborhood: "Parque das Águas", city: "São Paulo", since: "2021", equipment: 18, services: 41, lastService: "02 set", pos: { x: 76, y: 66 } },
  { id: "maria-souza", name: "Maria Souza", type: "Residencial", phone: "(11) 98440-1902", address: "Rua dos Girassóis, 57", neighborhood: "Vila Serena", city: "São Paulo", since: "2022", equipment: 2, services: 4, lastService: "Hoje", pos: { x: 30, y: 66 } },
  { id: "pedro-oliveira", name: "Pedro Oliveira", type: "Residencial", phone: "(11) 97702-3318", address: "Rua Cedro Rosa, 410", neighborhood: "Jardim Aurora", city: "São Paulo", since: "2020", equipment: 3, services: 11, lastService: "Hoje", pos: { x: 74, y: 66 } },
  { id: "sabor-vila", name: "Restaurante Sabor da Vila", type: "Comercial", phone: "(11) 3021-4455", address: "Av. Central, 2.380", neighborhood: "Centro", city: "São Paulo", since: "2021", equipment: 9, services: 26, lastService: "Hoje", pos: { x: 26, y: 30 } },
  { id: "clinica-bem-viver", name: "Clínica Bem Viver", type: "Comercial", phone: "(11) 3187-9920", address: "Rua Orquídea, 75", neighborhood: "Alto da Colina", city: "São Paulo", since: "2022", equipment: 12, services: 19, lastService: "Hoje", pos: { x: 84, y: 44 } },
  { id: "ricardo-almeida", name: "Ricardo Almeida", type: "Residencial", phone: "(11) 99870-2215", address: "Rua Jequitibá, 19", neighborhood: "Vila Nova", city: "São Paulo", since: "2024", equipment: 1, services: 1, lastService: "Hoje", pos: { x: 60, y: 22 } },
  { id: "beatriz-campos", name: "Beatriz Campos", type: "Residencial", phone: "(11) 98115-7743", address: "Rua Manacá, 233", neighborhood: "Jardim Aurora", city: "São Paulo", since: "2025", equipment: 1, services: 1, lastService: "Hoje", pos: { x: 46, y: 14 } },
  { id: "pao-dourado", name: "Padaria Pão Dourado", type: "Comercial", phone: "(11) 3654-1208", address: "Av. das Magnólias, 455", neighborhood: "Alto da Colina", city: "São Paulo", since: "2020", equipment: 7, services: 33, lastService: "Hoje", pos: { x: 14, y: 46 } },
  { id: "gabriel-moraes", name: "Gabriel Moraes", type: "Residencial", phone: "(11) 97033-8864", address: "Rua Ypê Branco, 12", neighborhood: "Parque das Águas", city: "São Paulo", since: "2023", equipment: 2, services: 3, lastService: "Hoje", pos: { x: 70, y: 76 } },
  { id: "helena-duarte", name: "Helena Duarte", type: "Residencial", phone: "(11) 98652-0127", address: "Rua Aroeira, 890", neighborhood: "Vila Nova", city: "São Paulo", since: "2021", equipment: 3, services: 8, lastService: "Hoje", pos: { x: 86, y: 68 } },
  { id: "nobre-contabil", name: "Nobre Contabilidade", type: "Comercial", phone: "(11) 3290-6671", address: "Av. Central, 1.110 · 8º andar", neighborhood: "Centro", city: "São Paulo", since: "2022", equipment: 6, services: 14, lastService: "Hoje", pos: { x: 10, y: 78 } },
  { id: "academia-movimento", name: "Academia Movimento", type: "Comercial", phone: "(11) 3478-2230", address: "Rua do Bosque, 640", neighborhood: "Parque das Águas", city: "São Paulo", since: "2023", equipment: 10, services: 12, lastService: "Hoje", pos: { x: 76, y: 82 } },
  { id: "carla-nogueira", name: "Carla Nogueira", type: "Residencial", phone: "(11) 99501-3348", address: "Rua Flamboyant, 71", neighborhood: "Jardim Aurora", city: "São Paulo", since: "2022", equipment: 2, services: 6, lastService: "Hoje", pos: { x: 56, y: 40 } },
  { id: "cond-bela-vista", name: "Condomínio Bela Vista", type: "Condomínio", phone: "(11) 3511-0490", address: "Rua Horizonte, 1.500", neighborhood: "Alto da Colina", city: "São Paulo", since: "2020", equipment: 24, services: 58, lastService: "19 set", pos: { x: 64, y: 12 } },
  { id: "otavio-reis", name: "Otávio Reis", type: "Residencial", phone: "(11) 98874-6612", address: "Rua Canela, 38", neighborhood: "Vila Serena", city: "São Paulo", since: "2024", equipment: 1, services: 2, lastService: "15 set", pos: { x: 40, y: 80 } },
];

export const COMPANY = {
  name: "ClimaTech",
  tagline: "Serviços técnicos e manutenção",
  technicians: 24,
  customers: 1284,
  equipment: 3742,
  servicesMonth: 186,
};

export const customerById = (id: string) => customers.find((c) => c.id === id);
