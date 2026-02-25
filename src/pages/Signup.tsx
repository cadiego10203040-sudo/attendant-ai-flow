import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Verifique seu e-mail para confirmar o cadastro." });
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 items-center justify-center bg-hero-gradient lg:flex">
        <motion.div className="max-w-md px-12 text-primary-foreground" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <MessageSquare className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-4xl font-bold">Comece a vender com IA</h1>
          <p className="mt-4 text-lg text-primary-foreground/80">Em poucos minutos, sua IA estará atendendo clientes pelo WhatsApp.</p>
        </motion.div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" className="mb-10 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">AtendIA</span>
          </Link>

          <h2 className="font-heading text-2xl font-bold text-foreground">Criar conta</h2>
          <p className="mt-2 text-muted-foreground">Cadastre-se para começar</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder="Seu nome" className="pl-10" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="seu@email.com" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-hero-gradient text-primary-foreground hover:opacity-90" size="lg" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...</> : <>Criar Conta <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
