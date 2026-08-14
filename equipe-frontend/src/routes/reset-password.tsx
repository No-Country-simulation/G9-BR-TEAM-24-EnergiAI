import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Zap, Lock, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useResetPassword } from "@/lib/data";
import { toast } from "sonner";

const resetPasswordSearchSchema = z.object({
  token: z.string().optional().catch(""),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => resetPasswordSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Redefinir Senha — BeeBuzz" },
      { name: "description", content: "Redefina sua senha de acesso na plataforma BeeBuzz." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/reset-password" });
  const resetPasswordMutation = useResetPassword();

  // Extract token from search params or fallback to URL query string
  const token =
    search?.token ||
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token") || ""
      : "");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token de redefinição inválido ou ausente. Solicite um novo link.");
      return;
    }

    if (password.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem. Digite novamente.");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword: password });
      toast.success("Senha redefinida com sucesso! Faça login com sua nova senha.");
      navigate({ to: "/login" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao redefinir senha. Tente novamente.";
      toast.error(msg);
    }
  };

  return (
    <div className="relative min-h-dvh hero-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Voltar ao Login
          </Link>
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg gradient-primary-bg">
              <Zap className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">BeeBuzz</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-soft">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-2">
                <KeyRound className="size-6" />
              </div>
              <CardTitle className="font-display text-2xl font-bold">Redefinir Senha</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Digite sua nova senha abaixo para atualizar seu acesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {!token && (
                <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-xs text-destructive text-center font-medium">
                  Atenção: Nenhum token de recuperação foi encontrado na URL.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={resetPasswordMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={resetPasswordMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full gradient-primary-bg text-primary-foreground shadow-glow"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Atualizando…
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 size-4" /> Alterar Senha
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
