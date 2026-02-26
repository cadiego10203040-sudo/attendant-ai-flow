import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Package, Brain, MessageSquare, ArrowRight, ArrowLeft, Plus, Trash2, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const steps = [
  { icon: Building2, label: "Empresa" },
  { icon: Package, label: "Produtos" },
  { icon: Brain, label: "IA" },
  { icon: MessageSquare, label: "WhatsApp" },
];

type Product = { id: string; name: string; description: string; price: string; linkCard: string; linkPix: string };

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [segment, setSegment] = useState("");
  const [language, setLanguage] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "", description: "", price: "", linkCard: "", linkPix: "" },
  ]);

  const [aiPrompt, setAiPrompt] = useState("");
  const [objections, setObjections] = useState("");
  const [hours, setHours] = useState("Seg-Sex 8h-18h");
  const [escalation, setEscalation] = useState("");

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp-webhook");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | boolean>(null);

  const addProduct = () => setProducts(p => [...p, { id: crypto.randomUUID(), name: "", description: "", price: "", linkCard: "", linkPix: "" }]);
  const removeProduct = (id: string) => setProducts(p => p.filter(x => x.id !== id));
  const updateProduct = (id: string, field: keyof Product, value: string) => setProducts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x));

  const testConnection = async () => {
    if (!phoneNumberId || !accessToken) return;
    setTesting(true);
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTestResult(res.ok);
      if (!res.ok) toast({ title: "Erro na conexão", description: "Verifique suas credenciais", variant: "destructive" });
    } catch {
      setTestResult(false);
      toast({ title: "Erro na conexão", description: "Não foi possível conectar", variant: "destructive" });
    }
    setTesting(false);
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let logoUrl = "";
      if (logo) {
        const ext = logo.name.split(".").pop();
        const path = `${user.id}/logo.${ext}`;
        await supabase.storage.from("logos").upload(path, logo, { upsert: true });
        const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
        logoUrl = urlData.publicUrl;
      }

      const { data: company, error } = await supabase.from("companies").insert({
        user_id: user.id,
        name: companyName,
        segment,
        language,
        logo_url: logoUrl,
        business_hours: hours,
        ai_instructions: aiPrompt,
        objections,
        escalation_rules: escalation,
        whatsapp_phone_id: phoneNumberId,
        whatsapp_token: accessToken,
        whatsapp_verify_token: verifyToken,
        webhook_url: webhookUrl,
      }).select().single();

      if (error) throw error;

      const validProducts = products.filter(p => p.name.trim());
      if (validProducts.length > 0 && company) {
        await supabase.from("products").insert(
          validProducts.map(p => ({
            company_id: company.id,
            name: p.name,
            description: p.description,
            price: parseFloat(p.price) || 0,
            card_link: p.linkCard,
            pix_link: p.linkPix,
          }))
        );
      }

      // Create default flows
      if (company) {
        await supabase.from("flows").insert([
          { company_id: company.id, name: "Boas Vindas", active: true, steps: [{ message: "Olá! Bem-vindo! Como posso ajudar?" }] },
          { company_id: company.id, name: "Vendas", active: true, steps: [{ message: "Quer conhecer nossos produtos?" }] },
        ]);
      }

      toast({ title: "Configuração concluída!", description: "Sua empresa foi cadastrada com sucesso." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="container mx-auto flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hero-gradient">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">AtendIA</span>
          <span className="ml-2 text-sm text-muted-foreground">/ Configuração</span>
        </div>
      </div>

      <div className="border-b border-border bg-card px-6 py-4">
        <div className="container mx-auto flex items-center justify-center gap-2 md:gap-4">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && <div className={`hidden h-px w-8 md:block ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto flex-1 px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">Dados da Empresa</h2>
                    <p className="mt-1 text-muted-foreground">Conte-nos sobre seu negócio</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome da Empresa</Label>
                      <Input placeholder="Ex: Minha Loja" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Segmento</Label>
                      <Select value={segment} onValueChange={setSegment}>
                        <SelectTrigger><SelectValue placeholder="Selecione o segmento" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="services">Serviços</SelectItem>
                          <SelectItem value="health">Saúde</SelectItem>
                          <SelectItem value="education">Educação</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Linguagem da IA</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger><SelectValue placeholder="Tom de voz" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="informal">Informal</SelectItem>
                          <SelectItem value="technical">Técnica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Logo da Empresa</Label>
                      <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50" onClick={() => document.getElementById("logo-upload")?.click()}>
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="h-20 w-20 rounded-xl object-cover" />
                        ) : (
                          <>
                            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Clique para enviar sua logo</span>
                          </>
                        )}
                        <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) { setLogo(file); setLogoPreview(URL.createObjectURL(file)); } }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">Produtos e Serviços</h2>
                    <p className="mt-1 text-muted-foreground">Cadastre o que você vende</p>
                  </div>
                  <div className="space-y-4">
                    {products.map((p, i) => (
                      <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">Produto {i + 1}</span>
                          {products.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input placeholder="Nome" value={p.name} onChange={e => updateProduct(p.id, "name", e.target.value)} />
                          <Input placeholder="Preço (R$)" value={p.price} onChange={e => updateProduct(p.id, "price", e.target.value)} />
                        </div>
                        <Input placeholder="Descrição curta" value={p.description} onChange={e => updateProduct(p.id, "description", e.target.value)} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input placeholder="Link pgto Cartão" value={p.linkCard} onChange={e => updateProduct(p.id, "linkCard", e.target.value)} />
                          <Input placeholder="Link pgto PIX" value={p.linkPix} onChange={e => updateProduct(p.id, "linkPix", e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addProduct} className="w-full"><Plus className="mr-2 h-4 w-4" /> Adicionar Produto</Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">Configuração da IA</h2>
                    <p className="mt-1 text-muted-foreground">Personalize como sua IA atende</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Instruções para a IA</Label><Textarea rows={5} placeholder="Ex: Sempre cumprimente o cliente, ofereça os produtos..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Objeções comuns e respostas</Label><Textarea rows={3} placeholder="Ex: 'É caro' → 'Nosso produto tem o melhor custo-benefício...'" value={objections} onChange={e => setObjections(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Horário de Atendimento</Label><Input placeholder="Ex: Seg-Sex 8h-18h" value={hours} onChange={e => setHours(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Quando escalar para humano</Label><Textarea rows={2} placeholder="Ex: Quando o cliente pedir para falar com um atendente..." value={escalation} onChange={e => setEscalation(e.target.value)} /></div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-foreground">Conectar WhatsApp</h2>
                    <p className="mt-1 text-muted-foreground">Vincule sua conta Meta Business</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Phone Number ID</Label><Input placeholder="Obtido no Meta for Developers" value={phoneNumberId} onChange={e => setPhoneNumberId(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Access Token (permanente)</Label><Input type="password" placeholder="Token do sistema" value={accessToken} onChange={e => setAccessToken(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Verify Token</Label><Input placeholder="String para verificar o webhook" value={verifyToken} onChange={e => setVerifyToken(e.target.value)} /></div>
                    <div className="space-y-2">
                      <Label>URL do Webhook</Label>
                      <Input placeholder="https://seu-webhook.com/endpoint" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
                      <p className="text-xs text-muted-foreground">Copie e cole no Meta for Developers</p>
                    </div>
                    <Button variant="outline" onClick={testConnection} disabled={testing || !phoneNumberId || !accessToken} className="w-full">
                      {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando...</> : testResult === true ? <><CheckCircle2 className="mr-2 h-4 w-4 text-primary" /> Conexão OK!</> : "Testar Conexão"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} className="bg-hero-gradient text-primary-foreground hover:opacity-90">Próximo <ArrowRight className="ml-2 h-4 w-4" /></Button>
            ) : (
              <Button onClick={finish} disabled={saving} className="bg-hero-gradient text-primary-foreground hover:opacity-90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <>Finalizar <CheckCircle2 className="ml-2 h-4 w-4" /></>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
