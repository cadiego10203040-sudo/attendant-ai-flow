import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Eye, Pause, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/integrations/supabase/externalClient";

type Conversation = { id: string; customer_phone: string; customer_name: string; status: string; last_message: string; last_message_at: string; };

const DashboardAILive = () => {
  const { company } = useCompany();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    const fetch = async () => {
      const { data } = await supabase.from("conversations").select("*").eq("company_id", company.id).eq("status", "open").order("last_message_at", { ascending: false });
      setConversations((data as Conversation[]) || []);
      setLoading(false);
    };
    fetch();
    const channel = supabase.channel("ai-live").on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `company_id=eq.${company.id}` }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [company]);

  const pauseAI = async (id: string) => {
    await supabase.from("conversations").update({ status: "waiting_human" }).eq("id", id);
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
                <div><p className="text-sm font-medium text-card-foreground">{c.customer_name || c.customer_phone}</p><p className="text-xs text-muted-foreground">Última atividade: {new Date(c.last_message_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div>
              </div>
              <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/dashboard"}><Eye className="mr-1 h-3 w-3" /> Ver</Button>
                <Button variant="outline" size="sm" onClick={() => pauseAI(c.id)}><Pause className="mr-1 h-3 w-3" /> Pausar IA</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAILive;
