import { useState } from "react";
import { motion } from "framer-motion";
import { Save, RefreshCw, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";

type Product = { id: string; name: string; description: string; price: string; linkCard: string; linkPix: string };

const DashboardSettings = () => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "Plano Pro", description: "Plano completo", price: "197", linkCard: "https://...", linkPix: "https://..." },
    { id: "2", name: "E-book Marketing", description: "Guia completo", price: "29.90", linkCard: "https://...", linkPix: "https://..." },
  ]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
  };

  const addProduct = () => {
    setProducts(p => [...p, { id: crypto.randomUUID(), name: "", description: "", price: "", linkCard: "", linkPix: "" }]);
  };

  const removeProduct = (id: string) => {
    setProducts(p => p.filter(x => x.id !== id));
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x));
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
            <TabsTrigger value="products">Produtos</TabsTrigger>
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
                <Select defaultValue="ecommerce">
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select defaultValue="informal">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                    <SelectItem value="technical">Técnica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="products">
            <motion.div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {products.map((p, i) => (
                <div key={p.id} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Produto {i + 1}</span>
                    {products.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeProduct(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
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
              <Button variant="outline" onClick={addProduct} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
              </Button>
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
              <div className="space-y-2">
                <Label>Quando escalar para humano</Label>
                <Textarea rows={2} defaultValue="Quando o cliente pedir para falar com um atendente humano ou quando a IA não souber responder." />
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
              <div className="space-y-2">
                <Label>Verify Token</Label>
                <Input defaultValue="meu_verify_token" />
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
