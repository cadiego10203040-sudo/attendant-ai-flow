import DashboardLayout from "@/components/DashboardLayout";

const DashboardLiveChat = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">👥 Bate Papo ao Vivo</h1>
          <p className="text-muted-foreground">Conversas onde um humano está atendendo</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Use a tela de Conversas e clique em "Assumir" para atender manualmente.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardLiveChat;
