import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import SaveButton from "@/components/SaveButton";
import { useCompany } from "@/hooks/useCompany";
import { useSave } from "@/hooks/useSave";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Flow = { id: string; name: string; active: boolean; steps: any; executions: number; };

const DashboardFlows = () => {
  const { company, ensureCompany } = useCompany();
  const { status, execute } = useSave();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const fetchFlows = async () => {
    if (!company) return;
    const { data } = await supabase.from("flows").select("*").eq("company_id", company.id).order("created_at");
    setFlows((data as Flow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchFlows(); }, [company]);

  const toggleFlow = async (id: string, active: boolean) => {
    const { error } = await supabase.from("flows").update({ active: !active }).eq("id", id);
    if (error) { toast({ title: "❌ Erro ao atualizar fluxo", variant: "destructive" }); return; }
    toast({ title: "⚡ Fluxo atualizado!" });
    fetchFlows();
  };

  const createFlow = () => {
    if (!company || !newName.trim()) return;
    execute(async () => {
      const { error } = await supabase.from("flows").insert({ company_id: company.id, name: newName, steps: [{ message: newMessage }] });
      if (error) throw error;
      setOpen(false); setNewName(""); setNewMessage("");
      await fetchFlows();
    }, "⚡ Fluxo criado com sucesso!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-foreground">⚡ Fluxos de Conversa</h1><p className="text-muted-foreground">Automatize suas respostas</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Novo Fluxo</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Fluxo</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nome do Fluxo</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Boas Vindas" /></div>
                <div className="space-y-2"><Label>Mensagem Inicial</Label><Textarea rows={3} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Mensagem que será enviada..." /></div>
                <SaveButton status={status} onClick={createFlow} className="w-full" />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {loading ? <p className="text-muted-foreground">Carregando...</p> : flows.length === 0 ? <p className="text-muted-foreground">Nenhum fluxo criado</p> : flows.map((f, i) => (
            <motion.div key={f.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div>
                <h3 className="font-heading text-lg font-semibold text-card-foreground">{f.name}</h3>
                <p className="text-sm text-muted-foreground">{f.executions} execuções • {f.active ? "🟢 Ativo" : "⚫ Inativo"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={f.active} onCheckedChange={() => toggleFlow(f.id, f.active)} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardFlows;
