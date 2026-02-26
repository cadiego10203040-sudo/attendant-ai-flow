import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/DashboardLayout";
import SaveButton from "@/components/SaveButton";
import { useCompany } from "@/hooks/useCompany";
import { useSave } from "@/hooks/useSave";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type QuickReply = { id: string; shortcut: string; message: string; };

const DashboardQuickReplies = () => {
  const { company, ensureCompany } = useCompany();
  const { status, execute } = useSave();
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [shortcut, setShortcut] = useState("");
  const [message, setMessage] = useState("");

  const fetchReplies = async () => {
    if (!company) return;
    const { data } = await supabase.from("quick_replies").select("*").eq("company_id", company.id).order("created_at");
    setReplies((data as QuickReply[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReplies(); }, [company]);

  const handleSave = () => {
    if (!company || !shortcut.trim() || !message.trim()) return;
    execute(async () => {
      if (editId) {
        const { error } = await supabase.from("quick_replies").update({ shortcut, message }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quick_replies").insert({ company_id: company.id, shortcut, message });
        if (error) throw error;
      }
      setOpen(false); setEditId(null); setShortcut(""); setMessage("");
      await fetchReplies();
    }, "💬 Resposta rápida salva!");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("quick_replies").delete().eq("id", id);
    fetchReplies();
    toast({ title: "Resposta rápida excluída!" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-foreground">💬 Respostas Rápidas</h1><p className="text-muted-foreground">Atalhos para mensagens frequentes</p></div>
          <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditId(null); setShortcut(""); setMessage(""); } }}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nova Resposta</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Editar" : "Nova"} Resposta Rápida</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Atalho (max 50 caracteres)</Label><Input maxLength={50} value={shortcut} onChange={e => setShortcut(e.target.value)} placeholder="Ex: /preco" /></div>
                <div className="space-y-2"><Label>Mensagem (max 1000 caracteres)</Label><Textarea rows={4} maxLength={1000} value={message} onChange={e => setMessage(e.target.value)} placeholder="Mensagem completa..." /></div>
                <SaveButton status={status} onClick={handleSave} className="w-full" />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {loading ? <p className="text-muted-foreground">Carregando...</p> : replies.length === 0 ? <p className="text-muted-foreground">Nenhuma resposta rápida</p> : replies.map((r, i) => (
            <motion.div key={r.id} className="rounded-xl border border-border bg-card p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{r.shortcut}</span>
                  <p className="mt-2 text-sm text-muted-foreground">{r.message}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditId(r.id); setShortcut(r.shortcut); setMessage(r.message); setOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-3 w-3 text-destructive" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Excluir resposta rápida?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(r.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardQuickReplies;
