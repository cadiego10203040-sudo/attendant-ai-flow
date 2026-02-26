import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import SaveButton from "@/components/SaveButton";
import { useCompany } from "@/hooks/useCompany";
import { useSave } from "@/hooks/useSave";
import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

type DayConfig = { enabled: boolean; start: string; end: string };

const DashboardHours = () => {
  const { company, refetch } = useCompany();
  const { status, execute } = useSave();
  const [days, setDays] = useState<DayConfig[]>(DAYS.map((_, i) => ({ enabled: i < 5, start: "08:00", end: "18:00" })));
  const [offlineMessage, setOfflineMessage] = useState("Estamos fora do horário de atendimento. Retornaremos em breve!");

  useEffect(() => {
    if (!company) return;
    try {
      const bh = typeof company.business_hours === "string" ? JSON.parse(company.business_hours) : company.business_hours;
      if (bh?.days) setDays(bh.days);
      if (bh?.offlineMessage) setOfflineMessage(bh.offlineMessage);
    } catch {}
  }, [company]);

  const updateDay = (index: number, field: keyof DayConfig, value: any) => {
    setDays(d => d.map((day, i) => i === index ? { ...day, [field]: value } : day));
  };

  const handleSave = () => execute(async () => {
    if (!company) throw new Error("Empresa não encontrada");
    const bh = JSON.stringify({ days, offlineMessage });
    const { error } = await supabase.from("companies").update({ business_hours: bh }).eq("id", company.id);
    if (error) throw error;
    await refetch();
  }, "🕐 Horários de atendimento salvos!");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-foreground">🕐 Horários</h1><p className="text-muted-foreground">Configure o horário de atendimento</p></div>
          <SaveButton status={status} onClick={handleSave} />
        </div>

        <div className="space-y-3">
          {DAYS.map((day, i) => (
            <div key={day} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <Switch checked={days[i].enabled} onCheckedChange={v => updateDay(i, "enabled", v)} />
              <span className="w-24 text-sm font-medium text-card-foreground">{day}</span>
              {days[i].enabled ? (
                <div className="flex items-center gap-2">
                  <Input type="time" value={days[i].start} onChange={e => updateDay(i, "start", e.target.value)} className="w-32" />
                  <span className="text-muted-foreground">até</span>
                  <Input type="time" value={days[i].end} onChange={e => updateDay(i, "end", e.target.value)} className="w-32" />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Fechado</span>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <Label>Mensagem fora do horário</Label>
            <Textarea rows={3} value={offlineMessage} onChange={e => setOfflineMessage(e.target.value)} />
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium text-foreground mb-2">Preview da resposta da IA fora do horário:</p>
            <p className="text-sm text-muted-foreground italic">{offlineMessage}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHours;
