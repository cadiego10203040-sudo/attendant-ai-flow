import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Search, User, Send, UserCheck, Bot, X as XIcon, Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { useExternalCompany } from "@/hooks/useExternalCompany";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { toast } from "@/hooks/use-toast";

type Conversation = { id: string; customer_phone: string; customer_name?: string; status?: string | null; last_message?: string; created_at: string; };
type Message = { id: string; role: string; content: string; created_at: string; };

const statusOf = (c: Conversation) => c.status || "open";

const DashboardConversations = ({ onlyHuman = false }: { onlyHuman?: boolean }) => {
  const { company } = useCompany();
  const { externalCompanyId, loading: extLoading, notFound } = useExternalCompany();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(onlyHuman ? "waiting_human" : "all");
  const [humanMessage, setHumanMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!externalCompanyId) { setLoading(false); return; }
    const { data, error } = await externalSupabase.from("conversations").select("*").eq("company_id", externalCompanyId).order("created_at", { ascending: false });
    if (error) console.error("[conversations]", error);
    setConversations((data as Conversation[]) || []);
    setLoading(false);
  }, [externalCompanyId]);

  const fetchMessages = useCallback(async (convId: string) => {
    const { data, error } = await externalSupabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
    if (error) console.error("[messages]", error);
    setMessages((data as Message[]) || []);
  }, []);

  useEffect(() => { if (!extLoading) fetchConversations(); }, [fetchConversations, extLoading]);

  useEffect(() => {
    if (!externalCompanyId) return;
    const channel = externalSupabase.channel(`conversations-rt-${onlyHuman ? "h" : "a"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations", filter: `company_id=eq.${externalCompanyId}` }, () => fetchConversations())
      .subscribe();
    const poll = setInterval(fetchConversations, 5000);
    return () => { externalSupabase.removeChannel(channel); clearInterval(poll); };
  }, [externalCompanyId, fetchConversations, onlyHuman]);

  useEffect(() => {
    if (!selectedId) return;
    fetchMessages(selectedId);
    const channel = externalSupabase.channel(`messages-rt-${selectedId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` }, () => fetchMessages(selectedId))
      .subscribe();
    const poll = setInterval(() => fetchMessages(selectedId), 4000);
    return () => { externalSupabase.removeChannel(channel); clearInterval(poll); };
  }, [selectedId, fetchMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const selected = conversations.find(c => c.id === selectedId);
  const isHumanMode = selected ? statusOf(selected) === "waiting_human" : false;

  const updateStatus = async (id: string, status: string) => {
    setBusy(true);
    const { error } = await externalSupabase.from("conversations").update({ status }).eq("id", id);
    setBusy(false);
    if (error) {
      toast({
        title: "Não foi possível salvar",
        description: error.message.includes("status") ? "O banco externo ainda não tem a coluna 'status' em conversations. Rode o SQL indicado." : error.message,
        variant: "destructive",
      });
      return false;
    }
    setConversations(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    return true;
  };

  const handleAssume = async () => {
    if (!selectedId) return;
    const ok = await updateStatus(selectedId, isHumanMode ? "open" : "waiting_human");
    if (ok) toast({ title: isHumanMode ? "IA reativada" : "Você assumiu a conversa" });
  };

  const handleClose = async () => {
    if (!selectedId) return;
    if (await updateStatus(selectedId, "closed")) { setSelectedId(null); toast({ title: "Conversa fechada" }); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = humanMessage.trim();
    if (!text || !selected || !company || sending) return;
    setSending(true);
    const { error } = await supabase.functions.invoke("send-message", {
      body: { company_id: company.id, phone: selected.customer_phone, message: text },
    });
    if (error) {
      toast({ title: "Falha ao enviar no WhatsApp", description: "A mensagem não foi entregue. Verifique o token do WhatsApp em Configurações.", variant: "destructive" });
      setSending(false);
      return;
    }
    const { error: insErr } = await externalSupabase.from("messages").insert({ conversation_id: selected.id, role: "assistant", content: text });
    if (insErr) toast({ title: "Enviada, mas não salva no histórico", description: insErr.message, variant: "destructive" });
    await externalSupabase.from("conversations").update({ last_message: text }).eq("id", selected.id);
    setHumanMessage("");
    setSending(false);
    fetchMessages(selected.id);
  };

  const visible = conversations
    .filter(c => (filter === "all" ? true : statusOf(c) === filter))
    .filter(c => (c.customer_name || c.customer_phone || "").toLowerCase().includes(search.toLowerCase()));

  const statusBadge = (c: Conversation) => {
    const s = statusOf(c);
    if (s === "open") return "🟢";
    if (s === "waiting_human") return "🟡";
    return "⚫";
  };

  return (
    <DashboardLayout>
      {notFound && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Empresa não encontrada no banco do WhatsApp. Confira se o Phone Number ID em Configurações é o mesmo usado pelo bot.
        </div>
      )}
      <div className="flex h-full flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-80 shrink-0 rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="mb-3 font-heading text-lg font-bold text-card-foreground">{onlyHuman ? "👥 Atendimento Humano" : "Conversas"}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou número..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {!onlyHuman && (
              <div className="mt-2 flex flex-wrap gap-1">
                {["all", "open", "waiting_human", "closed"].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                    {f === "all" ? "Todas" : f === "open" ? "Abertas" : f === "waiting_human" ? "Aguardando" : "Fechadas"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="max-h-[60vh] overflow-auto">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Carregando...</p>
            ) : visible.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{onlyHuman ? "Nenhuma conversa com humano. Assuma uma em Conversas." : "Nenhuma conversa encontrada"}</p>
            ) : visible.map(c => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors ${selectedId === c.id ? "bg-accent" : "hover:bg-muted"}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><User className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">{c.customer_name || c.customer_phone}</span>
                    <span className="text-xs text-muted-foreground">{statusBadge(c)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.last_message || "Sem mensagens"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card min-h-[60vh]">
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
                  <Button disabled={busy} variant={isHumanMode ? "default" : "outline"} size="sm" onClick={handleAssume} className={isHumanMode ? "bg-hero-gradient text-primary-foreground" : ""}>
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />} {isHumanMode ? "Devolver à IA" : "Assumir"}
                  </Button>
                  <Button disabled={busy} variant="outline" size="sm" onClick={handleClose}><XIcon className="mr-2 h-4 w-4" /> Fechar</Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3 max-h-[60vh]">
                {messages.map(m => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "rounded-bl-sm bg-secondary text-secondary-foreground" : "rounded-br-sm bg-primary text-primary-foreground"}`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={`mt-1 text-[10px] ${m.role === "user" ? "text-muted-foreground" : "text-primary-foreground/60"}`}>{new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>
              {isHumanMode ? (
                <div className="border-t border-border p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input placeholder="Digite sua mensagem..." value={humanMessage} onChange={e => setHumanMessage(e.target.value)} className="flex-1" disabled={sending} />
                    <Button type="submit" size="sm" disabled={sending} className="bg-hero-gradient text-primary-foreground">
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </div>
              ) : (
                <p className="border-t border-border p-3 text-center text-xs text-muted-foreground">Clique em "Assumir" para responder manualmente.</p>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground"><p>Selecione uma conversa para visualizar</p></div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardConversations;
