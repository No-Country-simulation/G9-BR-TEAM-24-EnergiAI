import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Zap, Loader2, AlertTriangle, ArrowRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  useAnaliseEnergetica,
  analiseRequestSchema,
  AnaliseRequest,
  REGIOES,
  Regiao,
  ApiError,
} from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/entries")({
  component: EntriesPage,
});

function getCurrentMonthString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function EntriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const analiseMutation = useAnaliseEnergetica();

  // Estado do formulário
  const [consumoKwh, setConsumoKwh] = useState("");
  const [horasAltoConsumo, setHorasAltoConsumo] = useState("3");
  const [quantidadeEquipamentos, setQuantidadeEquipamentos] = useState("5");
  const [tipoImovel, setTipoImovel] = useState("Residencial");
  const [quantidadeArCondicionado, setQuantidadeArCondicionado] = useState("1");
  const [moradores, setMoradores] = useState("2");
  const [regiao, setRegiao] = useState<string>("Sudeste");
  const [usoHorarioPico, setUsoHorarioPico] = useState(false);
  const [referenceMonth, setReferenceMonth] = useState(getCurrentMonthString());

  // Estado local para conflito 409
  const [conflictError, setConflictError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const payload: AnaliseRequest = {
      consumo_kwh: Number(consumoKwh),
      uso_horario_pico: usoHorarioPico,
      quantidade_equipamentos: Number(quantidadeEquipamentos),
      tipo_imovel: tipoImovel || "Residencial",
      horas_alto_consumo: Number(horasAltoConsumo),
      quantidade_ar_condicionado: Number(quantidadeArCondicionado),
      moradores: Number(moradores),
      regiao: regiao as Regiao,
      reference_month: referenceMonth,
    };

    const validation = analiseRequestSchema.safeParse(payload);
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Verifique os dados informados.";
      toast.error(firstError);
      return;
    }

    try {
      await analiseMutation.mutateAsync(validation.data);
      await queryClient.invalidateQueries({ queryKey: ["consumos"] });

      toast.success("Análise energética realizada e registrada com sucesso!");
      navigate({ to: "/app/analysis" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const msg =
          "Já existe uma análise registrada para este mês de referência. Apenas 1 análise é permitida por mês.";
        setConflictError(msg);
        toast.error("Você já possui uma análise cadastrada para este mês!", {
          description: "Confira o seu Dashboard ou escolha outro mês de referência.",
          duration: 6000,
        });
      } else {
        const errorMsg = err instanceof Error ? err.message : "Erro ao se comunicar com o servidor.";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Solicitar Análise Energética</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados abaixo para receber um diagnóstico personalizado.
        </p>
      </div>

      {conflictError && (
        <Card className="border-destructive/40 bg-destructive/5 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive font-display text-lg flex items-center gap-2">
              <AlertTriangle className="size-5 shrink-0" /> Análise Já Existente neste Mês
            </CardTitle>
            <CardDescription className="text-destructive/90 text-sm">
              {conflictError}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex flex-wrap items-center gap-3">
            <Button asChild size="sm" variant="destructive">
              <Link to="/app/dashboard">
                <History className="mr-1.5 size-4" /> Ver Consumos no Dashboard
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConflictError(null)}>
              Tentar outro mês
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
            <Zap className="size-5 text-primary" /> Dados do Imóvel e Consumo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="consumo_kwh">Consumo (kWh)</Label>
                <Input
                  id="consumo_kwh"
                  type="number"
                  step="any"
                  value={consumoKwh}
                  onChange={(e) => setConsumoKwh(e.target.value)}
                  placeholder="Ex: 230"
                  required
                  disabled={analiseMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_month">Mês de Referência</Label>
                <Input
                  id="reference_month"
                  type="month"
                  value={referenceMonth}
                  onChange={(e) => setReferenceMonth(e.target.value)}
                  required
                  disabled={analiseMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="horas_alto_consumo">Horas de Alto Consumo/dia</Label>
                <Input
                  id="horas_alto_consumo"
                  type="number"
                  value={horasAltoConsumo}
                  onChange={(e) => setHorasAltoConsumo(e.target.value)}
                  placeholder="Ex: 3"
                  min={0}
                  max={24}
                  required
                  disabled={analiseMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_equipamentos">Qtd. Equipamentos</Label>
                <Input
                  id="quantidade_equipamentos"
                  type="number"
                  value={quantidadeEquipamentos}
                  onChange={(e) => setQuantidadeEquipamentos(e.target.value)}
                  placeholder="Ex: 5"
                  min={1}
                  required
                  disabled={analiseMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo_imovel">Tipo de Imóvel</Label>
                <Select
                  value={tipoImovel}
                  onValueChange={setTipoImovel}
                  disabled={analiseMutation.isPending}
                >
                  <SelectTrigger id="tipo_imovel">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residencial">Residencial</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_ar_condicionado">Qtd. Ar-Condicionado</Label>
                <Input
                  id="quantidade_ar_condicionado"
                  type="number"
                  value={quantidadeArCondicionado}
                  onChange={(e) => setQuantidadeArCondicionado(e.target.value)}
                  placeholder="Ex: 1"
                  min={0}
                  required
                  disabled={analiseMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="moradores">Moradores</Label>
                <Input
                  id="moradores"
                  type="number"
                  value={moradores}
                  onChange={(e) => setMoradores(e.target.value)}
                  placeholder="Ex: 2"
                  min={1}
                  required
                  disabled={analiseMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regiao">Região</Label>
                <Select value={regiao} onValueChange={setRegiao} disabled={analiseMutation.isPending}>
                  <SelectTrigger id="regiao">
                    <SelectValue placeholder="Selecione a região..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIOES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="uso_horario_pico" className="text-sm font-medium">
                  Uso em Horário de Pico
                </Label>
                <p className="text-xs text-muted-foreground">
                  Concentração de consumo no horário das 18h às 21h
                </p>
              </div>
              <Switch
                id="uso_horario_pico"
                checked={usoHorarioPico}
                onCheckedChange={setUsoHorarioPico}
                disabled={analiseMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              disabled={analiseMutation.isPending}
              className="w-full gradient-primary-bg text-primary-foreground shadow-glow"
            >
              {analiseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Processando Análise…
                </>
              ) : (
                <>
                  Enviar para Análise <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
