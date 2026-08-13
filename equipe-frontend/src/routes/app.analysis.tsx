import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, DollarSign, Target, CheckCircle2, ArrowRight, Zap, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConsumos } from "@/lib/data";

export const Route = createFileRoute("/app/analysis")({
  component: AnalysisPage,
});

function formatProbability(prob: number): string {
  if (typeof prob !== "number" || isNaN(prob)) return "0%";
  const val = prob <= 1 ? prob * 100 : prob;
  return `${val.toFixed(0)}%`;
}

function AnalysisPage() {
  const { data: consumos, isLoading, isError, error, refetch } = useConsumos();

  const analise = consumos && consumos.length > 0 ? consumos[0] : null;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Resultado da Análise</h1>
          <p className="text-sm text-muted-foreground">Erro ao carregar dados do servidor.</p>
        </div>
        <Card className="border-destructive/30">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="mx-auto size-10 text-destructive" />
            <div className="font-display text-lg font-semibold text-foreground">
              Não foi possível obter o resultado da análise
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {error?.message || "Ocorreu uma falha na comunicação com a API."}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analise) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Resultado da Análise</h1>
          <p className="text-sm text-muted-foreground">Nenhuma análise registrada até o momento.</p>
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
              Solicite uma análise energética para visualizar o diagnóstico e as recomendações de IA.
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
            Diagnóstico processado e retornado pela API real em Spring Boot (ONNX).
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
              <Sparkles className="size-5 text-primary" /> Diagnóstico Energético
            </CardTitle>
            <Badge className="rounded-full bg-primary/15 text-foreground hover:bg-primary/15">
              Ref: {analise.reference_month || "Mês Atual"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Categoria */}
            <div className="rounded-2xl border p-4">
              <div className="text-xs text-muted-foreground">categoria</div>
              <div className="mt-1 font-display text-2xl font-bold text-foreground">
                {analise.categoria && analise.categoria !== "N/A"
                  ? analise.categoria
                  : "Residencial"}
              </div>
            </div>

            {/* Probabilidade */}
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="size-3.5 text-accent" /> probabilidade
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-foreground">
                {formatProbability(analise.probabilidade)}
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

      {/* Recomendações */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg font-semibold">
            Recomendações de Economia ({analise.recomendacoes?.length || 0})
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
