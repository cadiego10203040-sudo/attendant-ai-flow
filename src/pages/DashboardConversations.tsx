import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, User, Send, UserCheck, Bot, X as XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { toast } from "@/hooks/use-toast";

type Conversation = { id: string; customer_phone: string; customer_name: string; status: string; last_message: string; last_message_at: string; };
type Message = { id: string; role: string; content: string; created_at: string; };

const DashboardConversations = () => {
  const { company } = useCompany();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [humanMessage, setHumanMessage] = useState("");
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!company) return;
    let query = externalSupabase.from("conversations").select("*").eq("company_id", company.id).order("last_message_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setConversations((data as Conversation[]) || []);
    setLoading(false);
  }, [company, filter]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!company) return;
    const channel = externalSupabase.channel("conversations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `company_id=eq.${company.id}` }, () => fetchConversations())
      .subscribe();
    return () => { externalSupabase.removeChannel(channel); };
  }, [company, fetchConversations]);

  const fetchMessages = useCallback(async (convId: string) => {
    const { data } = await externalSupabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
  }, []);

  useEffect(() => { if (selectedId) fetchMessages(selectedId); }, [selectedId, fetchMessages]);

  useEffect(() => {
    if (!selectedId) return;
    const channel = externalSupabase.channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` }, () => fetchMessages(selectedId))
      .subscribe();
    return () => { externalSupabase.removeChannel(channel); };
  }, [selectedId, fetchMessages]);

  const handleAssume = async () => {
    if (!selectedId) return;
    const newMode = !isHumanMode;
    setIsHumanMode(newMode);
    await supabase.from("conversations").update({ status: newMode ? "waiting_human" : "open" }).eq("id", selectedId);
    fetchConversations();
  };

  const handleClose = async () => {
    if (!selectedId) return;
    await supabase.from("conversations").update({ status: "closed" }).eq("id", selectedId);
    setSelectedId(null);
    fetchConversations();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanMessage.trim() || !selectedId || !company) return;
    const conv = conversations.find(c => c.id === selectedId);
    if (!conv) return;
    
    try {
      const { error } = await supabase.functions.invoke("send-message", {
        body: {
          company_id: company.id,
          phone: conv.customer_phone,
          message: humanMessage,
          conversation_id: selectedId,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      // Fallback: save locally even if WhatsApp send fails
      await supabase.from("messages").insert({ conversation_id: selectedId, role: "assistant", content: humanMessage });
      await supabase.from("conversations").update({ last_message: humanMessage, last_message_at: new Date().toISOString() }).eq("id", selectedId);
      toast({ title: "Mensagem salva", description: "Não foi possível enviar via WhatsApp. A mensagem foi salva localmente.", variant: "destructive" });
    }
    setHumanMessage("");
    fetchMessages(selectedId);
  };

  const selected = conversations.find(c => c.id === selectedId);
  const filtered = conversations.filter(c =>
    (c.customer_name || c.customer_phone).toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    if (status === "open") return "🟢";
    if (status === "waiting_human") return "🟡";
    return "⚫";
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-80 shrink-0 rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="mb-3 font-heading text-lg font-bold text-card-foreground">Conversas</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou número..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="mt-2 flex gap-1">
              {["all", "open", "waiting_human", "closed"].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                  {f === "all" ? "Todas" : f === "open" ? "Abertas" : f === "waiting_human" ? "Aguardando" : "Fechadas"}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[60vh] overflow-auto">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Carregando...</p>
            ) : filtered.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Nenhuma conversa encontrada</p>
            ) : filtered.map(c => (
              <button key={c.id} onClick={() => { setSelectedId(c.id); setIsHumanMode(c.status === "waiting_human"); }} className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors ${selectedId === c.id ? "bg-accent" : "hover:bg-muted"}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">{c.customer_name || c.customer_phone}</span>
                    <span className="text-xs text-muted-foreground">{statusBadge(c.status)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.last_message || "Sem mensagens"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card">
          {selected ? (
            <>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><User className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{selected.customer_name || selected.customer_phone}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">{isHumanMode ? <><UserCheck className="h-3 w-3" /> Humano atendendo</> : <><Bot className="h-3 w-3" /> IA atendendo</>}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant={isHumanMode ? "default" : "outline"} size="sm" onClick={handleAssume} className={isHumanMode ? "bg-hero-gradient text-primary-foreground" : ""}>
                    <UserCheck className="mr-2 h-4 w-4" /> {isHumanMode ? "IA Pausada" : "Assumir"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClose}><XIcon className="mr-2 h-4 w-4" /> Fechar</Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-secondary text-secondary-foreground"}`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={`mt-1 text-[10px] ${m.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {isHumanMode && (
                <div className="border-t border-border p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input placeholder="Digite sua mensagem..." value={humanMessage} onChange={e => setHumanMessage(e.target.value)} className="flex-1" />
                    <Button type="submit" size="sm" className="bg-hero-gradient text-primary-foreground"><Send className="h-4 w-4" /></Button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p>Selecione uma conversa para visualizar</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardConversations;
