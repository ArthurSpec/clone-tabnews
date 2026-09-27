import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2, Star } from "lucide-react";
import type { Priority, TechStatus, TicketStatus, WorkOrderStatus } from "../../types";
import { PRIORITY_LABEL, TECH_STATUS_LABEL, TICKET_STATUS_LABEL, WO_STATUS_LABEL, initials } from "../../lib/format";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// ── Button ──────────────────────────────────────────────────────────────────

type Variant = "primary" | "brand" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-[#262a33] shadow-[0_1px_2px_rgb(0_0_0/0.12),inset_0_1px_0_rgb(255_255_255/0.08)]",
  brand: "bg-brand text-white hover:bg-brand-600 shadow-[0_1px_2px_rgb(67_80_196/0.3),inset_0_1px_0_rgb(255_255_255/0.14)]",
  secondary: "bg-surface text-ink-2 hover:bg-subtle hover:text-ink shadow-[0_1px_2px_rgb(17_19_24/0.05),0_0_0_1px_rgb(17_19_24/0.09)]",
  ghost: "text-ink-3 hover:text-ink hover:bg-black/[0.04]",
};
const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-[13.5px] gap-2 rounded-lg",
  lg: "h-11 px-5 text-[14.5px] gap-2 rounded-[10px]",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean; icon?: ReactNode }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center font-medium whitespace-nowrap select-none transition-[background,box-shadow,color,transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ── Badges ──────────────────────────────────────────────────────────────────

export type Tone = "neutral" | "ok" | "warn" | "bad" | "info" | "brand";

const TONES: Record<Tone, { bg: string; text: string; dot: string }> = {
  neutral: { bg: "bg-[#f1f1f4]", text: "text-ink-2", dot: "bg-ink-4" },
  ok: { bg: "bg-ok-soft", text: "text-ok-ink", dot: "bg-ok" },
  warn: { bg: "bg-warn-soft", text: "text-warn-ink", dot: "bg-warn" },
  bad: { bg: "bg-bad-soft", text: "text-bad-ink", dot: "bg-bad" },
  info: { bg: "bg-info-soft", text: "text-info-ink", dot: "bg-info" },
  brand: { bg: "bg-brand-soft", text: "text-brand-700", dot: "bg-brand" },
};

export function Badge({ tone = "neutral", dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  const t = TONES[tone];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-md px-2 h-[22px] text-[12px] font-medium whitespace-nowrap", t.bg, t.text, className)}>
      {dot && <span className={cx("size-1.5 rounded-full", t.dot)} />}
      {children}
    </span>
  );
}

export function Dot({ tone = "ok", pulse, className }: { tone?: Tone; pulse?: boolean; className?: string }) {
  return (
    <span className={cx("relative inline-flex size-2 shrink-0", className)}>
      {pulse && <span className={cx("absolute inset-0 rounded-full animate-pulse-ring", TONES[tone].dot)} />}
      <span className={cx("relative size-2 rounded-full", TONES[tone].dot)} />
    </span>
  );
}

export const PRIORITY_TONE: Record<Priority, Tone> = { alta: "bad", media: "warn", baixa: "neutral" };

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge tone={PRIORITY_TONE[priority]} dot>
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}

export const TICKET_TONE: Record<TicketStatus, Tone> = {
  aguardando: "warn",
  agendado: "brand",
  a_caminho: "info",
  em_atendimento: "info",
  diagnostico: "info",
  concluido: "ok",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge tone={TICKET_TONE[status]} dot>
      {TICKET_STATUS_LABEL[status]}
    </Badge>
  );
}

export const WO_TONE: Record<WorkOrderStatus, Tone> = {
  agendado: "brand",
  a_caminho: "info",
  em_atendimento: "info",
  diagnostico: "info",
  concluido: "ok",
};

export function WorkOrderStatusBadge({ status, size = "sm" }: { status: WorkOrderStatus; size?: "sm" | "lg" }) {
  return (
    <Badge tone={WO_TONE[status]} dot className={size === "lg" ? "h-7 px-2.5 text-[13px]" : ""}>
      {WO_STATUS_LABEL[status]}
    </Badge>
  );
}

export const TECH_TONE: Record<TechStatus, Tone> = {
  disponivel: "ok",
  em_atendimento: "info",
  em_deslocamento: "warn",
  folga: "neutral",
};

export function TechStatusLabel({ status, className }: { status: TechStatus; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2 text-[13px] text-ink-2", className)}>
      <Dot tone={TECH_TONE[status]} />
      {TECH_STATUS_LABEL[status]}
    </span>
  );
}

// ── Avatar ──────────────────────────────────────────────────────────────────

const AVATAR_TONES = [
  ["#e8ebfb", "#3641a8"],
  ["#e6f4ec", "#11793a"],
  ["#fdf0e3", "#9a5507"],
  ["#eef1f5", "#3a3e48"],
  ["#f3e9f7", "#7a3c96"],
  ["#e5f2f6", "#1c6a80"],
  ["#fbeaea", "#a13a3a"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({ name, size = 32, ring, className }: { name: string; size?: number; ring?: boolean; className?: string }) {
  const [bg, fg] = AVATAR_TONES[hash(name) % AVATAR_TONES.length];
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none", ring && "ring-2 ring-white", className)}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.36), letterSpacing: "0.01em" }}
    >
      {initials(name)}
    </span>
  );
}

// ── Stars ───────────────────────────────────────────────────────────────────

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i < Math.round(value) ? "fill-[#f5a524] text-[#f5a524]" : "fill-[#e8e8ec] text-[#e8e8ec]"}
        />
      ))}
    </span>
  );
}

// ── Score ring ──────────────────────────────────────────────────────────────

export function ScoreRing({ value, size = 64, stroke = 5, tone = "brand" }: { value: number; size?: number; stroke?: number; tone?: "brand" | "neutral" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = tone === "brand" ? "var(--color-brand)" : "#9a9fab";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eeeef2" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.2,0.7,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="tnum font-semibold text-ink" style={{ fontSize: size * 0.3, letterSpacing: "-0.02em" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5 text-[13px] text-ink-3">{eyebrow}</div>}
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
      <div className="min-w-0">
        <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx("min-w-0", className)}>
      <div className="text-[12px] text-ink-3 mb-1">{label}</div>
      <div className="text-[14px] font-medium text-ink">{children}</div>
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface px-1 text-[11px] font-medium text-ink-4">
      {children}
    </kbd>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={cx("h-9 px-4 text-left text-[12px] font-medium text-ink-3 whitespace-nowrap", className)}>{children}</th>;
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cx("h-[52px] px-4 text-[13.5px] text-ink-2 whitespace-nowrap", className)}>{children}</td>;
}
