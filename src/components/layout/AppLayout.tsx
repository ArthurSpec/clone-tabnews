import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  Cpu,
  HardHat,
  Inbox,
  LayoutGrid,
  Plus,
  RotateCcw,
  Route,
  Search,
  Users,
} from "lucide-react";
import { useStore } from "../../store/DemoStore";
import { useToast } from "../ui/Toast";
import { Avatar, Button, Dot, Kbd, cx } from "../ui";
import { COMPANY } from "../../data/customers";

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 32 32" className="shrink-0">
        <rect width="32" height="32" rx="8" fill="#111318" />
        <path d="M9 21c4 0 5-10 14-10" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="9" cy="21" r="2.6" fill="white" />
        <circle cx="23" cy="11" r="2.6" fill="#8b96f5" />
      </svg>
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">DispatchAI</span>}
    </div>
  );
}

const NAV = [
  {
    group: "Operação",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
      { to: "/chamados", label: "Chamados", icon: Inbox, badge: "awaiting" as const },
      { to: "/despacho", label: "Despacho IA", icon: Route },
      { to: "/ordens", label: "Ordens de serviço", icon: ClipboardList },
      { to: "/agenda", label: "Agenda", icon: CalendarDays },
    ],
  },
  {
    group: "Cadastros",
    items: [
      { to: "/tecnicos", label: "Técnicos", icon: HardHat },
      { to: "/clientes", label: "Clientes", icon: Users },
      { to: "/equipamentos", label: "Equipamentos", icon: Cpu },
    ],
  },
  {
    group: "Análise",
    items: [{ to: "/relatorios", label: "Relatórios", icon: BarChart3 }],
  },
];

function Sidebar() {
  const { stats, state, dispatch, reset } = useStore();
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[64px] flex-col border-r border-line bg-[#fbfbfc] lg:w-[232px]">
      <div className="flex h-14 items-center px-[19px] lg:px-5">
        <span className="lg:hidden">
          <Logo compact />
        </span>
        <span className="hidden lg:block">
          <Logo />
        </span>
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto px-2.5 pt-3 lg:px-3">
        {NAV.map((g) => (
          <div key={g.group} className="mb-5">
            <div className="eyebrow mb-1.5 hidden px-2.5 lg:block">{g.group}</div>
            <ul className="space-y-px">
              {g.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    title={item.label}
                    className={({ isActive }) =>
                      cx(
                        "group flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] transition-colors",
                        "justify-center lg:justify-start",
                        isActive ? "bg-white text-ink font-medium shadow-card" : "text-ink-3 hover:bg-black/[0.035] hover:text-ink",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cx("size-[17px] shrink-0", isActive ? "text-ink" : "text-ink-4 group-hover:text-ink-3")} strokeWidth={1.8} />
                        <span className="hidden flex-1 truncate lg:block">{item.label}</span>
                        {item.badge === "awaiting" && stats.awaiting > 0 && (
                          <span className="hidden h-[18px] min-w-[18px] items-center justify-center rounded-full bg-warn-soft px-1.5 text-[11px] font-semibold text-warn-ink tnum lg:inline-flex">
                            {stats.awaiting}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <button
          onClick={() => dispatch({ type: "setDemoMode", on: !state.demoMode })}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] text-ink-4 hover:bg-black/[0.035] hover:text-ink-3 lg:justify-between"
          title="Demo Mode"
        >
          <span className="hidden lg:inline">Demo Mode</span>
          <span className={cx("relative h-4 w-7 rounded-full transition-colors", state.demoMode ? "bg-brand" : "bg-[#dcdce2]")}>
            <span
              className={cx(
                "absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform",
                state.demoMode ? "translate-x-3.5" : "translate-x-0.5",
              )}
            />
          </span>
        </button>
        {state.demoMode && (
          <button
            onClick={() => {
              reset();
              navigate("/");
              toast("Demonstração reiniciada", { detail: "Todos os dados voltaram ao estado inicial.", kind: "doc" });
            }}
            className="mt-1.5 flex h-8 w-full animate-fade-in items-center justify-center gap-2 rounded-lg border border-dashed border-brand-line bg-brand-soft/60 text-[12.5px] font-medium text-brand-700 hover:bg-brand-soft"
            title="Reset Demo"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden lg:inline">Reset Demo</span>
          </button>
        )}
      </div>
    </aside>
  );
}

function Topbar() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-line bg-white/85 px-5 backdrop-blur-md lg:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#0e5a6b] text-[11px] font-bold tracking-tight text-white">
          CT
        </span>
        <div className="min-w-0 leading-tight">
          <div className="text-[13.5px] font-semibold text-ink">{COMPANY.name}</div>
          <div className="hidden truncate text-[11.5px] text-ink-4 xl:block">{COMPANY.tagline}</div>
        </div>
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        <span className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-ok-soft px-2.5 py-1 text-[12px] font-medium text-ok-ink sm:inline-flex">
          <Dot tone="ok" pulse />
          Operação online
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="hidden h-8 w-[260px] items-center gap-2 rounded-lg border border-line bg-subtle px-2.5 text-[13px] text-ink-4 xl:flex">
          <Search className="size-3.5" />
          <span className="flex-1 truncate whitespace-nowrap">Buscar chamados, clientes…</span>
          <Kbd>⌘K</Kbd>
        </div>
        <button className="relative flex size-8 items-center justify-center rounded-lg text-ink-3 hover:bg-black/[0.04] hover:text-ink" title="Notificações">
          <Bell className="size-[17px]" strokeWidth={1.8} />
          <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-bad ring-2 ring-white" />
        </button>
        <Button variant="brand" size="sm" icon={<Plus className="size-4" />} onClick={() => navigate("/chamados/novo")}>
          Novo chamado
        </Button>
        <span className="mx-1 h-5 w-px bg-line" />
        <div className="flex items-center gap-2">
          <Avatar name="Arthur" size={28} />
          <div className="hidden leading-tight whitespace-nowrap md:block">
            <div className="text-[13px] font-medium text-ink">Arthur</div>
            <div className="hidden text-[11.5px] text-ink-4 xl:block">Gestor de operações</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch, reset } = useStore();
  const toast = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Atalhos para gravação: Shift+D liga o Demo Mode; Shift+R reinicia (com Demo Mode ativo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.shiftKey && e.key.toLowerCase() === "d") dispatch({ type: "setDemoMode", on: !state.demoMode });
      if (e.shiftKey && e.key.toLowerCase() === "r" && state.demoMode) {
        reset();
        navigate("/");
        toast("Demonstração reiniciada", { detail: "Todos os dados voltaram ao estado inicial.", kind: "doc" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.demoMode, dispatch, reset, navigate, toast]);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-[64px] lg:pl-[232px]">
        <Topbar />
        <main key={location.pathname} className="mx-auto w-full max-w-[1320px] animate-rise px-5 py-7 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
