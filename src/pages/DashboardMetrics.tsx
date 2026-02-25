import { motion } from "framer-motion";
import { TrendingUp, MessageSquare, ShoppingCart, Clock, Users, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const stats = [
  { label: "Conversas Hoje", value: "147", change: "+12%", icon: MessageSquare },
  { label: "Vendas Hoje", value: "R$ 4.230", change: "+8%", icon: ShoppingCart },
  { label: "Taxa Conversão", value: "23%", change: "+3%", icon: TrendingUp },
  { label: "Tempo Médio IA", value: "< 3s", change: "-15%", icon: Clock },
  { label: "Clientes Ativos", value: "89", change: "+5%", icon: Users },
  { label: "Carrinho Abandonado", value: "12%", change: "-2%", icon: AlertTriangle },
];

const topProducts = [
  { name: "Plano Pro", sales: 45, revenue: "R$ 8.865" },
  { name: "Plano Starter", sales: 32, revenue: "R$ 3.168" },
  { name: "Consultoria 1h", sales: 18, revenue: "R$ 5.382" },
  { name: "E-book Marketing", sales: 67, revenue: "R$ 2.010" },
];

const DashboardMetrics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Métricas</h1>
          <p className="text-muted-foreground">Visão geral do seu atendimento</p>
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
      </div>
    </DashboardLayout>
  );
};

export default DashboardMetrics;
