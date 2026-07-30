import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/stats")({
  component: StatsPage,
});

function StatsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Estatísticas e Séries Temporais</h1>
        <p className="text-sm text-muted-foreground">
          Informações sobre dados históricos de consumo.
        </p>
      </div>

      <Card>
        <CardContent className="p-10 text-center space-y-4">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <BarChart3 className="size-8" />
          </div>
          <div className="font-display text-xl font-semibold">
            Recurso de Séries Temporais Indisponível
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            O backend da aplicação opera em modo stateless (POST /analise-energetica). Gráficos de
            evolução temporal e comparativos entre meses serão disponibilizados em evoluções futuras
            com banco de dados.
          </p>
          <div className="pt-2">
            <Button asChild className="gradient-primary-bg text-primary-foreground shadow-glow">
              <Link to="/app/entries">
                Realizar Análise Energética <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
