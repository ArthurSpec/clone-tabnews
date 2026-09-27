import { useMemo } from "react";
import { useElementWidth } from "../../lib/hooks";
import { kmToUnits } from "../../services/routing";
import { firstName, km } from "../../lib/format";
import { Avatar, cx } from "../ui";
import type { Candidate, Technician } from "../../types";

// Mapa estilizado da região atendida. Não depende de provedor de mapas:
// ruas, parques e rio são gerados de forma determinística em coordenadas 0–100.

interface Props {
  customer: { name: string; pos: { x: number; y: number } };
  candidates: Candidate[];
  recommendedId: string;
  fleet?: Technician[];
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  assigned?: boolean;
  height?: number;
}

const WORLD_MIN = -160;
const WORLD_MAX = 260;

function jitter(k: number) {
  return Math.sin(k * 12.9898) * 1.1;
}

const STREETS = (() => {
  const v: number[] = [];
  for (let k = 0, p = WORLD_MIN; p <= WORLD_MAX; k++, p += 5.2) v.push(p + jitter(k));
  return v;
})();
const AVENUES = [-150, -120, -90, -60, -30, 2, 27, 58, 88, 118, 148, 178, 208, 238];

const NEIGHBORHOODS = [
  { name: "Jardim Aurora", x: 57, y: 52 },
  { name: "Vila Serena", x: 31, y: 72 },
  { name: "Alto da Colina", x: 72, y: 26 },
  { name: "Centro", x: 25, y: 34 },
  { name: "Parque das Águas", x: 80, y: 63 },
  { name: "Vila Nova", x: 52, y: 12 },
  { name: "Recanto Verde", x: 12, y: 88 },
  { name: "Morada do Sol", x: 94, y: 88 },
];

const PARKS = [
  { x: 60, y: 60, w: 12, h: 8 },
  { x: 14, y: 50, w: 9, h: 13 },
  { x: 80, y: 8, w: 14, h: 9 },
  { x: 40, y: 88, w: 10, h: 7 },
  { x: -10, y: 16, w: 12, h: 10 },
];

function routePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const midY = from.y + (to.y - from.y) * 0.55;
  return `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
}

export function RegionMap({ customer, candidates, recommendedId, fleet = [], hoveredId, onHover, assigned, height = 440 }: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const c = customer.pos;

  const view = useMemo(() => {
    // Enquadra os candidatos até ~11 km; os mais distantes ficam presos à borda do mapa.
    const inRange = candidates.filter((k) => k.distanceKm <= 11);
    const maxUnits = Math.max(...(inRange.length ? inRange : candidates).map((k) => Math.hypot(k.technician.pos.x - c.x, k.technician.pos.y - c.y)), 10);
    const halfH = maxUnits + 7;
    const aspect = width > 0 ? width / height : 1.6;
    const halfW = Math.max(halfH * aspect, maxUnits + 12);
    const halfHAdj = halfW / aspect;
    return { x0: c.x - halfW, y0: c.y - halfHAdj, w: halfW * 2, h: halfHAdj * 2, unitPx: width / (halfW * 2) };
  }, [candidates, c.x, c.y, width, height]);

  const pct = (p: { x: number; y: number }, clamp = false) => {
    let left = ((p.x - view.x0) / view.w) * 100;
    let top = ((p.y - view.y0) / view.h) * 100;
    if (clamp) {
      left = Math.min(Math.max(left, 5), 76);
      top = Math.min(Math.max(top, 8), 84);
    }
    return { left: `${left}%`, top: `${top}%` };
  };

  const u = 1 / (view.unitPx || 6); // 1px em unidades do mapa
  const rec = candidates.find((k) => k.technician.id === recommendedId);
  const others = candidates.filter((k) => k.technician.id !== recommendedId);
  const rings = [2.5, 5, 10].map((d) => ({ d, r: kmToUnits(d) }));
  const routeLen = rec ? Math.abs(rec.technician.pos.y - c.y) + Math.abs(rec.technician.pos.x - c.x) : 0;
  const shownIds = new Set(candidates.map((k) => k.technician.id));
  // Rótulo do cliente do lado oposto aos técnicos mais próximos, para não encobrir os pinos.
  const near = candidates.filter((k) => Math.hypot(k.technician.pos.x - c.x, k.technician.pos.y - c.y) < 20);
  const labelBelow = near.filter((k) => k.technician.pos.y < c.y).length >= near.filter((k) => k.technician.pos.y >= c.y).length;

  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-b-xl bg-[#eef0f3]" style={{ height }}>
      {width > 0 && (
        <svg className="absolute inset-0 size-full" viewBox={`${view.x0} ${view.y0} ${view.w} ${view.h}`} preserveAspectRatio="none">
          {/* quarteirões */}
          <rect x={WORLD_MIN} y={WORLD_MIN} width={WORLD_MAX - WORLD_MIN} height={WORLD_MAX - WORLD_MIN} fill="#eceef1" />
          {PARKS.map((p, i) => (
            <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={1.2} fill="#dfeee2" />
          ))}
          {/* rio */}
          <path
            d="M -160 110 C -100 96, -40 116, 0 106 S 30 101, 30 101 S 80 84, 110 96 S 150 110, 270 100"
            fill="none"
            stroke="#d9e6f2"
            strokeWidth={5}
            strokeLinecap="round"
          />
          {/* ruas */}
          <g stroke="#ffffff" strokeWidth={0.75 * u * 2.2}>
            {STREETS.map((p, i) => (
              <line key={`v${i}`} x1={p} x2={p} y1={WORLD_MIN} y2={WORLD_MAX} />
            ))}
            {STREETS.map((p, i) => (
              <line key={`h${i}`} x1={WORLD_MIN} x2={WORLD_MAX} y1={p + 1.7} y2={p + 1.7} />
            ))}
          </g>
          <g stroke="#ffffff" strokeWidth={u * 6}>
            {AVENUES.map((p) => (
              <line key={`av${p}`} x1={p} x2={p} y1={WORLD_MIN} y2={WORLD_MAX} />
            ))}
            {AVENUES.map((p) => (
              <line key={`ah${p}`} x1={WORLD_MIN} x2={WORLD_MAX} y1={p + 6} y2={p + 6} />
            ))}
            <line x1={-140} y1={230} x2={250} y2={-120} />
          </g>

          {/* anéis de distância */}
          {rings.map(({ d, r }) => (
            <circle key={d} cx={c.x} cy={c.y} r={r} fill="none" stroke="#111318" strokeOpacity={0.12} strokeWidth={u} strokeDasharray={`${u * 4} ${u * 4}`} />
          ))}
          <circle cx={c.x} cy={c.y} r={kmToUnits(2.5)} fill="var(--color-brand)" fillOpacity={0.035} />

          {/* linhas dos demais candidatos */}
          {others.map((k) => {
            const hovered = hoveredId === k.technician.id;
            return (
              <line
                key={k.technician.id}
                x1={k.technician.pos.x}
                y1={k.technician.pos.y}
                x2={c.x}
                y2={c.y}
                stroke={hovered ? "#3a3e48" : "#8d92a0"}
                strokeOpacity={hovered ? 0.8 : 0.5}
                strokeWidth={u * (hovered ? 1.6 : 1.2)}
                strokeDasharray={`${u * 3} ${u * 4}`}
                style={{ transition: "stroke-opacity 150ms" }}
              />
            );
          })}

          {/* rota do recomendado */}
          {rec && (
            <g>
              <path d={routePath(rec.technician.pos, c)} fill="none" stroke="white" strokeWidth={u * 7} strokeLinejoin="round" strokeLinecap="round" />
              <path
                d={routePath(rec.technician.pos, c)}
                fill="none"
                stroke="var(--color-brand)"
                strokeWidth={u * 3.2}
                strokeLinejoin="round"
                strokeLinecap="round"
                className="route-draw"
                style={{ ["--len" as string]: routeLen }}
              />
              {assigned && (
                <path
                  d={routePath(rec.technician.pos, c)}
                  fill="none"
                  stroke="white"
                  strokeOpacity={0.9}
                  strokeWidth={u * 1.4}
                  strokeLinecap="round"
                  strokeDasharray={`${u * 4} ${u * 8}`}
                  className="route-flow"
                />
              )}
            </g>
          )}
        </svg>
      )}

      {/* bairros */}
      {width > 0 &&
        NEIGHBORHOODS.map((n) => (
          <span
            key={n.name}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap text-[#a6abb6]"
            style={pct(n)}
          >
            {n.name}
          </span>
        ))}

      {/* rótulos dos anéis */}
      {width > 0 &&
        rings.map(({ d, r }) => (
          <span
            key={d}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded bg-[#eceef1]/90 px-1 text-[10px] font-medium text-ink-4 tnum"
            style={pct({ x: c.x, y: c.y - r })}
          >
            {d.toLocaleString("pt-BR")} km
          </span>
        ))}

      {/* frota (técnicos não listados) */}
      {width > 0 &&
        fleet
          .filter((t) => !shownIds.has(t.id) && t.status !== "folga")
          .map((t) => (
            <span
              key={t.id}
              title={t.name}
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#b9bdc7] shadow-sm"
              style={pct(t.pos)}
            />
          ))}

      {/* técnicos candidatos */}
      {width > 0 &&
        candidates.map((k) => {
          const isRec = k.technician.id === recommendedId;
          const hovered = hoveredId === k.technician.id;
          const dim = hoveredId && !hovered && !isRec;
          return (
            <div
              key={k.technician.id}
              className={cx("absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150", dim && "opacity-50", isRec ? "z-20" : "z-10")}
              style={pct(k.technician.pos, true)}
              onMouseEnter={() => onHover?.(k.technician.id)}
              onMouseLeave={() => onHover?.(null)}
            >
              {isRec && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand/40" />}
              <div
                className={cx(
                  "relative rounded-full bg-white p-[2px] transition-transform duration-150",
                  isRec ? "shadow-[0_0_0_2px_var(--color-brand),0_6px_16px_-4px_rgb(67_80_196/0.5)]" : "shadow-[0_2px_6px_rgb(17_19_24/0.18)]",
                  hovered && "scale-110",
                )}
              >
                <Avatar name={k.technician.name} size={isRec ? 34 : 26} />
              </div>
              <div
                className={cx(
                  "absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-medium whitespace-nowrap",
                  k.technician.pos.x >= c.x ? "left-full ml-2" : "right-full mr-2",
                  isRec ? "bg-brand text-white shadow-[0_4px_12px_-2px_rgb(67_80_196/0.45)]" : "bg-white text-ink-2 shadow-[0_1px_3px_rgb(17_19_24/0.14)]",
                )}
              >
                {firstName(k.technician.name)}
                <span className={cx("tnum", isRec ? "text-white/75" : "text-ink-4")}>{km(k.distanceKm)}</span>
              </div>
            </div>
          );
        })}

      {/* cliente */}
      {width > 0 && (
        <div className="absolute z-30 -translate-x-1/2 -translate-y-1/2" style={pct(c)}>
          <span className="absolute -inset-3 animate-pulse-ring rounded-full bg-ink/15" />
          <div className="relative flex size-5 items-center justify-center rounded-full bg-ink shadow-[0_0_0_3px_white,0_4px_10px_rgb(17_19_24/0.3)]">
            <span className="size-1.5 rounded-full bg-white" />
          </div>
          {labelBelow ? (
            <div className="absolute top-full left-1/2 mt-2.5 -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-[11.5px] font-medium whitespace-nowrap text-white shadow-lg">
              <span className="absolute bottom-full left-1/2 -mb-1 size-2 -translate-x-1/2 rotate-45 bg-ink" />
              <span className="relative">{customer.name}</span>
            </div>
          ) : (
            <div className="absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-[11.5px] font-medium whitespace-nowrap text-white shadow-lg">
              {customer.name}
              <span className="absolute top-full left-1/2 -mt-1 size-2 -translate-x-1/2 rotate-45 bg-ink" />
            </div>
          )}
        </div>
      )}

      {/* legenda */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3.5 rounded-lg bg-white/90 px-3 py-2 text-[11.5px] text-ink-3 shadow-card backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-ink ring-2 ring-white" /> Cliente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand ring-2 ring-white" /> Recomendado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#8d92a0] ring-2 ring-white" /> Candidatos
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <span className="size-2 rounded-full bg-[#b9bdc7] ring-2 ring-white" /> Frota
        </span>
      </div>
    </div>
  );
}
