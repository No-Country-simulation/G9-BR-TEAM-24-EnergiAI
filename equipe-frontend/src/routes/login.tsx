import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Buzz" },
      { name: "description", content: "Acesse sua jornada de eficiência energética no Buzz." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      toast.error("Verifique seu e-mail e senha (mín. 4 caracteres).");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bem-vindo de volta ao Buzz!");
      navigate({ to: "/app/dashboard" });
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
            Bem-vindo <br /> de volta.
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Continue sua jornada. Sua economia acumulada e conquistas te esperam.
          </p>
          <div className="mt-10 glass rounded-3xl p-6 shadow-soft">
            <div className="text-sm text-muted-foreground">Você economizou</div>
            <div className="mt-1 font-display text-4xl font-bold text-primary">R$ 248,90</div>
            <div className="mt-2 text-sm">nos últimos 3 meses aplicando dicas do Buzz.</div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="glass rounded-3xl p-8 shadow-soft">
            <div className="lg:hidden mb-6 flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl gradient-primary-bg">
                <Zap className="size-4 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Buzz</span>
            </div>
            <h2 className="font-display text-2xl font-bold">Entrar</h2>
            <p className="mt-1 text-sm text-muted-foreground">Bom te ver de novo.</p>

            <Button variant="outline" className="mt-6 w-full" type="button">
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.7h5.2c-.2 1.3-1.6 3.7-5.2 3.7-3.1 0-5.7-2.6-5.7-5.7s2.6-5.7 5.7-5.7c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.7 14.6 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.2-1.6H12z"
                />
              </svg>
              Continuar com Google
            </Button>

            <div className="relative my-6 text-center text-xs text-muted-foreground">
              <span className="bg-card/70 px-3">ou entre com e-mail</span>
              <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => toast.info("Enviamos instruções para o seu e-mail (mock).")}
                  >
                    Esqueci a senha
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} /> Lembrar de
                mim
              </label>
              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary-bg text-primary-foreground shadow-glow hover:opacity-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Entrando…
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Não tem conta?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Criar conta
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
