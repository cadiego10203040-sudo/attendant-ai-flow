import { useState, useEffect } from "react";
import { Loader2, Copy, XCircle, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import SaveButton from "@/components/SaveButton";
import { useCompany } from "@/hooks/useCompany";
import { useSave } from "@/hooks/useSave";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DashboardConnections = () => {
  const { company, refetch, ensureCompany } = useCompany();
  const { status, execute } = useSave();
  const [phoneId, setPhoneId] = useState("");
  const [token, setToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (!company) return;
    setPhoneId(company.whatsapp_phone_id || "");
    setToken(company.whatsapp_token || "");
    setVerifyToken(company.whatsapp_verify_token || "");
    setWebhookUrl(company.webhook_url || "");
    setConnected(!!company.whatsapp_phone_id && !!company.whatsapp_token);
  }, [company]);

  const handleSave = () => {
    if (!phoneId.trim()) { toast({ title: "Phone Number ID é obrigatório", variant: "destructive" }); return; }
    if (!token.trim()) { toast({ title: "Access Token é obrigatório", variant: "destructive" }); return; }
    if (!verifyToken.trim()) { toast({ title: "Verify Token é obrigatório", variant: "destructive" }); return; }
    if (!webhookUrl.trim() || !webhookUrl.startsWith("https://")) { toast({ title: "URL do Webhook inválida", description: "Deve começar com https://", variant: "destructive" }); return; }

    execute(async () => {
      if (!company) throw new Error("Empresa não encontrada");
      const { error } = await supabase.from("companies").update({
        whatsapp_phone_id: phoneId,
        whatsapp_token: token,
        whatsapp_verify_token: verifyToken,
        webhook_url: webhookUrl,
      }).eq("id", company.id);
      if (error) throw error;
      await refetch();
    }, "🔌 Configurações do WhatsApp salvas!");
  };

  const handleTest = async () => {
    if (!webhookUrl.trim() || !webhookUrl.startsWith("https://")) {
      toast({ title: "URL do Webhook inválida", description: "Deve começar com https://", variant: "destructive" });
      return;
    }
    if (!verifyToken.trim()) {
      toast({ title: "Verify Token é obrigatório", variant: "destructive" });
      return;
    }
    setTesting(true);
    try {
      const testUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=12345`;
      const res = await fetch(testUrl);
      const text = await res.text();
      if (text.trim() === "12345") {
        setConnected(true);
        toast({ title: "✅ Webhook respondendo corretamente" });
      } else {
        setConnected(false);
        toast({ title: "❌ Verify token inválido", description: "Webhook não retornou o challenge esperado", variant: "destructive" });
      }
    } catch {
      setConnected(false);
      toast({ title: "❌ Erro de rede", description: "Não foi possível conectar ao webhook", variant: "destructive" });
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

          <div className="space-y-2">
            <Label>URL do Webhook</Label>
            <div className="flex gap-2">
              <Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://seu-webhook.com/endpoint" className="flex-1" />
              <Button variant="outline" size="icon" onClick={copyWebhook} title="Copiar"><Copy className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleTest} disabled={testing || !webhookUrl || !verifyToken} variant="outline">
              {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando...</> : "Testar Conexão"}
            </Button>
            <SaveButton status={status} onClick={handleSave} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardConnections;
