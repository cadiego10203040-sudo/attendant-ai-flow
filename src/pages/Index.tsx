import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageSquare, Bot, CreditCard, BarChart3, ArrowRight, CheckCircle2, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Bot,
    title: "IA Personalizada",
    description: "Configure o tom, produtos e regras da sua IA. Ela aprende o seu negócio.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Oficial",
    description: "Conexão direta com a Meta Cloud API. Sem números intermediários.",
  },
  {
    icon: CreditCard,
    title: "Pagamentos no Chat",
    description: "Checkout integrado com Mercado Pago. PIX e cartão direto na conversa.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Completo",
    description: "Métricas em tempo real, conversas ao vivo e gestão de pedidos.",
  },
];

const benefits = [
  "Atendimento 24/7 sem equipe extra",
  "Recuperação automática de carrinho",
  "Escalamento para humano inteligente",
  "Multi-tenant: cada empresa isolada",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">AtendIA</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Recursos</a>
            <a href="#benefits" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Benefícios</a>
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </div>
          <Link to="/signup" className="md:hidden">
            <Button size="sm">Começar</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent opacity-60 blur-3xl" />
        </div>
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Powered by GPT-4o + WhatsApp Cloud API
            </span>
          </motion.div>

          <motion.h1
            className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Seu atendimento no WhatsApp com{" "}
            <span className="text-gradient">Inteligência Artificial</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Configure sua IA, conecte seu número e comece a vender no piloto automático. 
            Atendimento, vendas e pagamentos — tudo pelo WhatsApp.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/signup">
              <Button size="lg" className="bg-hero-gradient text-lg font-semibold text-primary-foreground shadow-glow hover:opacity-90">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="text-lg">
                Ver Recursos
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            className="mb-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
              Tudo que você precisa para vender pelo WhatsApp
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Uma plataforma completa que combina IA, automação e pagamentos.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/20"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-hero-gradient group-hover:text-primary-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="bg-secondary/50 py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                Automatize e escale seu atendimento
              </h2>
              <p className="mt-4 text-muted-foreground">
                Enquanto sua IA atende, você foca no que importa: crescer seu negócio.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((b, i) => (
                  <motion.li
                    key={b}
                    className="flex items-center gap-3 text-foreground"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i + 1}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    {b}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
            >
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-hero-gradient" />
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">AtendIA Bot</p>
                    <p className="text-xs text-muted-foreground">Online agora</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    Oi, quero saber sobre o plano Pro
                  </div>
                  <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
                    Olá! 😊 O Plano Pro inclui atendimento ilimitado, dashboard completo e integração com pagamentos. Quer que eu envie o link de checkout?
                  </div>
                  <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    Sim, por favor! Quero pagar por PIX
                  </div>
                  <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
                    Perfeito! Aqui está seu link PIX: 🔗 pague.me/plano-pro-pix — Assim que o pagamento for confirmado, eu aviso! 🎉
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-accent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            className="mx-auto max-w-3xl rounded-3xl bg-hero-gradient p-10 text-center md:p-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">
              Pronto para revolucionar seu atendimento?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
              Cadastre-se em minutos, configure sua IA e comece a converter mais vendas hoje.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="mt-8 text-lg font-semibold">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-hero-gradient">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-bold text-foreground">AtendIA</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacidade" className="transition-colors hover:text-foreground">Política de Privacidade</Link>
            <span className="hidden sm:inline text-border">|</span>
            <Link to="/termos" className="transition-colors hover:text-foreground">Termos de Uso</Link>
            <span className="hidden sm:inline text-border">|</span>
            <Link to="/exclusao-dados" className="transition-colors hover:text-foreground">Exclusão de Dados</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 AtendIA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
