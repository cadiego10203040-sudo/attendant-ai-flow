import { useState } from "react";
import { motion } from "framer-motion";
import { Save, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";

const DashboardSettings = () => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Gerencie sua empresa e integrações</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-hero-gradient text-primary-foreground hover:opacity-90">
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
            ) : saved ? (
              <><CheckCircle2 className="mr-2 h-4 w-4" /> Salvo!</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Salvar</>
            )}
          </Button>
        </div>

        <Tabs defaultValue="company">
          <TabsList>
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="ai">IA</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <motion.div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input defaultValue="Minha Loja" />
              </div>
              <div className="space-y-2">
                <Label>Segmento</Label>
                <Input defaultValue="E-commerce" />
              </div>
              <div className="space-y-2">
                <Label>Linguagem da IA</Label>
                <Input defaultValue="Informal" />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="ai">
            <motion.div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-2">
                <Label>Instruções para a IA</Label>
                <Textarea rows={5} defaultValue="Sempre cumprimente o cliente com simpatia. Ofereça os produtos mais relevantes." />
              </div>
              <div className="space-y-2">
                <Label>Objeções e Respostas</Label>
                <Textarea rows={3} defaultValue="'É caro' → 'Nosso produto tem o melhor custo-benefício do mercado...'" />
              </div>
              <div className="space-y-2">
                <Label>Horário de Atendimento</Label>
                <Input defaultValue="Seg-Sex 8h-18h" />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="whatsapp">
            <motion.div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-2">
                <Label>Phone Number ID</Label>
                <Input type="password" defaultValue="123456789" />
              </div>
              <div className="space-y-2">
                <Label>Access Token</Label>
                <Input type="password" defaultValue="EAAxxxxxxx" />
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="mb-2 text-sm font-medium text-foreground">URL do Webhook:</p>
                <code className="block rounded-lg bg-card px-3 py-2 text-xs text-foreground break-all">
                  https://seu-projeto.supabase.co/functions/v1/whatsapp-webhook
                </code>
              </div>
              <div className="flex gap-3">
                <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Regenerar Webhook</Button>
                <Button variant="outline">Testar Conexão</Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
