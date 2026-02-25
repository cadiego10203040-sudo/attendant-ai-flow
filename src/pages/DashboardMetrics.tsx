import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, MessageSquare, ShoppingCart, Clock, Users, AlertTriangle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";

const stats = [
  { label: "Conversas", value: "147", change: "+12%", icon: MessageSquare },
  { label: "Vendas", value: "R$ 4.230", change: "+8%", icon: ShoppingCart },
  { label: "Taxa Conversão", value: "23%", change: "+3%", icon: TrendingUp },
  { label: "Tempo Médio IA", value: "< 3s", change: "-15%", icon: Clock },
  { label: "Clientes Ativos", value: "89", change: "+5%", icon: Users },
  { label: "Carrinho Abandonado", value: "12%", change: "-2%", icon: AlertTriangle },
];

const conversationData = [
  { day: "Seg", conversas: 32, vendas: 8 },
  { day: "Ter", conversas: 45, vendas: 12 },
  { day: "Qua", conversas: 38, vendas: 9 },
  { day: "Qui", conversas: 52, vendas: 15 },
  { day: "Sex", conversas: 61, vendas: 18 },
  { day: "Sáb", conversas: 28, vendas: 6 },
  { day: "Dom", conversas: 19, vendas: 4 },
];

const salesData = [
  { product: "Plano Pro", vendas: 45 },
  { product: "Starter", vendas: 32 },
  { product: "Consultoria", vendas: 18 },
  { product: "E-book", vendas: 67 },
];

const topProducts = [
  { name: "Plano Pro", sales: 45, revenue: "R$ 8.865" },
  { name: "Plano Starter", sales: 32, revenue: "R$ 3.168" },
  { name: "Consultoria 1h", sales: 18, revenue: "R$ 5.382" },
  { name: "E-book Marketing", sales: 67, revenue: "R$ 2.010" },
];

const topObjections = [
  { objection: "É muito caro", count: 34, pct: "28%" },
  { objection: "Preciso pensar", count: 27, pct: "22%" },
  { objection: "Já uso outra ferramenta", count: 19, pct: "15%" },
  { objection: "Não entendi como funciona", count: 15, pct: "12%" },
  { objection: "Quero falar com humano", count: 12, pct: "10%" },
];

const DashboardMetrics = () => {
  const [period, setPeriod] = useState("week");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Métricas</h1>
            <p className="text-muted-foreground">Visão geral do seu atendimento</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <s.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 font-heading text-2xl font-bold text-card-foreground">{s.value}</p>
              <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
                {s.change}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Conversations chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">Conversas por Dia</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={conversationData}>
                <defs>
                  <linearGradient id="colorConversas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Area type="monotone" dataKey="conversas" stroke="hsl(var(--primary))" fill="url(#colorConversas)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sales chart */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">Vendas por Produto</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="product" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                />
                <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Products */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h3 className="font-heading text-lg font-semibold text-card-foreground">Produtos Mais Vendidos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Produto</th>
                    <th className="px-5 py-3 font-medium">Vendas</th>
                    <th className="px-5 py-3 font-medium">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map(p => (
                    <tr key={p.name} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 text-sm font-medium text-card-foreground">{p.name}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{p.sales}</td>
                      <td className="px-5 py-3 text-sm font-medium text-card-foreground">{p.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Objections */}
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h3 className="font-heading text-lg font-semibold text-card-foreground">Objeções Mais Frequentes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Objeção</th>
                    <th className="px-5 py-3 font-medium">Qtd</th>
                    <th className="px-5 py-3 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {topObjections.map(o => (
                    <tr key={o.objection} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 text-sm font-medium text-card-foreground">{o.objection}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{o.count}</td>
                      <td className="px-5 py-3 text-sm font-medium text-card-foreground">{o.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardMetrics;
