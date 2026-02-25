import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";

const mockOrders = [
  { id: "PED-001", customer: "+55 11 98765-4321", product: "Plano Pro", value: "R$ 197,00", status: "paid" as const, date: "25/02/2026" },
  { id: "PED-002", customer: "+55 21 91234-5678", product: "E-book Marketing", value: "R$ 29,90", status: "paid" as const, date: "25/02/2026" },
  { id: "PED-003", customer: "+55 31 99876-1234", product: "Consultoria 1h", value: "R$ 299,00", status: "pending" as const, date: "25/02/2026" },
  { id: "PED-004", customer: "+55 41 97654-3210", product: "Plano Starter", value: "R$ 97,00", status: "abandoned" as const, date: "24/02/2026" },
  { id: "PED-005", customer: "+55 51 93456-7890", product: "Plano Pro", value: "R$ 197,00", status: "paid" as const, date: "24/02/2026" },
];

const statusMap = {
  paid: { label: "Pago", className: "bg-accent text-primary" },
  pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
  abandoned: { label: "Abandonado", className: "bg-destructive/10 text-destructive" },
};

const DashboardOrders = () => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? mockOrders : mockOrders.filter(o => o.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Pedidos</h1>
            <p className="text-muted-foreground">Gerencie seus pedidos</p>
          </div>
          <div className="flex gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="abandoned">Abandonados</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
          </div>
        </div>

        <motion.div
          className="rounded-xl border border-border bg-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Pedido</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Produto</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">{o.id}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{o.customer}</td>
                    <td className="px-5 py-3 text-sm text-card-foreground">{o.product}</td>
                    <td className="px-5 py-3 text-sm font-medium text-card-foreground">{o.value}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMap[o.status].className}`}>
                        {statusMap[o.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{o.date}</td>
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
