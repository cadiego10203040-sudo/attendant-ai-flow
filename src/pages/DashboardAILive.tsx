import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bot, Eye, Pause, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useExternalCompany } from "@/hooks/useExternalCompany";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { toast } from "@/hooks/use-toast";

type Conversation = { id: string; customer_phone: string; customer_name?: string; status?: string | null; last_message?: string; created_at: string; };

const DashboardAILive = () => {
  const navigate = useNavigate();
  const { externalCompanyId, loading: extLoading } = useExternalCompany();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pausing, setPausing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!externalCompanyId) { setLoading(false); return; }
    const { data, error } = await externalSupabase.from("conversations").select("*").eq("company_id", externalCompanyId).order("created_at", { ascending: false });
    if (error) console.error("[ai-live]", error);
    setConversations(((data as Conversation[]) || []).filter(c => (c.status || "open") === "open"));
    setLoading(false);
  }, [externalCompanyId]);

  useEffect(() => {
    if (extLoading) return;
    fetchData();
    if (!externalCompanyId) return;
    const channel = externalSupabase.channel("ai-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `company_id=eq.${externalCompanyId}` }, () => fetchData())
      .subscribe();
    const poll = setInterval(fetchData, 5000);
    return () => { externalSupabase.removeChannel(channel); clearInterval(poll); };
  }, [externalCompanyId, extLoading, fetchData]);

  const pauseAI = async (id: string) => {
    setPausing(id);
    const { error } = await externalSupabase.from("conversations").update({ status: "waiting_human" }).eq("id", id);
    setPausing(null);
    if (error) {
      toast({ title: "Não foi possível pausar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "IA pausada", description: "A conversa foi para Bate Papo ao Vivo." });
    fetchData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">🤖 IA ao Vivo</h1>
          <p className="text-muted-foreground">Conversas sendo atendidas pela IA agora: <span className="font-bold text-primary">{conversations.length}</span></p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? <p className="text-muted-foreground">Carregando...</p> : conversations.length === 0 ? <p className="text-muted-foreground">Nenhuma conversa ativa com IA no momento</p> : conversations.map((c, i) => (
            <motion.div key={c.id} className="rounded-xl border border-border bg-card p-5 space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Bot className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm font-medium text-card-foreground">{c.customer_name || c.customer_phone}</p><p className="text-xs text-muted-foreground">Início: {new Date(c.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p></div>
              </div>
              <p className="text-xs text-muted-foreground truncate">{c.last_message || "Sem mensagens"}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}><Eye className="mr-1 h-3 w-3" /> Ver</Button>
                <Button variant="outline" size="sm" disabled={pausing === c.id} onClick={() => pauseAI(c.id)}>
                  {pausing === c.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Pause className="mr-1 h-3 w-3" />} Pausar IA
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAILive;
