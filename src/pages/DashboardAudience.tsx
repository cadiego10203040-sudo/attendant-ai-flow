import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, User, MessageSquare, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import { useExternalCompany } from "@/hooks/useExternalCompany";
import { toast } from "@/hooks/use-toast";

type Contact = { phone: string; name: string; totalConversations: number; lastOrderStatus: string; lastContact: string; };

const DashboardAudience = () => {
  const { company } = useCompany();
  const { externalCompanyId } = useExternalCompany();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgPhone, setMsgPhone] = useState("");
  const [msgText, setMsgText] = useState("");

  useEffect(() => {
    if (!externalCompanyId) return;
    const fetchContacts = async () => {
      const { data: convs } = await externalSupabase.from("conversations").select("customer_phone, customer_name, created_at").eq("company_id", externalCompanyId);
      let ordersArr: any[] = [];
      try {
        const { data: orders } = await externalSupabase.from("orders").select("customer_phone, payment_status").eq("company_id", company.id);
        ordersArr = orders || [];
      } catch {}

      const phoneMap = new Map<string, Contact>();
      (convs || []).forEach((c: any) => {
        const existing = phoneMap.get(c.customer_phone);
        if (existing) {
          existing.totalConversations++;
          if (c.created_at > existing.lastContact) existing.lastContact = c.created_at;
        } else {
          phoneMap.set(c.customer_phone, { phone: c.customer_phone, name: c.customer_name || "", totalConversations: 1, lastOrderStatus: "", lastContact: c.created_at });
        }
      });
      (ordersArr).forEach((o: any) => {
        const existing = phoneMap.get(o.customer_phone);
        if (existing) existing.lastOrderStatus = o.payment_status;
      });
      setContacts(Array.from(phoneMap.values()));
      setLoading(false);
    };
    fetchContacts();
  }, [company]);

  const filtered = contacts.filter(c => {
    const matchSearch = (c.name || c.phone).toLowerCase().includes(search.toLowerCase());
    if (filter === "buyers") return matchSearch && c.lastOrderStatus === "paid";
    if (filter === "leads") return matchSearch && c.lastOrderStatus !== "paid";
    if (filter === "inactive") {
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchSearch && new Date(c.lastContact) < thirtyDaysAgo;
    }
    return matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="font-heading text-2xl font-bold text-foreground">🎯 Audiência</h1><p className="text-muted-foreground">{contacts.length} contatos</p></div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="flex gap-1">
            {["all", "buyers", "leads", "inactive"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {f === "all" ? "Todos" : f === "buyers" ? "Compradores" : f === "leads" ? "Leads" : "Inativos"}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border text-left text-sm text-muted-foreground">
              <th className="px-5 py-3 font-medium">Contato</th>
              <th className="px-5 py-3 font-medium">Conversas</th>
              <th className="px-5 py-3 font-medium">Último Pedido</th>
              <th className="px-5 py-3 font-medium">Último Contato</th>
              <th className="px-5 py-3 font-medium">Ações</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Carregando...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Nenhum contato</td></tr> :
              filtered.map(c => (
                <tr key={c.phone} className="border-b border-border last:border-0">
                  <td className="px-5 py-3"><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium text-card-foreground">{c.name || c.phone}</p>{c.name && <p className="text-xs text-muted-foreground">{c.phone}</p>}</div></div></td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{c.totalConversations}</td>
                  <td className="px-5 py-3 text-sm">{c.lastOrderStatus ? (c.lastOrderStatus === "paid" ? "✅ Pago" : c.lastOrderStatus === "pending" ? "⏳ Pendente" : "—") : "—"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(c.lastContact).toLocaleDateString("pt-BR")}</td>
                  <td className="px-5 py-3"><Button variant="outline" size="sm" onClick={() => { setMsgPhone(c.phone); setMsgOpen(true); }}><MessageSquare className="mr-1 h-3 w-3" /> Mensagem</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
          <DialogContent><DialogHeader><DialogTitle>Enviar mensagem para {msgPhone}</DialogTitle></DialogHeader>
            <Textarea rows={4} value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Sua mensagem..." />
            <Button className="w-full" onClick={async () => {
              if (!company || !msgText.trim()) return;
              try {
                const { error } = await supabase.functions.invoke("send-message", {
                  body: { company_id: company.id, phone: msgPhone, message: msgText },
                });
                if (error) throw error;
                toast({ title: "Mensagem enviada!" });
              } catch (err: any) {
                toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
              }
              setMsgOpen(false); setMsgText("");
            }}>Enviar</Button>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAudience;
