import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, DollarSign, Target, CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnaliseResponse } from "@/lib/data";

export const Route = createFileRoute("/app/analysis")({
  component: AnalysisPage,
});

function AnalysisPage() {
  const [analise, setAnalise] = useState<AnaliseResponse | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("buzz.lastAnalise");
      if (raw) {
        try {
          setAnalise(JSON.parse(raw));
        } catch (err) {
          console.warn("Falha ao ler dados da análise:", err);
        }
      }
    }
  }, []);

  if (!analise) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Resultado da Análise</h1>
          <p className="text-sm text-muted-foreground">Nenhuma análise realizada no momento.</p>
        </div>

        <Card>
          <CardContent className="p-10 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Zap className="size-8" />
            </div>
            <div className="mt-4 font-display text-xl font-semibold">
              Nenhum resultado de análise disponível
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Envie uma requisição para a API (POST /analise-energetica) para visualizar os
              resultados.
            </p>
            <Button
              asChild
              className="mt-6 gradient-primary-bg text-primary-foreground shadow-glow"
            >
              <Link to="/app/entries">
                Realizar Análise Energética <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Resultado da Análise</h1>
          <p className="text-sm text-muted-foreground">
            Dados processados e retornados pelo backend Spring Boot (POST /analise-energetica)
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/app/entries">Nova Análise</Link>
        </Button>
      </div>

      {/* Card principal com Categoria, Probabilidade e Custo Estimado Mensal */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Diagnóstico do Backend
            </CardTitle>
            <Badge className="rounded-full bg-primary/15 text-foreground hover:bg-primary/15">
              API Spring Boot
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Categoria */}
            <div className="rounded-2xl border p-4">
              <div className="text-xs text-muted-foreground">categoria</div>
              <div className="mt-1 font-display text-2xl font-bold text-foreground">
                {analise.categoria || "N/A"}
              </div>
            </div>

            {/* Probabilidade */}
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="size-3.5 text-accent" /> probabilidade
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-foreground">
                {typeof analise.probabilidade === "number"
                  ? `${(analise.probabilidade * (analise.probabilidade <= 1 ? 100 : 1)).toFixed(0)}%`
                  : analise.probabilidade}
              </div>
            </div>

            {/* Custo Estimado Mensal */}
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="size-3.5 text-primary" /> custo_estimado_mensal
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-primary">
                R$ {Number(analise.custo_estimado_mensal || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações (lista de strings retornadas exatamente pelo backend) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg font-semibold">
            recomendacoes ({analise.recomendacoes?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          {analise.recomendacoes && analise.recomendacoes.length > 0 ? (
            <div className="space-y-3">
              {analise.recomendacoes.map((recItem, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border p-4">
                  <CheckCircle2 className="size-5 shrink-0 text-primary mt-0.5" />
                  <div className="text-sm font-medium text-foreground">{recItem}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhuma recomendação retornada.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
