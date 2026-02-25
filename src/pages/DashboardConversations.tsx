import { useState } from "react";
import { motion } from "framer-motion";
import { Search, User, Clock, Bot, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";

const mockConversations = [
  { id: "1", phone: "+55 11 98765-4321", name: "João Silva", lastMessage: "Quero saber sobre o plano Pro", time: "2 min", status: "ai", unread: true },
  { id: "2", phone: "+55 21 91234-5678", name: "Maria Santos", lastMessage: "Pagamento confirmado! 🎉", time: "15 min", status: "ai", unread: false },
  { id: "3", phone: "+55 31 99876-1234", name: "Pedro Oliveira", lastMessage: "Preciso falar com um atendente", time: "1h", status: "human", unread: true },
  { id: "4", phone: "+55 41 97654-3210", name: "Ana Costa", lastMessage: "Obrigada!", time: "3h", status: "ai", unread: false },
];

const mockMessages = [
  { id: "1", role: "customer" as const, text: "Oi, tudo bem? Quero saber sobre o plano Pro", time: "14:30" },
  { id: "2", role: "ai" as const, text: "Olá João! 😊 O Plano Pro inclui atendimento ilimitado, dashboard completo e integração com pagamentos por R$ 197/mês. Quer que eu envie o link de checkout?", time: "14:30" },
  { id: "3", role: "customer" as const, text: "Sim! Quero pagar por PIX", time: "14:32" },
  { id: "4", role: "ai" as const, text: "Perfeito! Aqui está seu link PIX: 🔗 pague.me/plano-pro-pix\n\nAssim que o pagamento for confirmado, eu aviso! 🎉", time: "14:32" },
];

const DashboardConversations = () => {
  const [selectedId, setSelectedId] = useState("1");
  const [search, setSearch] = useState("");

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col lg:flex-row gap-4">
        {/* Conversation List */}
        <div className="w-full lg:w-80 shrink-0 rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="mb-3 font-heading text-lg font-bold text-card-foreground">Conversas</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="max-h-[60vh] overflow-auto">
            {mockConversations.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors ${
                  selectedId === c.id ? "bg-accent" : "hover:bg-muted"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-card-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {c.unread && <div className="h-2 w-2 rounded-full bg-primary" />}
                  {c.status === "ai" ? (
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5 text-warning" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-1 flex-col rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">João Silva</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><Bot className="h-3 w-3" /> IA atendendo</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <UserCheck className="mr-2 h-4 w-4" /> Assumir
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {mockMessages.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex ${m.role === "customer" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "customer"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary text-secondary-foreground"
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <p className={`mt-1 text-[10px] ${m.role === "customer" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {m.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardConversations;
