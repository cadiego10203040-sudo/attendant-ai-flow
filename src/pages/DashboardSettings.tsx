import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import SaveButton from "@/components/SaveButton";
import { useCompany } from "@/hooks/useCompany";
import { useSave } from "@/hooks/useSave";
import { supabase } from "@/integrations/supabase/client";

type Product = { id: string; name: string; description: string; price: string; card_link: string; pix_link: string; isNew?: boolean };

const DashboardSettings = () => {
  const { company, refetch, ensureCompany } = useCompany();
  const { status, execute } = useSave();

  const [name, setName] = useState("");
  const [segment, setSegment] = useState("");
  const [language, setLanguage] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [trainingInstructions, setTrainingInstructions] = useState("");
  const [objections, setObjections] = useState("");
  const [escalation, setEscalation] = useState("");
  const [hours, setHours] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [whatsappToken, setWhatsappToken] = useState("");
  const [whatsappPhoneId, setWhatsappPhoneId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!company) return;
    setName(company.name);
    setSegment(company.segment);
    setLanguage(company.language);
    setAiInstructions(company.ai_instructions || "");
    setTrainingInstructions((company as any).training_instructions || "");
    setObjections(company.objections || "");
    setEscalation(company.escalation_rules || "");
    setHours(typeof company.business_hours === "string" ? company.business_hours : JSON.stringify(company.business_hours));
    setCustomerWhatsapp(company.customer_whatsapp || "");
    setOpenaiKey(company.openai_key || "");
    setWhatsappToken(company.whatsapp_token || "");
    setWhatsappPhoneId(company.whatsapp_phone_id || "");
    supabase.from("products").select("*").eq("company_id", company.id).then(({ data }) => {
      if (data) setProducts(data.map(p => ({ id: p.id, name: p.name, description: p.description || "", price: String(p.price || 0), card_link: p.card_link || "", pix_link: p.pix_link || "" })));
    });
  }, [company]);

  const handleSave = () => execute(async () => {
    const c = await ensureCompany();
    const { error } = await supabase.from("companies").update({ name, segment, language, ai_instructions: aiInstructions, training_instructions: trainingInstructions, objections, escalation_rules: escalation, business_hours: hours, customer_whatsapp: customerWhatsapp, openai_key: openaiKey, whatsapp_token: whatsappToken, whatsapp_phone_id: whatsappPhoneId } as any).eq("id", c.id);
    if (error) throw error;

    for (const p of products) {
      if (p.isNew) {
        const { error: e } = await supabase.from("products").insert({ company_id: c.id, name: p.name, description: p.description, price: parseFloat(p.price) || 0, card_link: p.card_link, pix_link: p.pix_link });
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from("products").update({ name: p.name, description: p.description, price: parseFloat(p.price) || 0, card_link: p.card_link, pix_link: p.pix_link }).eq("id", p.id);
        if (e) throw e;
      }
    }

    await refetch();
  }, "⚙️ Configurações salvas!");

  const addProduct = () => setProducts(p => [...p, { id: crypto.randomUUID(), name: "", description: "", price: "", card_link: "", pix_link: "", isNew: true }]);
  const removeProduct = async (id: string) => {
    const p = products.find(x => x.id === id);
    if (p && !p.isNew) await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(x => x.id !== id));
  };
  const updateProduct = (id: string, field: keyof Product, value: string) => setProducts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-foreground">Configurações</h1><p className="text-muted-foreground">Gerencie sua empresa e integrações</p></div>
          <SaveButton status={status} onClick={handleSave} />
        </div>

        <Tabs defaultValue="company">
          <TabsList><TabsTrigger value="company">Empresa</TabsTrigger><TabsTrigger value="products">Produtos</TabsTrigger><TabsTrigger value="ai">IA</TabsTrigger><TabsTrigger value="integrations">Integrações</TabsTrigger></TabsList>

          <TabsContent value="company">
            <motion.div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-2"><Label>Nome da Empresa</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Segmento</Label>
                <Select value={segment} onValueChange={setSegment}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ecommerce">E-commerce</SelectItem><SelectItem value="services">Serviços</SelectItem><SelectItem value="health">Saúde</SelectItem><SelectItem value="education">Educação</SelectItem><SelectItem value="other">Outro</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Linguagem da IA</Label>
                <Select value={language} onValueChange={setLanguage}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="formal">Formal</SelectItem><SelectItem value="informal">Informal</SelectItem><SelectItem value="technical">Técnica</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>📱 Número do WhatsApp para Atendimento</Label>
                <Input placeholder="Ex: 5573998715343 (com DDI e DDD, sem espaços)" value={customerWhatsapp} onChange={e => setCustomerWhatsapp(e.target.value.replace(/\D/g, ""))} />
                <p className="text-xs text-muted-foreground">Este é o número que seus clientes vão contatar para ser atendido pela IA</p>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="products">
            <motion.div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {products.map((p, i) => (
                <div key={p.id} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Produto {i + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Nome" value={p.name} onChange={e => updateProduct(p.id, "name", e.target.value)} />
                    <Input placeholder="Preço (R$)" value={p.price} onChange={e => updateProduct(p.id, "price", e.target.value)} />
                  </div>
                  <Input placeholder="Descrição curta" value={p.description} onChange={e => updateProduct(p.id, "description", e.target.value)} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Link pgto Cartão" value={p.card_link} onChange={e => updateProduct(p.id, "card_link", e.target.value)} />
                    <Input placeholder="Link pgto PIX" value={p.pix_link} onChange={e => updateProduct(p.id, "pix_link", e.target.value)} />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addProduct} className="w-full"><Plus className="mr-2 h-4 w-4" /> Adicionar Produto</Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="ai">
            <motion.div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-2"><Label>Instruções para a IA</Label><Textarea rows={5} value={aiInstructions} onChange={e => setAiInstructions(e.target.value)} /></div>
              <div className="space-y-2"><Label>Objeções e Respostas</Label><Textarea rows={3} value={objections} onChange={e => setObjections(e.target.value)} /></div>
              <div className="space-y-2"><Label>Horário de Atendimento</Label><Input value={hours} onChange={e => setHours(e.target.value)} /></div>
              <div className="space-y-2"><Label>Treinamento da IA</Label><Textarea rows={6} placeholder="Cole aqui o treinamento completo do seu bot..." value={trainingInstructions} onChange={e => setTrainingInstructions(e.target.value)} /><p className="text-xs text-muted-foreground">Este campo será usado como training_instructions pelo seu bot</p></div>
              <div className="space-y-2"><Label>Quando escalar para humano</Label><Textarea rows={2} value={escalation} onChange={e => setEscalation(e.target.value)} /></div>
            </motion.div>
          </TabsContent>

          <TabsContent value="integrations">
            <motion.div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="font-heading text-lg font-semibold text-card-foreground">🔑 Chaves de API</h3>
              <div className="space-y-2"><Label>Chave da API OpenAI</Label><Input type="password" placeholder="sk-..." value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} /></div>
              <div className="space-y-2"><Label>WhatsApp Phone ID</Label><Input placeholder="Ex: 123456789012345" value={whatsappPhoneId} onChange={e => setWhatsappPhoneId(e.target.value)} /></div>
              <div className="space-y-2"><Label>WhatsApp Access Token</Label><Input type="password" placeholder="EAAxxxxx..." value={whatsappToken} onChange={e => setWhatsappToken(e.target.value)} /></div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
