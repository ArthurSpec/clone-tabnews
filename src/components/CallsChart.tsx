import { useState } from "react";
import { useElementWidth } from "../lib/hooks";

// Chamados recebidos por hora: hoje (até agora) vs. média das últimas 4 semanas.
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const TODAY = [3, 6, 8, 7, 5, 4, 4];
const AVERAGE = [3, 5, 7, 7, 6, 5, 5, 6, 6, 5, 4, 2];
const NOW = 13 + 12 / 60;

const H = 236;
const PAD = { top: 14, right: 12, bottom: 26, left: 28 };
const Y_MAX = 10;

export function CallsChart() {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const w = Math.max(width, 300);
  const innerW = w - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (hour: number) => PAD.left + ((hour - 7) / 11) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / Y_MAX) * innerH;

  const todayPts = TODAY.map((v, i) => [x(HOURS[i]), y(v)] as const);
  const avgPts = AVERAGE.map((v, i) => [x(HOURS[i]), y(v)] as const);
  const line = (pts: readonly (readonly [number, number])[]) => smooth(pts);
  const area = `${line(todayPts)} L ${todayPts[todayPts.length - 1][0]} ${y(0)} L ${todayPts[0][0]} ${y(0)} Z`;

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = (e.target as SVGRectElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    const idx = Math.round((px / rect.width) * 11);
    setHover(Math.max(0, Math.min(11, idx)));
  };

  return (
    <div ref={ref} className="relative w-full select-none">
      {width > 0 && (
        <svg width={w} height={H} className="block overflow-visible">
          <defs>
            <linearGradient id="calls-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 5, 10].map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={w - PAD.right} y1={y(v)} y2={y(v)} stroke="#eeeef2" strokeDasharray={v === 0 ? undefined : "2 4"} />
              <text x={PAD.left - 10} y={y(v) + 4} textAnchor="end" className="fill-ink-4 text-[11px] tnum">
                {v}
              </text>
            </g>
          ))}
          {HOURS.filter((h) => h % 2 === 1).map((h) => (
            <text key={h} x={x(h)} y={H - 6} textAnchor="middle" className="fill-ink-4 text-[11px] tnum">
              {String(h).padStart(2, "0")}h
            </text>
          ))}

          <path d={line(avgPts)} fill="none" stroke="#b4b8c2" strokeWidth={1.5} strokeDasharray="4 4" />
          <path d={area} fill="url(#calls-fill)" />
          <path d={line(todayPts)} fill="none" stroke="var(--color-brand)" strokeWidth={2} strokeLinecap="round" />

          <line x1={x(NOW)} x2={x(NOW)} y1={PAD.top} y2={y(0)} stroke="#111318" strokeOpacity={0.18} strokeDasharray="2 3" />
          <g transform={`translate(${x(NOW)}, ${PAD.top - 2})`}>
            <rect x={-19} y={-12} width={38} height={17} rx={5} fill="#111318" />
            <text y={0} textAnchor="middle" className="fill-white text-[10.5px] font-medium">
              Agora
            </text>
          </g>
          <circle cx={todayPts[todayPts.length - 1][0]} cy={todayPts[todayPts.length - 1][1]} r={4} fill="var(--color-brand)" stroke="white" strokeWidth={2} />

          {hover !== null && (
            <g pointerEvents="none">
              <line x1={x(HOURS[hover])} x2={x(HOURS[hover])} y1={PAD.top} y2={y(0)} stroke="#111318" strokeOpacity={0.12} />
              {hover < TODAY.length && <circle cx={x(HOURS[hover])} cy={y(TODAY[hover])} r={4.5} fill="var(--color-brand)" stroke="white" strokeWidth={2} />}
              <circle cx={x(HOURS[hover])} cy={y(AVERAGE[hover])} r={3.5} fill="#b4b8c2" stroke="white" strokeWidth={2} />
            </g>
          )}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>
      )}

      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 w-[168px] rounded-lg bg-surface px-3 py-2.5 text-[12px]"
          style={{
            boxShadow: "var(--shadow-lift)",
            left: Math.min(Math.max(x(HOURS[hover]) - 84, 0), w - 168),
            top: -8,
          }}
        >
          <div className="mb-1.5 font-medium text-ink">
            {String(HOURS[hover]).padStart(2, "0")}:00 – {String(HOURS[hover] + 1).padStart(2, "0")}:00
          </div>
          <div className="flex items-center justify-between text-ink-3">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded bg-brand" /> Hoje
            </span>
            <span className="tnum font-medium text-ink">{hover < TODAY.length ? TODAY[hover] : "—"}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-ink-3">
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-3 border-t border-dashed border-[#9a9fab]" /> Média 4 sem.
            </span>
            <span className="tnum font-medium text-ink">{AVERAGE[hover]}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function smooth(pts: readonly (readonly [number, number])[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1] ?? pts[i];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const [x3, y3] = pts[i + 2] ?? pts[i + 1];
    const t = 0.18;
    d += ` C ${x1 + (x2 - x0) * t} ${y1 + (y2 - y0) * t}, ${x2 - (x3 - x1) * t} ${y2 - (y3 - y1) * t}, ${x2} ${y2}`;
  }
  return d;
}
