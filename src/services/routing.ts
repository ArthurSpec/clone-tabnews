// Serviço de rotas. Nesta versão, calcula distância/ETA a partir das coordenadas do mapa da região.
// Para produção: substituir por uma API de rotas (Google Routes, Mapbox Directions, OSRM…).

export interface Point {
  x: number;
  y: number;
}

export interface Route {
  distanceKm: number;
  etaMin: number;
}

/** Quilômetros por unidade do mapa, já incluindo o fator de malha viária. */
const KM_PER_UNIT = 0.26;
/** Minutos por km em trânsito urbano. */
const MIN_PER_KM = 2.4;

export function getRoute(from: Point, to: Point): Route {
  const distanceKm = Math.round(Math.hypot(from.x - to.x, from.y - to.y) * KM_PER_UNIT * 10) / 10;
  const etaMin = Math.max(3, Math.round(distanceKm * MIN_PER_KM + 0.5));
  return { distanceKm, etaMin };
}

export const kmToUnits = (distanceKm: number) => distanceKm / KM_PER_UNIT;
