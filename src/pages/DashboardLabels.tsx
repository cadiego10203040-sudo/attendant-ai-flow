import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type LabelItem = { id: string; name: string; color: string; };

const DashboardLabels = () => {
  const { company } = useCompany();
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#FF6B2B");
  const [saving, setSaving] = useState(false);

  const fetchLabels = async () => {
    if (!company) return;
    const { data } = await supabase.from("labels").select("*").eq("company_id", company.id).order("created_at");
    setLabels((data as LabelItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLabels(); }, [company]);

  const handleSave = async () => {
    if (!company || !name.trim()) return;
    setSaving(true);
    if (editId) {
      await supabase.from("labels").update({ name, color }).eq("id", editId);
      toast({ title: "Etiqueta atualizada!" });
    } else {
      await supabase.from("labels").insert({ company_id: company.id, name, color });
      toast({ title: "Etiqueta criada!" });
    }
    setOpen(false); setEditId(null); setName(""); setColor("#FF6B2B");
    fetchLabels();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("labels").delete().eq("id", id);
    fetchLabels();
    toast({ title: "Etiqueta excluída!" });
  };

  const startEdit = (l: LabelItem) => {
    setEditId(l.id); setName(l.name); setColor(l.color); setOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-foreground">🏷️ Etiquetas</h1><p className="text-muted-foreground">Organize suas conversas</p></div>
          <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setEditId(null); setName(""); setColor("#FF6B2B"); } }}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Nova Etiqueta</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Editar" : "Nova"} Etiqueta</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: VIP" /></div>
                <div className="space-y-2"><Label>Cor</Label><div className="flex gap-3 items-center"><input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-10 rounded-lg border border-border cursor-pointer" /><span className="text-sm text-muted-foreground">{color}</span></div></div>
                <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? <p className="text-muted-foreground">Carregando...</p> : labels.length === 0 ? <p className="text-muted-foreground">Nenhuma etiqueta criada</p> : labels.map((l, i) => (
            <motion.div key={l.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="font-medium text-card-foreground">{l.name}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(l)}><Pencil className="h-3 w-3" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="ghost" size="sm"><Trash2 className="h-3 w-3 text-destructive" /></Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Excluir etiqueta?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(l.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardLabels;
