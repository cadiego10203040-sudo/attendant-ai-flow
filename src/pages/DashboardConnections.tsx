import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, Copy, XCircle, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DashboardConnections = () => {
  const { company, refetch } = useCompany();
  const [phoneId, setPhoneId] = useState("");
  const [token, setToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (!company) return;
    setPhoneId(company.whatsapp_phone_id);
    setToken(company.whatsapp_token);
    setVerifyToken(company.whatsapp_verify_token);
    setConnected(!!company.whatsapp_phone_id && !!company.whatsapp_token);
  }, [company]);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whatsapp-webhook`;

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    await supabase.from("companies").update({ whatsapp_phone_id: phoneId, whatsapp_token: token, whatsapp_verify_token: verifyToken }).eq("id", company.id);
    await refetch();
    toast({ title: "Conexão salva!" });
    setSaving(false);
  };

  const handleTest = async () => {
    if (!phoneId || !token) return;
    setTesting(true);
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}`, { headers: { Authorization: `Bearer ${token}` } });
      setConnected(res.ok);
      toast({ title: res.ok ? "✅ Conectado!" : "❌ Erro na conexão", description: res.ok ? "WhatsApp está funcionando" : "Verifique suas credenciais", variant: res.ok ? "default" : "destructive" });
    } catch {
      setConnected(false);
      toast({ title: "❌ Erro", description: "Não foi possível conectar", variant: "destructive" });
    }
    setTesting(false);
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({ title: "URL copiada!" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-foreground">🔌 Conexões</h1><p className="text-muted-foreground">Configure seu WhatsApp</p></div>
          <div className="flex items-center gap-2">
            {connected !== null && (
              <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${connected ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {connected ? <><Wifi className="h-3 w-3" /> Conectado</> : <><XCircle className="h-3 w-3" /> Desconectado</>}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-2"><Label>Phone Number ID</Label><Input value={phoneId} onChange={e => setPhoneId(e.target.value)} placeholder="Obtido no Meta for Developers" /></div>
          <div className="space-y-2"><Label>Access Token</Label><Input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="Token permanente" /></div>
          <div className="space-y-2"><Label>Verify Token</Label><Input value={verifyToken} onChange={e => setVerifyToken(e.target.value)} placeholder="String de verificação" /></div>

          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">URL do Webhook</p>
                <code className="block mt-1 text-xs text-foreground break-all">{webhookUrl}</code>
              </div>
              <Button variant="outline" size="sm" onClick={copyWebhook}><Copy className="mr-1 h-3 w-3" /> Copiar</Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleTest} disabled={testing || !phoneId || !token} variant="outline">
              {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando...</> : "Testar Conexão"}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-hero-gradient text-primary-foreground hover:opacity-90">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar</>}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardConnections;
