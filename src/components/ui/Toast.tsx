import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Bell, CheckCircle2, FileText, MessageCircle } from "lucide-react";

type Kind = "success" | "notify" | "doc" | "message";

interface ToastItem {
  id: number;
  title: string;
  detail?: string;
  kind: Kind;
  leaving?: boolean;
}

const ToastCtx = createContext<(title: string, opts?: { detail?: string; kind?: Kind }) => void>(() => {});

const ICON: Record<Kind, ReactNode> = {
  success: <CheckCircle2 className="size-[18px] text-ok" />,
  notify: <Bell className="size-[18px] text-brand" />,
  doc: <FileText className="size-[18px] text-ink-2" />,
  message: <MessageCircle className="size-[18px] text-ok" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const toast = useCallback((title: string, opts: { detail?: string; kind?: Kind } = {}) => {
    const id = ++seq.current;
    setItems((list) => [...list.slice(-3), { id, title, detail: opts.detail, kind: opts.kind ?? "success" }]);
    setTimeout(() => setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t))), 3400);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3650);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-5 bottom-5 z-[100] flex w-[340px] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl bg-surface px-4 py-3 transition-all duration-200"
            style={{
              boxShadow: "var(--shadow-pop)",
              opacity: t.leaving ? 0 : 1,
              transform: t.leaving ? "translateY(4px)" : undefined,
              animation: t.leaving ? undefined : "rise 260ms cubic-bezier(0.2,0.7,0.2,1) both",
            }}
          >
            <span className="mt-px">{ICON[t.kind]}</span>
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium text-ink">{t.title}</div>
              {t.detail && <div className="mt-0.5 text-[12.5px] text-ink-3">{t.detail}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
