import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, ArrowRight, TrendingUp, Zap, AlertCircle } from "lucide-react";
import { useConsumos } from "@/lib/data";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export const Route = createFileRoute("/app/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { data: consumos, isLoading, isError, error, refetch } = useConsumos();

  // Prepara os dados invertendo para exibição em ordem cronológica (mês mais antigo -> mês mais recente)
  const chartData = consumos
    ? [...consumos].reverse().map((item) => ({
        mes: item.reference_month || "Ref",
        consumo: item.consumo_kwh || 0,
        custo: item.custo_estimado_mensal || 0,
        categoria: item.categoria || "N/A",
      }))
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Estatísticas e Séries Temporais</h1>
        <p className="text-sm text-muted-foreground">
          Evolução histórica de consumo (kWh) e estimativas mensais (R$) retornadas da API Real (GET /consumos).
        </p>
      </div>

      {/* Skeletons durante carregamento */}
      {isLoading && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tratamento de Erro */}
      {isError && (
        <Card className="border-destructive/30">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="mx-auto size-10 text-destructive" />
            <div className="font-display text-lg font-semibold">
              Erro ao carregar séries temporais
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {error?.message || "Não foi possível buscar os dados de consumo."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo com Gráficos */}
      {!isLoading && !isError && chartData.length > 0 && (
        <div className="space-y-6">
          {/* Gráfico 1: Consumo Elétrico por Mês (kWh) */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                <Zap className="size-5 text-primary" /> Consumo de Energia Elétrica (kWh)
              </CardTitle>
              <CardDescription>
                Comparativo de consumo mensal cadastrado no backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit=" kWh" />
                    <Tooltip
                      formatter={(value: any) => [`${value} kWh`, "Consumo"]}
                      contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "12px" }}
                    />
                    <Legend />
                    <Bar dataKey="consumo" name="Consumo (kWh)" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico 2: Custo Estimado Mensal (R$) */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="size-5 text-accent" /> Custo Estimado Mensal (R$)
              </CardTitle>
              <CardDescription>
                Projeção financeira baseada na análise ONNX.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit=" R$" />
                    <Tooltip
                      formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, "Custo Estimado"]}
                      contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "12px" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="custo"
                      name="Custo (R$)"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado Vazio */}
      {!isLoading && !isError && chartData.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 className="size-8" />
            </div>
            <div className="font-display text-xl font-semibold">
              Sem dados suficientes para gráficos
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Realize a primeira análise mensal para gerar o histórico e liberar as séries temporais.
            </p>
            <div className="pt-2">
              <Button asChild className="gradient-primary-bg text-primary-foreground shadow-glow">
                <Link to="/app/entries">
                  Solicitar Análise <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
