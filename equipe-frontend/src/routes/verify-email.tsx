import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Zap, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";

const verifyEmailSearchSchema = z.object({
  token: z.string().optional().catch(""),
});

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search) => verifyEmailSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Verificação de E-mail — BeeBuzz" },
      {
        name: "description",
        content: "Confirme seu endereço de e-mail para ativar sua conta no BeeBuzz.",
      },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const search = useSearch({ from: "/verify-email" });
  const token =
    search?.token ||
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token") || ""
      : "");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Token de verificação inválido ou ausente.");
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        await api.verifyEmail(token);
        if (isMounted) {
          setStatus("success");
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Não foi possível verificar seu e-mail. O link pode ter expirado.",
          );
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="relative min-h-dvh hero-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Ir para Login
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
              <CardTitle className="font-display text-2xl font-bold">
                Verificação de E-mail
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Ativação de conta de usuário na plataforma BeeBuzz
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-center">
              {status === "loading" && (
                <div className="space-y-4 py-8">
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Loader2 className="size-8 animate-spin" />
                  </div>
                  <h3 className="font-display text-xl font-semibold">Verificando seu e-mail…</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Aguarde um momento enquanto confirmamos seu token de ativação com o servidor.
                  </p>
                </div>
              )}

              {status === "success" && (
                <div className="space-y-4 py-6">
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 text-success">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">
                    E-mail verificado com sucesso!
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Sua conta foi ativada. Agora você já pode fazer login para acessar todas as
                    funcionalidades.
                  </p>
                  <div className="pt-2">
                    <Button
                      asChild
                      className="w-full gradient-primary-bg text-primary-foreground shadow-glow"
                    >
                      <Link to="/login">Fazer Login</Link>
                    </Button>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="space-y-4 py-6">
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-destructive/15 text-destructive">
                    <AlertCircle className="size-8" />
                  </div>
                  <h3 className="font-display text-xl font-bold">Falha na verificação</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {errorMessage ||
                      "Não foi possível confirmar seu e-mail. O link pode ter expirado ou ser inválido."}
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <Button asChild className="w-full gradient-primary-bg text-primary-foreground">
                      <Link to="/login">Ir para Login</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
