import { useState, useEffect } from "react";
import { Save, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DashboardAPI = () => {
  const { company, refetch } = useCompany();
  const [openaiKey, setOpenaiKey] = useState("");
  const [mpKey, setMpKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [testingOpenai, setTestingOpenai] = useState(false);

  useEffect(() => {
    if (!company) return;
    setOpenaiKey(company.openai_key);
    setMpKey(company.mp_key);
  }, [company]);

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("companies").update({ openai_key: openaiKey, mp_key: mpKey }).eq("id", company.id);
      if (error) throw error;
      await refetch();
      toast({ title: "Chaves salvas!" });
    } catch (err: any) {
      toast({ title: "Erro ao salvar chaves", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const testOpenAI = async () => {
    if (!openaiKey) return;
    setTestingOpenai(true);
    try {
      const res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${openaiKey}` } });
      toast({ title: res.ok ? "✅ Chave OpenAI válida!" : "❌ Chave inválida", variant: res.ok ? "default" : "destructive" });
    } catch {
      toast({ title: "❌ Erro ao testar", variant: "destructive" });
    }
    setTestingOpenai(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-foreground">🔑 API</h1><p className="text-muted-foreground">Configure suas chaves de integração</p></div>
          <Button onClick={handleSave} disabled={saving} className="bg-hero-gradient text-primary-foreground hover:opacity-90">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar</>}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-heading text-lg font-semibold text-card-foreground">OpenAI</h3>
            <div className="space-y-2"><Label>Chave da API OpenAI</Label><Input type="password" value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-..." /></div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={testOpenAI} disabled={testingOpenai || !openaiKey}>
                {testingOpenai ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Testar OpenAI
              </Button>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="h-3 w-3" /> Onde encontrar
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-heading text-lg font-semibold text-card-foreground">Mercado Pago</h3>
            <div className="space-y-2"><Label>Access Token do Mercado Pago</Label><Input type="password" value={mpKey} onChange={e => setMpKey(e.target.value)} placeholder="APP_USR-..." /></div>
            <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="h-3 w-3" /> Onde encontrar sua chave
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAPI;
