import { Check } from "lucide-react";
import { cx } from "./ui";

const STEPS = ["Mensagem", "Análise IA", "Despacho", "Ordem de serviço"];

/** Indicador do fluxo CHAMADO → IA → TÉCNICO → OS, exibido no topo das telas da demonstração. */
export function FlowStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1.5 text-[12.5px]">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-1.5">
            <span
              className={cx(
                "flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 transition-colors duration-300",
                active && "bg-ink text-white",
                done && "text-ink-2",
                !active && !done && "text-ink-4",
              )}
            >
              <span
                className={cx(
                  "flex size-[18px] items-center justify-center rounded-full text-[10.5px] font-semibold transition-colors duration-300",
                  active && "bg-white/15 text-white",
                  done && "bg-ok-soft text-ok-ink",
                  !active && !done && "bg-[#efeff2] text-ink-4",
                )}
              >
                {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              <span className="font-medium">{label}</span>
            </span>
            {i < STEPS.length - 1 && <span className={cx("h-px w-5 transition-colors", done ? "bg-ok/40" : "bg-line")} />}
          </li>
        );
      })}
    </ol>
  );
}
