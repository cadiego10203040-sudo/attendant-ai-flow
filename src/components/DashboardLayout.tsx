import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MessageSquare, BarChart3, ShoppingCart, Settings, LogOut, Menu, X,
  MessagesSquare, Bot, Users, Megaphone, Zap, RefreshCw, Tag,
  Building2, FileText, Clock, Plug, KeyRound, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NavItem = {
  icon: React.ElementType;
  label: string;
  path?: string;
  badge?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "ATENDIMENTO",
    items: [
      { icon: MessagesSquare, label: "Conversas", path: "/dashboard", badge: "3" },
      { icon: Bot, label: "IA ao Vivo" },
      { icon: Users, label: "Bate Papo ao Vivo" },
    ],
  },
  {
    title: "VENDAS",
    items: [
      { icon: ShoppingCart, label: "Pedidos", path: "/dashboard/orders" },
      { icon: BarChart3, label: "Métricas", path: "/dashboard/metrics" },
      { icon: Megaphone, label: "Transmissão" },
      { icon: Users, label: "Audiência" },
    ],
  },
  {
    title: "AUTOMAÇÃO",
    items: [
      { icon: Zap, label: "Fluxos de Conversa" },
      { icon: RefreshCw, label: "Automação" },
      { icon: Tag, label: "Etiquetas" },
    ],
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      { icon: Building2, label: "Empresa", path: "/dashboard/settings" },
      { icon: FileText, label: "Respostas Rápidas" },
      { icon: Clock, label: "Horários" },
      { icon: Plug, label: "Conexões" },
      { icon: KeyRound, label: "API" },
      { icon: Settings2, label: "Configurações Gerais" },
    ],
  },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path?: string) => path && location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient shadow-glow">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">AtendIA</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-sidebar-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 overflow-auto px-3 py-2 space-y-5">
          {navGroups.map(group => (
            <div key={group.title}>
              <span className="mb-2 block px-3 text-[10px] font-bold tracking-[2px] text-muted-foreground/60 uppercase">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = isActive(item.path);
                  const Wrapper = item.path ? Link : "button" as any;
                  const wrapperProps = item.path
                    ? { to: item.path, onClick: () => setSidebarOpen(false) }
                    : { onClick: () => setSidebarOpen(false), className: "" };

                  return (
                    <Wrapper
                      key={item.label}
                      {...wrapperProps}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        active
                          ? "border-l-[3px] border-primary bg-primary/10 text-primary"
                          : "border-l-[3px] border-transparent text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-border px-3 py-4">
          <button
            onClick={() => navigate("/login")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3 lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-heading text-sm font-bold text-foreground">AtendIA</span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
