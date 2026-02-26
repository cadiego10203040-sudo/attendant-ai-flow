import { Link } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Política de Privacidade</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p><strong className="text-foreground">Última atualização:</strong> Fevereiro de 2026</p>

          <p>A AtendIA ("nós", "nosso") opera a plataforma de atendimento inteligente via WhatsApp. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">1. Dados que Coletamos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-foreground">Dados de cadastro:</strong> nome, e-mail, telefone, nome da empresa.</li>
            <li><strong className="text-foreground">Dados de uso:</strong> logs de acesso, interações com o dashboard, páginas visitadas.</li>
            <li><strong className="text-foreground">Dados de conversas:</strong> mensagens trocadas via WhatsApp entre sua empresa e seus clientes, processadas pela IA.</li>
            <li><strong className="text-foreground">Dados de pagamento:</strong> informações de transações processadas via Mercado Pago (não armazenamos dados de cartão).</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">2. Como Usamos seus Dados</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Prestar e melhorar nossos serviços de atendimento via IA.</li>
            <li>Processar pagamentos e gerenciar pedidos.</li>
            <li>Enviar comunicações sobre sua conta e atualizações do serviço.</li>
            <li>Gerar métricas e relatórios de desempenho.</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">3. Compartilhamento de Dados</h2>
          <p>Seus dados podem ser compartilhados com:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-foreground">Meta (WhatsApp Cloud API):</strong> para envio e recebimento de mensagens.</li>
            <li><strong className="text-foreground">OpenAI:</strong> para processamento de linguagem natural pela IA.</li>
            <li><strong className="text-foreground">Mercado Pago:</strong> para processamento de pagamentos.</li>
          </ul>
          <p>Não vendemos seus dados pessoais a terceiros.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">4. Armazenamento e Segurança</h2>
          <p>Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS) e em repouso. Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou destruição.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">5. Seus Direitos (LGPD)</h2>
          <p>Você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acessar seus dados pessoais.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar a exclusão dos seus dados.</li>
            <li>Revogar consentimento a qualquer momento.</li>
            <li>Solicitar portabilidade dos dados.</li>
          </ul>
          <p>Para exercer seus direitos, entre em contato pelo e-mail: <strong className="text-foreground">privacidade@atendia.com.br</strong></p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">6. Cookies</h2>
          <p>Utilizamos cookies essenciais para funcionamento da plataforma e cookies analíticos para melhorar a experiência. Você pode gerenciar cookies nas configurações do seu navegador.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">7. Alterações nesta Política</h2>
          <p>Podemos atualizar esta política periodicamente. Notificaremos sobre alterações significativas por e-mail ou aviso na plataforma.</p>

          <h2 className="font-heading text-xl font-semibold text-foreground mt-8">8. Contato</h2>
          <p>Para dúvidas sobre privacidade, entre em contato: <strong className="text-foreground">privacidade@atendia.com.br</strong></p>
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

export default PrivacyPolicy;
