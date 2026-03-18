import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { useExternalCompany } from "@/hooks/useExternalCompany";

type NavItem = { emoji: string; label: string; path?: string; badge?: number; badgeColor?: string };
type NavGroup = { title: string; items: NavItem[] };

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { company } = useCompany();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openConvos, setOpenConvos] = useState(0);
  const [paidOrders, setPaidOrders] = useState(0);

  useEffect(() => {
    if (!company) return;
    const fetchCounts = async () => {
      const { count: convCount } = await externalSupabase.from("conversations").select("*", { count: "exact", head: true }).eq("company_id", company.id).eq("status", "open");
      setOpenConvos(convCount || 0);
      // orders table doesn't exist in external DB
      setPaidOrders(0);
    };
    fetchCounts();

    const channel = externalSupabase.channel("sidebar-counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `company_id=eq.${company.id}` }, () => fetchCounts())
      .subscribe();
    return () => { externalSupabase.removeChannel(channel); };
  }, [company]);

  const navGroups: NavGroup[] = [
    {
      title: "ATENDIMENTO",
      items: [
        { emoji: "💬", label: "Conversas", path: "/dashboard", badge: openConvos, badgeColor: "bg-primary" },
        { emoji: "🤖", label: "IA ao Vivo", path: "/dashboard/ai-live" },
        { emoji: "👥", label: "Bate Papo ao Vivo", path: "/dashboard/live-chat" },
      ],
    },
    {
      title: "VENDAS",
      items: [
        { emoji: "🛒", label: "Pedidos", path: "/dashboard/orders", badge: paidOrders, badgeColor: "bg-green-500" },
        { emoji: "📊", label: "Métricas", path: "/dashboard/metrics" },
        { emoji: "📣", label: "Transmissão", path: "/dashboard/broadcast" },
        { emoji: "🎯", label: "Audiência", path: "/dashboard/audience" },
      ],
    },
    {
      title: "AUTOMAÇÃO",
      items: [
        { emoji: "⚡", label: "Fluxos de Conversa", path: "/dashboard/flows" },
        { emoji: "🔁", label: "Automação", path: "/dashboard/automation" },
        { emoji: "🏷️", label: "Etiquetas", path: "/dashboard/labels" },
      ],
    },
    {
      title: "CONFIGURAÇÕES",
      items: [
        { emoji: "🏢", label: "Empresa", path: "/dashboard/settings" },
        { emoji: "💬", label: "Respostas Rápidas", path: "/dashboard/quick-replies" },
        { emoji: "🕐", label: "Horários", path: "/dashboard/hours" },
        { emoji: "🔌", label: "Conexões", path: "/dashboard/connections" },
        { emoji: "🔑", label: "API", path: "/dashboard/api" },
      ],
    },
  ];

  const isActive = (path?: string) => path && location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient shadow-glow">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">AtendIA</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-sidebar-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* WhatsApp status */}
        <div className="px-5 pb-3">
          {company?.customer_whatsapp ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span>+{company.customer_whatsapp.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "$1 ($2) $3-$4")}</span>
            </div>
          ) : (
            <Link to="/dashboard/settings" className="flex items-center gap-2 text-xs text-destructive hover:underline" onClick={() => setSidebarOpen(false)}>
              <span className="h-2 w-2 rounded-full bg-destructive" />
              WhatsApp não configurado
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-auto px-3 py-2 space-y-5">
          {navGroups.map(group => (
            <div key={group.title}>
              <span className="mb-2 block px-3 text-[10px] font-bold tracking-[2px] text-muted-foreground/60 uppercase">{group.title}</span>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = isActive(item.path);
                  const Wrapper = item.path ? Link : ("button" as any);
                  const wrapperProps = item.path
                    ? { to: item.path, onClick: () => setSidebarOpen(false) }
                    : { onClick: () => setSidebarOpen(false) };

                  return (
                    <Wrapper
                      key={item.label + (item.path || "")}
                      {...wrapperProps}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        active
                          ? "border-l-[3px] border-primary bg-primary/10 text-primary"
                          : "border-l-[3px] border-transparent text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <span className="text-[18px] leading-none" style={{ filter: "none" }}>{item.emoji}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white ${item.badgeColor || "bg-primary"}`}>
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

        <div className="border-t border-border px-3 py-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <LogOut className="h-[18px] w-[18px]" />
            Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

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
