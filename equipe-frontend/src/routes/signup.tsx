import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Zap, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — Buzz" },
      {
        name: "description",
        content: "Crie sua conta no Buzz e comece a economizar energia hoje.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [level, setLevel] = useState("Residencial");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Informe seu nome completo.");
    if (!email.includes("@")) return toast.error("E-mail inválido.");
    if (password.length < 6) return toast.error("Senha precisa de pelo menos 6 caracteres.");
    if (password !== confirm) return toast.error("As senhas não coincidem.");
    if (!terms) return toast.error("Aceite os termos para continuar.");
    setLoading(true);
    try {
      await signup({ name, email, password, level });
      toast.success("Conta criada! Vamos te conhecer melhor.");
      navigate({ to: "/onboarding" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar conta. Verifique os dados.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh hero-bg">
      <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 items-center gap-8 px-6 py-12 lg:grid-cols-2">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-xl gradient-primary-bg">
              <Zap className="size-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">Buzz</span>
          </Link>
          <h1 className="mt-10 font-display text-5xl font-bold tracking-tight">
            Comece <br /> sua economia.
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Grátis para sempre. Sem cartão. Personalizado do primeiro clique.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Análise mensal automática",
              "Perfil de eficiência A–E",
              "Recomendações com impacto em R$",
              "Conquistas e níveis",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-success text-success-foreground">
                  <Check className="size-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8 shadow-soft">
            <h2 className="font-display text-2xl font-bold">Criar conta</h2>
            <p className="mt-1 text-sm text-muted-foreground">Preencha os campos para começar.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ana Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ana@exemplo.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Perfil de uso</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residencial">Residencial</SelectItem>
                    <SelectItem value="Estudante">Estudante</SelectItem>
                    <SelectItem value="Pequeno negócio">Pequeno negócio</SelectItem>
                    <SelectItem value="Empresa">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={terms}
                  onCheckedChange={(v) => setTerms(!!v)}
                  className="mt-0.5"
                />
                <span>
                  Aceito os termos de uso e política de privacidade.
                </span>
              </label>
              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary-bg text-primary-foreground shadow-glow hover:opacity-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Criando…
                  </>
                ) : (
                  "Criar conta grátis"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
