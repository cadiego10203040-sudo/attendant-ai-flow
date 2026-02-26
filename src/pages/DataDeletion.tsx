import { Link } from "react-router-dom";
import { MessageSquare, ArrowLeft, Trash2, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const DataDeletion = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">AtendIA</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Exclusão de Dados</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>Em conformidade com a LGPD (Lei Geral de Proteção de Dados) e as políticas da Meta, você pode solicitar a exclusão dos seus dados pessoais da plataforma AtendIA a qualquer momento.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">Como Solicitar a Exclusão</h2>

          <div className="grid gap-4 sm:grid-cols-3 my-8">
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <Mail className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-card-foreground mb-1">1. Envie um e-mail</h3>
              <p className="text-xs text-muted-foreground">Envie para <strong className="text-foreground">privacidade@atendia.com.br</strong> com o assunto "Exclusão de Dados"</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <Trash2 className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-card-foreground mb-1">2. Confirmação</h3>
              <p className="text-xs text-muted-foreground">Confirmaremos sua identidade e iniciaremos o processo de exclusão</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <Clock className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-card-foreground mb-1">3. Prazo</h3>
              <p className="text-xs text-muted-foreground">Seus dados serão excluídos em até 15 dias úteis</p>
            </div>
          </div>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">Dados que serão excluídos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dados de cadastro (nome, e-mail, telefone).</li>
            <li>Dados da empresa e configurações.</li>
            <li>Histórico de conversas e mensagens.</li>
            <li>Dados de pedidos e transações.</li>
            <li>Configurações de IA, fluxos e respostas rápidas.</li>
            <li>Labels, broadcasts e dados de audiência.</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">Dados que podem ser retidos</h2>
          <p>Alguns dados poderão ser retidos por obrigação legal, como:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Registros fiscais e de transações financeiras (obrigação tributária).</li>
            <li>Logs de acesso (Marco Civil da Internet — 6 meses).</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">Exclusão via Facebook/Meta</h2>
          <p>Se você conectou sua conta via Facebook Login, também pode solicitar a exclusão dos dados diretamente pela Meta, acessando as configurações de privacidade da sua conta Facebook.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">Contato</h2>
          <p>Para dúvidas sobre exclusão de dados: <strong className="text-foreground">privacidade@atendia.com.br</strong></p>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">© 2026 AtendIA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default DataDeletion;
