import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap, Sparkles, ArrowRight, DollarSign, Target } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnaliseResponse } from "@/lib/data";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function Dashboard() {
  const { user } = useAuth();
  const [lastAnalise, setLastAnalise] = useState<AnaliseResponse | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("buzz.lastAnalise");
      if (raw) {
        try {
          setLastAnalise(JSON.parse(raw));
        } catch (err) {
          console.warn("Falha ao ler dados da última análise:", err);
        }
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            {greeting()}, {user?.name.split(" ")[0] || "Usuário"} 👋
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
            Análise de Eficiência Energética
          </h1>
        </div>

        <Button asChild className="gradient-primary-bg text-primary-foreground shadow-glow">
          <Link to="/app/entries">
            <Zap className="mr-1 size-4" /> Solicitar Análise (POST /analise-energetica)
          </Link>
        </Button>
      </div>

      {/* Card da Última Análise Processada */}
      {lastAnalise ? (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> Último Diagnóstico Recebido
              </CardTitle>
              <Badge variant="outline">POST /analise-energetica</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-4">
                <div className="text-xs text-muted-foreground">categoria</div>
                <div className="mt-1 font-display text-2xl font-bold">
                  {lastAnalise.categoria || "N/A"}
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="size-3.5 text-accent" /> probabilidade
                </div>
                <div className="mt-1 font-display text-2xl font-bold">
                  {typeof lastAnalise.probabilidade === "number"
                    ? `${(lastAnalise.probabilidade * (lastAnalise.probabilidade <= 1 ? 100 : 1)).toFixed(0)}%`
                    : lastAnalise.probabilidade}
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="size-3.5 text-primary" /> custo_estimado_mensal
                </div>
                <div className="mt-1 font-display text-2xl font-bold text-primary">
                  R$ {Number(lastAnalise.custo_estimado_mensal || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link to="/app/analysis">
                  Ver Recomendações Completas <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Zap className="size-6" />
            </div>
            <div className="font-display text-lg font-semibold">
              Nenhuma análise solicitada nesta sessão
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              O backend é stateless e processa requisições instantâneas. Preencha o formulário para
              enviar os dados.
            </p>
            <div className="pt-2">
              <Button asChild className="gradient-primary-bg text-primary-foreground shadow-glow">
                <Link to="/app/entries">
                  Preencher Formulário de Análise <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
