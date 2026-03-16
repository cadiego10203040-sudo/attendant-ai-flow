import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Copy, Send, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Broadcast = { id: string; title: string; message: string; audience_filter: any; status: string; scheduled_at: string | null; sent_at: string | null; total_sent: number; created_at: string; };

const DashboardBroadcast = () => {
  const { company } = useCompany();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [scheduleAt, setScheduleAt] = useState("");

  const fetchBroadcasts = async () => {
    if (!company) return;
    const { data } = await supabase.from("broadcasts").select("*").eq("company_id", company.id).order("created_at", { ascending: false });
    setBroadcasts((data as Broadcast[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBroadcasts(); }, [company]);

  const handleCreate = async () => {
    if (!company || !title.trim() || !message.trim()) return;
    setSaving(true);
    const payload: any = { company_id: company.id, title, message, audience_filter: { type: audience }, status: scheduleAt ? "scheduled" : "draft" };
    if (scheduleAt) payload.scheduled_at = new Date(scheduleAt).toISOString();
    const { error } = await supabase.from("broadcasts").insert(payload);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Transmissão criada!" }); setOpen(false); setTitle(""); setMessage(""); fetchBroadcasts(); }
    setSaving(false);
  };

  const duplicate = async (b: Broadcast) => {
    if (!company) return;
    await supabase.from("broadcasts").insert({ company_id: company.id, title: `${b.title} (cópia)`, message: b.message, audience_filter: b.audience_filter, status: "draft" });
    fetchBroadcasts();
    toast({ title: "Transmissão duplicada!" });
  };

  const statusMap: Record<string, string> = { draft: "📝 Rascunho", sent: "✅ Enviado", scheduled: "📅 Agendado" };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-foreground">📣 Transmissão</h1><p className="text-muted-foreground">Envie mensagens em massa</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nova Transmissão</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Transmissão</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome da campanha" /></div>
                <div className="space-y-2"><Label>Mensagem ({message.length}/1000)</Label><Textarea rows={4} maxLength={1000} value={message} onChange={e => setMessage(e.target.value)} placeholder="Sua mensagem..." /></div>
                <div className="space-y-2"><Label>Audiência</Label>
                  <Select value={audience} onValueChange={setAudience}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="buyers">Só compradores</SelectItem><SelectItem value="leads">Só leads</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Agendar (opcional)</Label><Input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} /></div>
                <Button onClick={handleCreate} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {scheduleAt ? "Agendar" : "Criar Rascunho"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {loading ? <p className="text-muted-foreground">Carregando...</p> : broadcasts.length === 0 ? <p className="text-muted-foreground">Nenhuma transmissão criada</p> : broadcasts.map((b, i) => (
            <motion.div key={b.id} className="rounded-xl border border-border bg-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-card-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">{b.message}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm">{statusMap[b.status] || b.status}</span>
                  {b.total_sent > 0 && <p className="text-xs text-muted-foreground">{b.total_sent} enviados</p>}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => duplicate(b)}><Copy className="mr-1 h-3 w-3" /> Duplicar</Button>
                {b.status === "draft" && (
                  <Button size="sm" onClick={async () => {
                    try {
                      const { error } = await supabase.functions.invoke("send-broadcast", { body: { broadcast_id: b.id } });
                      if (error) throw error;
                      toast({ title: "Transmissão enviada!" });
                      fetchBroadcasts();
                    } catch (err: any) {
                      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
                    }
                  }}>
                    <Send className="mr-1 h-3 w-3" /> Enviar Agora
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardBroadcast;
