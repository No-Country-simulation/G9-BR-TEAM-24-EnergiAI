import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Zap,
  Sparkles,
  ArrowRight,
  DollarSign,
  Target,
  Calendar,
  AlertCircle,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useConsumos,
  useDeleteConsumo,
  useUpdateConsumo,
  analiseRequestSchema,
  AnaliseRequest,
  AnaliseResponse,
  REGIOES,
  Regiao,
} from "@/lib/data";
import { toast } from "sonner";

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

function formatProbability(prob: number): string {
  if (typeof prob !== "number" || isNaN(prob)) return "0%";
  const val = prob <= 1 ? prob * 100 : prob;
  return `${val.toFixed(0)}%`;
}

function Dashboard() {
  const { user } = useAuth();
  const { data: consumos, isLoading, isError, error, refetch } = useConsumos();
  const deleteMutation = useDeleteConsumo();
  const updateMutation = useUpdateConsumo();

  // Estado para exclusão (Delete)
  const [deleteTargetId, setDeleteTargetId] = useState<string | number | null>(null);

  // Estado para edição (Edit Modal com todos os 8 atributos do modelo + referência)
  const [editingItem, setEditingItem] = useState<AnaliseResponse | null>(null);
  const [editConsumo, setEditConsumo] = useState("");
  const [editMonth, setEditMonth] = useState("");
  const [editHorasAltoConsumo, setEditHorasAltoConsumo] = useState("3");
  const [editQtdEquipamentos, setEditQtdEquipamentos] = useState("5");
  const [editTipoImovel, setEditTipoImovel] = useState("Residencial");
  const [editQtdArCondicionado, setEditQtdArCondicionado] = useState("1");
  const [editMoradores, setEditMoradores] = useState("2");
  const [editRegiao, setEditRegiao] = useState<string>("Sudeste");
  const [editUsoHorarioPico, setEditUsoHorarioPico] = useState(false);

  const lastAnalise = consumos && consumos.length > 0 ? consumos[0] : null;

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetId);
      toast.success("Análise de consumo excluída com sucesso!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir consumo.";
      toast.error(msg);
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleOpenEdit = (item: AnaliseResponse) => {
    setEditingItem(item);
    setEditConsumo(String(item.consumo_kwh || ""));
    setEditMonth(item.reference_month || new Date().toISOString().slice(0, 7));
    setEditHorasAltoConsumo(
      String((item as any).horas_alto_consumo ?? (item as any).horasAltoConsumo ?? 3),
    );
    setEditQtdEquipamentos(
      String((item as any).quantidade_equipamentos ?? (item as any).quantidadeEquipamentos ?? 5),
    );
    setEditTipoImovel((item as any).tipo_imovel || (item as any).tipoImovel || "Residencial");
    setEditQtdArCondicionado(
      String(
        (item as any).quantidade_ar_condicionado ?? (item as any).quantidadeArCondicionado ?? 1,
      ),
    );
    setEditMoradores(String((item as any).moradores ?? 2));
    setEditRegiao((item as any).regiao || "Sudeste");
    setEditUsoHorarioPico(
      Boolean((item as any).uso_horario_pico ?? (item as any).usoHorarioPico ?? false),
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.id) return;

    const payload: AnaliseRequest = {
      consumo_kwh: Number(editConsumo),
      uso_horario_pico: editUsoHorarioPico,
      quantidade_equipamentos: Number(editQtdEquipamentos),
      tipo_imovel: editTipoImovel || "Residencial",
      horas_alto_consumo: Number(editHorasAltoConsumo),
      quantidade_ar_condicionado: Number(editQtdArCondicionado),
      moradores: Number(editMoradores),
      regiao: editRegiao as Regiao,
      reference_month: editMonth || new Date().toISOString().slice(0, 7),
    };

    const validation = analiseRequestSchema.safeParse(payload);
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || "Verifique os dados informados.";
      toast.error(firstError);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        payload: validation.data,
      });
      toast.success("Análise de consumo atualizada com sucesso!");
      setEditingItem(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar consumo.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            {greeting()}, {user?.name?.split(" ")[0] || "Usuário"} 👋
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">
            Análise de Eficiência Energética
          </h1>
        </div>

        <Button asChild className="gradient-primary-bg text-primary-foreground shadow-glow">
          <Link to="/app/entries">
            <Zap className="mr-1 size-4" /> Solicitar Análise do Mês
          </Link>
        </Button>
      </div>

      {/* Skeletons */}
      {isLoading && (
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {isError && (
        <Card className="border-destructive/30">
          <CardContent className="p-6 text-center space-y-3">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <div className="font-display text-base font-semibold">
              Falha ao carregar os dados de consumo
            </div>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {error?.message || "Não foi possível conectar ao servidor real."}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Card da Última Análise Processada */}
      {!isLoading && !isError && lastAnalise && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" /> Diagnóstico Recente (GET /consumos)
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="size-3" /> Mês: {lastAnalise.reference_month || "Recente"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-muted-foreground">categoria</div>
                  <div className="mt-1 font-display text-2xl font-bold">
                    {lastAnalise.categoria && lastAnalise.categoria !== "N/A"
                      ? lastAnalise.categoria
                      : "Residencial"}
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="size-3.5 text-accent" /> probabilidade
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">
                    {formatProbability(lastAnalise.probabilidade)}
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

          {/* Histórico Recente de Consumos com CRUD completo */}
          {consumos && consumos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg font-semibold">
                  Histórico de Análises ({consumos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {consumos.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 text-sm transition-colors hover:bg-accent/5"
                  >
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>Mês: {item.reference_month || "N/A"}</span>
                        {idx === 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            Atual
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Consumo: {item.consumo_kwh ? `${item.consumo_kwh} kWh` : "Registrado"}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {item.categoria && item.categoria !== "N/A"
                          ? item.categoria
                          : "Residencial"}
                      </Badge>

                      <div className="font-bold text-primary">
                        R$ {Number(item.custo_estimado_mensal || 0).toFixed(2)}
                      </div>

                      {/* Dropdown Menu de Ações (Editar / Excluir) */}
                      {item.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                              <Pencil className="mr-2 size-4 text-muted-foreground" /> Editar
                              Análise
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTargetId(item.id!)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 size-4" /> Excluir Registro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Estado Vazio */}
      {!isLoading && !isError && (!consumos || consumos.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Zap className="size-6" />
            </div>
            <div className="font-display text-lg font-semibold">Nenhuma análise cadastrada</div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Sua conta ainda não possui análises registradas no servidor real. Preencha o
              formulário para enviar os dados de consumo.
            </p>
            <div className="pt-2">
              <Button asChild className="gradient-primary-bg text-primary-foreground shadow-glow">
                <Link to="/app/entries">
                  Solicitar Primeira Análise <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Confirmação de Exclusão (DELETE) */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(v) => !v && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Excluir Análise de Consumo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação enviará uma requisição DELETE /consumos/{deleteTargetId} para o servidor
              real. Esta operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Excluindo…
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Edição Completo (PUT com os 8 atributos obrigatórios) */}
      <Dialog open={!!editingItem} onOpenChange={(v) => !v && setEditingItem(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Pencil className="size-5 text-primary" /> Editar Análise de Consumo
            </DialogTitle>
            <DialogDescription>
              Atualize os parâmetros completos para re-processamento pelo modelo de IA (PUT
              /consumos/{editingItem?.id}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-consumo">Consumo (kWh)</Label>
                <Input
                  id="edit-consumo"
                  type="number"
                  step="any"
                  value={editConsumo}
                  onChange={(e) => setEditConsumo(e.target.value)}
                  placeholder="Ex: 230"
                  required
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-month">Mês de Referência</Label>
                <Input
                  id="edit-month"
                  type="month"
                  value={editMonth}
                  onChange={(e) => setEditMonth(e.target.value)}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-horas-alto-consumo">Horas de Alto Consumo/dia</Label>
                <Input
                  id="edit-horas-alto-consumo"
                  type="number"
                  value={editHorasAltoConsumo}
                  onChange={(e) => setEditHorasAltoConsumo(e.target.value)}
                  placeholder="Ex: 3"
                  min={0}
                  max={24}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-qtd-equipamentos">Qtd. Equipamentos</Label>
                <Input
                  id="edit-qtd-equipamentos"
                  type="number"
                  value={editQtdEquipamentos}
                  onChange={(e) => setEditQtdEquipamentos(e.target.value)}
                  placeholder="Ex: 5"
                  min={1}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-tipo-imovel">Tipo de Imóvel</Label>
                <Select
                  value={editTipoImovel}
                  onValueChange={setEditTipoImovel}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger id="edit-tipo-imovel">
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
                <Label htmlFor="edit-qtd-ar">Qtd. Ar-Condicionado</Label>
                <Input
                  id="edit-qtd-ar"
                  type="number"
                  value={editQtdArCondicionado}
                  onChange={(e) => setEditQtdArCondicionado(e.target.value)}
                  placeholder="Ex: 1"
                  min={0}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-moradores">Moradores</Label>
                <Input
                  id="edit-moradores"
                  type="number"
                  value={editMoradores}
                  onChange={(e) => setEditMoradores(e.target.value)}
                  placeholder="Ex: 2"
                  min={1}
                  required
                  disabled={updateMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-regiao">Região</Label>
                <Select
                  value={editRegiao}
                  onValueChange={setEditRegiao}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger id="edit-regiao">
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
                <Label htmlFor="edit-uso-horario-pico" className="text-sm font-medium">
                  Uso em Horário de Pico
                </Label>
                <p className="text-xs text-muted-foreground">
                  Indica se há alto uso de equipamentos no horário de pico
                </p>
              </div>
              <Switch
                id="edit-uso-horario-pico"
                checked={editUsoHorarioPico}
                onCheckedChange={setEditUsoHorarioPico}
                disabled={updateMutation.isPending}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="gradient-primary-bg text-primary-foreground"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Salvando…
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
