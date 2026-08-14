import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Zap, Sparkles, TrendingDown, Award, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      if (user) navigate({ to: user.onboarded ? "/app/dashboard" : "/onboarding" });
    }, 1400);
    return () => clearTimeout(t);
  }, [loading, user, navigate]);

  return (
    <div className="relative min-h-dvh hero-bg flex flex-col justify-between overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_20%,var(--primary)/15%,transparent_40%),radial-gradient(circle_at_80%_60%,var(--accent)/15%,transparent_45%)]" />

      <main className="relative mx-auto flex flex-1 w-full max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="mb-8 grid size-24 place-items-center rounded-3xl gradient-primary-bg shadow-glow"
        >
          <Zap className="size-12 text-primary-foreground" strokeWidth={2.5} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-display text-5xl font-bold tracking-tight sm:text-7xl"
        >
          BeeBuzz<span className="text-primary">.</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl"
        >
          Sua jornada gamificada para dominar o consumo de energia. Analise, classifique e
          economize.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {[
            { icon: Sparkles, title: "Analise", text: "Padrões de consumo mês a mês" },
            { icon: Award, title: "Classifique", text: "Descubra seu perfil A–E" },
            { icon: TrendingDown, title: "Economize", text: "Recomendações + impacto em R$" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass rounded-2xl p-5 text-left shadow-soft"
            >
              <f.icon className="size-6 text-primary" />
              <div className="mt-2 font-display font-semibold">{f.title}</div>
              <div className="text-sm text-muted-foreground">{f.text}</div>
            </motion.div>
          ))}
        </motion.div>

        {!loading && !user && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="gradient-primary-bg text-primary-foreground shadow-glow hover:opacity-95"
            >
              <Link to="/signup">Começar grátis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </motion.div>
        )}

        {loading && <div className="mt-10 text-sm text-muted-foreground">Carregando…</div>}
      </main>

      {/* Footer com link de Contato */}
      <footer className="relative border-t bg-background/50 py-4 px-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} BeeBuzz. Todos os direitos reservados.</div>
          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Mail className="size-3.5" /> Fale Conosco / Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
