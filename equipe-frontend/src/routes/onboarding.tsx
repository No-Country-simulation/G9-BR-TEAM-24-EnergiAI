import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Zap, Home, Building2, GraduationCap, Sun, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme, PRESETS, Mode } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { user, update } = useAuth();
  const { preset, set, mode } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(user?.level ?? "Residencial");

  const finish = () => {
    update({ level: profile, onboarded: true });
    navigate({ to: "/app/entries" });
  };

  const steps = [
    {
      title: "Olá! Somos o Buzz 🐝",
      subtitle: "Vamos configurar em 3 passos rápidos.",
      body: (
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="grid size-28 place-items-center rounded-3xl gradient-primary-bg shadow-glow"
          >
            <Zap className="size-14 text-primary-foreground" />
          </motion.div>
          <p className="max-w-md text-center text-muted-foreground">
            Sua ferramenta de análise e diagnóstico de eficiência energética conectada diretamente à
            API Spring Boot.
          </p>
        </div>
      ),
    },
    {
      title: "Qual seu tipo de imóvel?",
      subtitle: "Isso ajuda na identificação dos dados enviados para a API.",
      body: (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { id: "Residencial", label: "Residencial", icon: Home, desc: "Casa ou apartamento" },
            {
              id: "Estudante",
              label: "Estudante",
              icon: GraduationCap,
              desc: "Residência universitária",
            },
            {
              id: "Pequeno negócio",
              label: "Pequeno negócio",
              icon: Building2,
              desc: "Comércio ou escritório",
            },
            { id: "Empresa", label: "Empresa", icon: Sparkles, desc: "Instalação industrial" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setProfile(p.id)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                profile === p.id
                  ? "border-primary bg-primary/5 shadow-glow font-medium"
                  : "border-border hover:border-primary/40",
              )}
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <p.icon className="size-5" />
              </div>
              <div>
                <div className="font-semibold">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Escolha seu tema",
      subtitle: "Você pode mudar a qualquer momento em Configurações.",
      body: (
        <div>
          <div className="mb-4 flex gap-2">
            {[
              { id: "light" as const, label: "Claro", icon: Sun },
              { id: "dark" as const, label: "Escuro", icon: Moon },
              { id: "auto" as const, label: "Auto", icon: Sparkles },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => set({ mode: m.id as Mode })}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm transition",
                  mode === m.id ? "border-primary bg-primary/5 font-medium" : "border-border",
                )}
              >
                <m.icon className="size-4" /> {m.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PRESETS.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => set({ preset: p.id })}
                className={cn(
                  "rounded-2xl border-2 p-3 text-left transition-all",
                  preset === p.id
                    ? "border-primary shadow-glow font-medium"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div className="flex gap-1">
                  {p.swatch.map((c) => (
                    <span
                      key={c}
                      className="size-6 rounded-full ring-1 ring-border"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="mt-2 text-xs font-semibold">{p.label}</div>
              </button>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const s = steps[step];

  return (
    <div className="min-h-dvh hero-bg">
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-10">
        <div className="mb-6 flex items-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")}
            />
          ))}
        </div>
        <div className="glass rounded-3xl p-8 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="font-display text-3xl font-bold">{s.title}</h2>
              <p className="mt-1 text-muted-foreground">{s.subtitle}</p>
              <div className="mt-6">{s.body}</div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep((s) => s - 1))}
            >
              Voltar
            </Button>
            {step < steps.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                className="gradient-primary-bg text-primary-foreground shadow-glow"
              >
                Continuar <ArrowRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button
                onClick={finish}
                className="gradient-primary-bg text-primary-foreground shadow-glow"
              >
                Ir para Solicitação de Análise <ArrowRight className="ml-1 size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
