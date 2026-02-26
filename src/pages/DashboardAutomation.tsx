import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, UserCheck, Clock, ShoppingCart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/DashboardLayout";
import SaveButton from "@/components/SaveButton";
import { useCompany } from "@/hooks/useCompany";
import { useSave } from "@/hooks/useSave";
import { supabase } from "@/integrations/supabase/client";

const DashboardAutomation = () => {
  const { company, refetch, ensureCompany } = useCompany();
  const { status, execute } = useSave();

  const [aiActive, setAiActive] = useState(true);
  const [responseDelay, setResponseDelay] = useState("3");
  const [detectPurchase, setDetectPurchase] = useState(true);
  const [escalationRules, setEscalationRules] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");

  useEffect(() => {
    if (!company) return;
    setAiInstructions(company.ai_instructions || "");
    setEscalationRules(company.escalation_rules || "");
  }, [company]);

  const handleSave = () => execute(async () => {
    const c = await ensureCompany();
    const { error } = await supabase.from("companies").update({
      ai_instructions: aiInstructions,
      escalation_rules: escalationRules,
    }).eq("id", c.id);
    if (error) throw error;
    await refetch();
  }, "⚡ Automação salva!");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Automação</h1>
            <p className="text-muted-foreground">Configure o comportamento da IA e regras de escalamento</p>
          </div>
          <SaveButton status={status} onClick={handleSave} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* AI Behavior Card */}
          <motion.div className="rounded-xl border border-border bg-card p-6 space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">Comportamento da IA</h2>
                <p className="text-sm text-muted-foreground">Controle como a IA responde</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>IA Ativa</Label>
              <Switch checked={aiActive} onCheckedChange={setAiActive} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Detectar intenção de compra</Label>
              <Switch checked={detectPurchase} onCheckedChange={setDetectPurchase} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Clock className="h-4 w-4" /> Delay de resposta (segundos)</Label>
              <Input type="number" min="0" max="30" value={responseDelay} onChange={e => setResponseDelay(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Instruções adicionais para a IA</Label>
              <Textarea rows={4} placeholder="Ex: Sempre ofereça os produtos ao final da conversa..." value={aiInstructions} onChange={e => setAiInstructions(e.target.value)} />
            </div>
          </motion.div>

          {/* Escalation Rules Card */}
          <motion.div className="rounded-xl border border-border bg-card p-6 space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">Escalamento para Humano</h2>
                <p className="text-sm text-muted-foreground">Quando a IA deve passar para um atendente</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Regras de escalamento</Label>
              <Textarea rows={8} placeholder={"Ex:\n- Quando o cliente pedir para falar com um atendente\n- Quando houver reclamação grave\n- Quando o assunto for financeiro"} value={escalationRules} onChange={e => setEscalationRules(e.target.value)} />
              <p className="text-xs text-muted-foreground">Uma regra por linha. A IA vai encaminhar a conversa quando identificar essas situações.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAutomation;
