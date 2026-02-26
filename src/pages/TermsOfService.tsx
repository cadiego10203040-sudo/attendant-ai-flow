import { Link } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
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
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Termos de Uso</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p><strong className="text-foreground">Última atualização:</strong> Fevereiro de 2026</p>

          <p>Estes Termos de Uso regulam o acesso e uso da plataforma AtendIA. Ao criar uma conta, você concorda com estes termos.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">1. Definições</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-foreground">Plataforma:</strong> o software AtendIA, incluindo dashboard, APIs e integrações.</li>
            <li><strong className="text-foreground">Usuário:</strong> pessoa física ou jurídica que cria conta e utiliza a plataforma.</li>
            <li><strong className="text-foreground">Cliente Final:</strong> pessoa que interage com o Usuário via WhatsApp.</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">2. Uso da Plataforma</h2>
          <p>O Usuário se compromete a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utilizar a plataforma em conformidade com as leis brasileiras.</li>
            <li>Não enviar spam ou mensagens não solicitadas em massa.</li>
            <li>Respeitar as políticas da Meta para uso do WhatsApp Business.</li>
            <li>Manter suas credenciais de acesso em sigilo.</li>
            <li>Não utilizar a IA para fins ilícitos, discriminatórios ou prejudiciais.</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">3. Responsabilidades do Usuário</h2>
          <p>O Usuário é responsável por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Todo conteúdo gerado e compartilhado através da plataforma.</li>
            <li>Obter consentimento dos clientes finais para uso de dados.</li>
            <li>Configurar corretamente as instruções da IA.</li>
            <li>Cumprir obrigações tributárias sobre vendas realizadas.</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">4. Limitação de Responsabilidade</h2>
          <p>A AtendIA não se responsabiliza por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Respostas incorretas geradas pela IA.</li>
            <li>Indisponibilidade de serviços de terceiros (WhatsApp, OpenAI, Mercado Pago).</li>
            <li>Perdas financeiras decorrentes do uso da plataforma.</li>
            <li>Uso inadequado da plataforma pelo Usuário.</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">5. Pagamentos e Assinatura</h2>
          <p>Os planos e valores serão apresentados na plataforma. O Usuário pode cancelar sua assinatura a qualquer momento, com efeito ao final do período vigente.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">6. Propriedade Intelectual</h2>
          <p>A plataforma AtendIA, incluindo código, design e marca, é propriedade exclusiva da AtendIA. O Usuário mantém a propriedade sobre seus dados e conteúdos.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">7. Rescisão</h2>
          <p>Podemos suspender ou encerrar contas que violem estes termos, com notificação prévia quando possível. O Usuário pode encerrar sua conta a qualquer momento.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">8. Foro</h2>
          <p>Fica eleito o foro da comarca de São Paulo/SP para resolver quaisquer questões relativas a estes Termos.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">9. Contato</h2>
          <p>Para dúvidas sobre estes termos: <strong className="text-foreground">contato@atendia.com.br</strong></p>
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

export default TermsOfService;
