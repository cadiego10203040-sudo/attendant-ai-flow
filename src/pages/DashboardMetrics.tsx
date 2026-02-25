import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, MessageSquare, ShoppingCart, Clock, Users, AlertTriangle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["hsl(var(--primary))", "#00E5A0", "#FFD93D", "#6C5CE7"];

const DashboardMetrics = () => {
  const { company } = useCompany();
  const [period, setPeriod] = useState("week");
  const [stats, setStats] = useState({ conversations: 0, revenue: 0, conversionRate: 0, abandonedRate: 0, avgResponseTime: "< 3s" });
  const [convData, setConvData] = useState<any[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    if (!company) return;
    const fetchMetrics = async () => {
      const now = new Date();
      let since = new Date();
      if (period === "today") since.setHours(0,0,0,0);
      else if (period === "week") since.setDate(now.getDate() - 7);
      else since.setMonth(now.getMonth() - 1);

      const { count: convCount } = await supabase.from("conversations").select("*", { count: "exact", head: true }).eq("company_id", company.id).gte("created_at", since.toISOString());
      const { data: ordersData } = await supabase.from("orders").select("*").eq("company_id", company.id).gte("created_at", since.toISOString());
      const orders = ordersData || [];
      const paid = orders.filter(o => o.payment_status === "paid");
      const abandoned = orders.filter(o => o.payment_status === "abandoned");
      const revenue = paid.reduce((s, o) => s + (o.amount || 0), 0);

      setStats({
        conversations: convCount || 0,
        revenue,
        conversionRate: (convCount || 0) > 0 ? Math.round((paid.length / (convCount || 1)) * 100) : 0,
        abandonedRate: orders.length > 0 ? Math.round((abandoned.length / orders.length) * 100) : 0,
        avgResponseTime: "< 3s",
      });

      // Pie chart data
      const pix = orders.filter(o => o.payment_method === "pix").length;
      const card = orders.filter(o => o.payment_method === "card").length;
      setPaymentMethods([{ name: "PIX", value: pix }, { name: "Cartão", value: card }]);

      // Sales by product (simplified)
      const { data: products } = await supabase.from("products").select("id, name").eq("company_id", company.id);
      if (products) {
        const byProduct = products.map(p => ({ product: p.name, vendas: paid.filter(o => o.product_id === p.id).length }));
        setSalesByProduct(byProduct);
      }

      // Conversations per day (last 7 days)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString("pt-BR", { weekday: "short" });
        const start = new Date(d); start.setHours(0,0,0,0);
        const end = new Date(d); end.setHours(23,59,59,999);
        const { count } = await supabase.from("conversations").select("*", { count: "exact", head: true }).eq("company_id", company.id).gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
        days.push({ day: dayStr, conversas: count || 0 });
      }
      setConvData(days);
    };
    fetchMetrics();
  }, [company, period]);

  const statCards = [
    { label: "Conversas", value: stats.conversations.toString(), icon: MessageSquare },
    { label: "Receita Total", value: `R$ ${stats.revenue.toFixed(2)}`, icon: ShoppingCart },
    { label: "Taxa Conversão", value: `${stats.conversionRate}%`, icon: TrendingUp },
    { label: "Tempo Médio IA", value: stats.avgResponseTime, icon: Clock },
    { label: "Carrinho Abandonado", value: `${stats.abandonedRate}%`, icon: AlertTriangle },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="font-heading text-2xl font-bold text-foreground">Métricas</h1><p className="text-muted-foreground">Visão geral do seu atendimento</p></div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="today">Hoje</SelectItem><SelectItem value="week">Semana</SelectItem><SelectItem value="month">Mês</SelectItem></SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((s, i) => (
            <motion.div key={s.label} className="rounded-xl border border-border bg-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><s.icon className="h-4 w-4" /></div>
              </div>
              <p className="mt-2 font-heading text-2xl font-bold text-card-foreground">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">Conversas por Dia</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={convData}>
                <defs><linearGradient id="colorConversas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                <Area type="monotone" dataKey="conversas" stroke="hsl(var(--primary))" fill="url(#colorConversas)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">Vendas por Produto</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesByProduct}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="product" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--card-foreground))" }} />
                <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">Formas de Pagamento</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {paymentMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardMetrics;
