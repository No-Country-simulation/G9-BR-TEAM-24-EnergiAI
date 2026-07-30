import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Loader2, AlertCircle, ArrowRight } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnaliseEnergetica, analiseRequestSchema, AnaliseRequest } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/app/entries")({
  component: EntriesPage,
});

function EntriesPage() {
  const navigate = useNavigate();
  const analiseMutation = useAnaliseEnergetica();

  // Estado do formulário correspondente exatamente ao AnaliseRequest
  const [consumoKwh, setConsumoKwh] = useState("");
  const [horasAltoConsumo, setHorasAltoConsumo] = useState("3");
  const [quantidadeEquipamentos, setQuantidadeEquipamentos] = useState("5");
  const [tipoImovel, setTipoImovel] = useState("Residencial");
  const [usoHorarioPico, setUsoHorarioPico] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: AnaliseRequest = {
      consumo_kwh: Number(consumoKwh),
      uso_horario_pico: usoHorarioPico,
      quantidade_equipamentos: Number(quantidadeEquipamentos),
      tipo_imovel: tipoImovel || "Residencial",
      horas_alto_consumo: Number(horasAltoConsumo),
    };

    const validation = analiseRequestSchema.safeParse(payload);
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Verifique os dados informados.";
      toast.error(firstError);
      return;
    }

    try {
      const response = await analiseMutation.mutateAsync(validation.data);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("buzz.lastAnalise", JSON.stringify(response));
        sessionStorage.setItem("buzz.lastPayload", JSON.stringify(validation.data));
      }
      toast.success("Análise energética realizada com sucesso!");
      navigate({ to: "/app/analysis" });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao se comunicar com a API.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Solicitar Análise Energética</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados abaixo para enviar para processamento no backend.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold flex items-center gap-2">
            <Zap className="size-5 text-primary" /> Dados da Análise (AnaliseRequest)
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
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantidade_equipamentos">Qtd. Equipamentos</Label>
                <Input
                  id="quantidade_equipamentos"
                  type="number"
                  value={quantidadeEquipamentos}
                  onChange={(e) => setQuantidadeEquipamentos(e.target.value)}
                  placeholder="Ex: 5"
                  min={0}
                  required
                  disabled={analiseMutation.isPending}
                />
              </div>

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
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="uso_horario_pico" className="text-sm font-medium">
                  Uso em Horário de Pico
                </Label>
                <p className="text-xs text-muted-foreground">
                  Indica se há alto uso de equipamentos no horário de pico
                </p>
              </div>
              <Switch
                id="uso_horario_pico"
                checked={usoHorarioPico}
                onCheckedChange={setUsoHorarioPico}
                disabled={analiseMutation.isPending}
              />
            </div>

            {analiseMutation.isError && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>
                  {analiseMutation.error?.message || "Ocorreu um erro ao enviar a análise."}
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={analiseMutation.isPending}
              className="w-full gradient-primary-bg text-primary-foreground shadow-glow"
            >
              {analiseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Enviando para a API…
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
