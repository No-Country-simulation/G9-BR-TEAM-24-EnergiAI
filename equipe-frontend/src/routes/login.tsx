import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Zap, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useForgotPassword } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — BeeBuzz" },
      { name: "description", content: "Acesse sua jornada de eficiência energética no BeeBuzz." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPassword();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  // Estado para Modal Esqueci a Senha
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      toast.error("Verifique seu e-mail e senha (mín. 4 caracteres).");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bem-vindo de volta ao BeeBuzz!");
      navigate({ to: "/app/dashboard" });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Falha na autenticação. Verifique e-mail e senha.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync(forgotEmail);
      setForgotSuccess(true);
      toast.success("Instruções enviadas para seu e-mail!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao solicitar recuperação de senha.";
      toast.error(msg);
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
            <span className="font-display text-2xl font-bold">BeeBuzz</span>
          </Link>
          <h1 className="mt-10 font-display text-5xl font-bold tracking-tight">
            Bem-vindo <br /> de volta.
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Continue sua jornada. Sua economia acumulada e diagnósticos de IA te esperam.
          </p>
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
              <span className="font-display text-xl font-bold">BeeBuzz</span>
            </div>
            <h2 className="font-display text-2xl font-bold">Entrar</h2>
            <p className="mt-1 text-sm text-muted-foreground">Acesse sua conta com seu e-mail.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
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

                  {/* Modal de Recuperação de Senha */}
                  <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => {
                          setForgotEmail(email);
                          setForgotSuccess(false);
                        }}
                      >
                        Esqueci a senha
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-display">
                          <KeyRound className="size-5 text-primary" /> Recuperar Senha
                        </DialogTitle>
                        <DialogDescription>
                          Informe seu e-mail cadastrado para receber as instruções de redefinição de
                          senha (POST /auth/forgot-password).
                        </DialogDescription>
                      </DialogHeader>

                      {forgotSuccess ? (
                        <div className="p-4 text-center space-y-3">
                          <div className="mx-auto grid size-12 place-items-center rounded-full bg-success/15 text-success">
                            <CheckCircle2 className="size-6" />
                          </div>
                          <div className="text-sm font-semibold">
                            E-mail de recuperação enviado!
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Verifique sua caixa de entrada e spam.
                          </p>
                          <Button size="sm" onClick={() => setForgotOpen(false)} className="mt-2">
                            Fechar
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="forgot-email">Seu E-mail</Label>
                            <Input
                              id="forgot-email"
                              type="email"
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              placeholder="voce@exemplo.com"
                              required
                              disabled={forgotPasswordMutation.isPending}
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={forgotPasswordMutation.isPending}
                            className="w-full gradient-primary-bg text-primary-foreground"
                          >
                            {forgotPasswordMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 size-4 animate-spin" /> Enviando…
                              </>
                            ) : (
                              "Enviar link de recuperação"
                            )}
                          </Button>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
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
