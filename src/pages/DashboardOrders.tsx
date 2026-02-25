import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";

type Order = { id: string; customer_name: string; customer_phone: string; amount: number; payment_method: string; payment_status: string; created_at: string; product_id: string | null; };

const statusMap: Record<string, { label: string; className: string }> = {
  paid: { label: "✅ Pago", className: "bg-green-500/10 text-green-400" },
  pending: { label: "⏳ Pendente", className: "bg-yellow-500/10 text-yellow-400" },
  abandoned: { label: "❌ Abandonado", className: "bg-red-500/10 text-red-400" },
};

const DashboardOrders = () => {
  const { company } = useCompany();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (!company) return;
    const fetchOrders = async () => {
      setLoading(true);
      let query = supabase.from("orders").select("*").eq("company_id", company.id).order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("payment_status", filter);
      if (periodFilter !== "all") {
        const now = new Date();
        if (periodFilter === "today") { now.setHours(0,0,0,0); query = query.gte("created_at", now.toISOString()); }
        else if (periodFilter === "week") { now.setDate(now.getDate() - 7); query = query.gte("created_at", now.toISOString()); }
        else if (periodFilter === "month") { now.setMonth(now.getMonth() - 1); query = query.gte("created_at", now.toISOString()); }
      }
      const { data } = await query;
      const orderData = (data as Order[]) || [];
      setOrders(orderData);
      setTotalRevenue(orderData.filter(o => o.payment_status === "paid").reduce((sum, o) => sum + o.amount, 0));
      setLoading(false);
    };
    fetchOrders();
  }, [company, filter, periodFilter]);

  const exportCSV = () => {
    const headers = ["Cliente", "Telefone", "Valor", "Pagamento", "Status", "Data"];
    const rows = orders.map(o => [o.customer_name, o.customer_phone, o.amount.toFixed(2), o.payment_method, o.payment_status, new Date(o.created_at).toLocaleDateString("pt-BR")]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "pedidos.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground">Receita total: <span className="font-bold text-green-400">R$ {totalRevenue.toFixed(2)}</span></p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="abandoned">Abandonados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Exportar CSV</Button>
          </div>
        </div>

        <motion.div className="rounded-xl border border-border bg-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Telefone</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Pagamento</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Carregando...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">Nenhum pedido encontrado</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">{o.customer_name || "—"}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{o.customer_phone}</td>
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">R$ {o.amount.toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{o.payment_method === "pix" ? "PIX" : "Cartão"}</td>
                    <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMap[o.payment_status]?.className || ""}`}>{statusMap[o.payment_status]?.label || o.payment_status}</span></td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOrders;
