import type { ServiceResult } from "../types";

// Desfechos de atendimento usados pela simulação de execução, por tipo de serviço.
export const RESOLUTIONS: Record<string, ServiceResult & { minutes: number }> = {
  split: {
    diagnosis: "Baixa carga de refrigerante",
    service: "Correção do vazamento + recarga",
    duration: "1h 42min",
    minutes: 102,
    rating: 5,
    firstVisit: true,
    comment: "Muito atencioso, explicou tudo e o ar voltou a gelar na hora.",
  },
  vazamento: {
    diagnosis: "Vedação do sifão danificada",
    service: "Substituição do sifão e das vedações",
    duration: "48min",
    minutes: 48,
    rating: 5,
    firstVisit: true,
    comment: "Chegou rápido e deixou tudo limpo. Recomendo!",
  },
  eletrica: {
    diagnosis: "Circuito da cozinha subdimensionado",
    service: "Troca do disjuntor e divisão do circuito",
    duration: "1h 15min",
    minutes: 75,
    rating: 5,
    firstVisit: true,
    comment: "Resolveu de primeira, muito profissional.",
  },
  bomba: {
    diagnosis: "Rolamento da bomba desgastado",
    service: "Substituição do rolamento + revisão do conjunto",
    duration: "1h 26min",
    minutes: 86,
    rating: 5,
    firstVisit: true,
    comment: "Pressão normalizada em todos os andares.",
  },
  camara: {
    diagnosis: "Falha no relé do compressor",
    service: "Substituição do relé e teste de ciclo",
    duration: "2h 05min",
    minutes: 125,
    rating: 5,
    firstVisit: true,
    comment: "Salvou nosso estoque. Obrigado!",
  },
};

export const JOB_BY_CATEGORY = {
  climatizacao: "split",
  hidraulica: "vazamento",
  eletrica: "eletrica",
  refrigeracao: "camara",
} as const;
