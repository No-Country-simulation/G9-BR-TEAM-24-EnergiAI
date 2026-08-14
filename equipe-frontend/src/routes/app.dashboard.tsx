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
  Eye,
  Loader2,
  CheckCircle2,
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
import {
  useConsumos,
  useDeleteConsumo,
  useUpdateConsumo,
  AnaliseResponse,
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

  // Estado para edição (Edit Modal)
  const [editingItem, setEditingItem] = useState<AnaliseResponse | null>(null);
  const [editConsumo, setEditConsumo] = useState("");
  const [editMonth, setEditMonth] = useState("");

  // Estado para visualização detalhada do histórico (View Modal)
  const [viewingItem, setViewingItem] = useState<AnaliseResponse | null>(null);

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
    setEditMonth(item.reference_month || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.id) return;

    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        payload: {
          consumo_kwh: Number(editConsumo),
          reference_month: editMonth,
        },
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
                  <Sparkles className="size-5 text-primary" /> Diagnóstico Recente
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="size-3" /> Mês: {lastAnalise.reference_month || "Recente"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-muted-foreground">Categoria de Eficiência</div>
                  <div className="mt-1 font-display text-2xl font-bold">
                    {lastAnalise.categoria && lastAnalise.categoria !== "N/A"
                      ? lastAnalise.categoria
                      : "Residencial"}
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="size-3.5 text-accent" /> Grau de Confiança
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">
                    {formatProbability(lastAnalise.probabilidade)}
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="size-3.5 text-primary" /> Custo Estimado Mensal
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
                        {idx === 0 && <Badge variant="secondary" className="text-[10px]">Atual</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Consumo: {item.consumo_kwh ? `${item.consumo_kwh} kWh` : "Registrado"}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {item.categoria && item.categoria !== "N/A" ? item.categoria : "Residencial"}
                      </Badge>

                      <div className="font-bold text-primary">
                        R$ {Number(item.custo_estimado_mensal || 0).toFixed(2)}
                      </div>

                      {/* Dropdown Menu de Ações (Visualizar / Editar / Excluir) */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingItem(item)}>
                            <Eye className="mr-2 size-4 text-primary" /> Visualizar Diagnóstico
                          </DropdownMenuItem>
                          {item.id && (
                            <>
                              <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                                <Pencil className="mr-2 size-4 text-muted-foreground" /> Editar Análise
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteTargetId(item.id!)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" /> Excluir Registro
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <div className="font-display text-lg font-semibold">
              Nenhuma análise cadastrada
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Sua conta ainda não possui análises registradas no servidor real. Preencha o formulário para enviar os dados de consumo.
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

      {/* Modal de Visualização Detalhada de Diagnóstico de Análise Anterior */}
      <Dialog open={!!viewingItem} onOpenChange={(v) => !v && setViewingItem(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Diagnóstico do Mês: {viewingItem?.reference_month || "N/A"}
            </DialogTitle>
            <DialogDescription>
              Detalhamento completo do resultado e recomendações do perfil energético.
            </DialogDescription>
          </DialogHeader>

          {viewingItem && (
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Categoria de Eficiência</div>
                  <div className="mt-1 font-display text-lg font-bold">
                    {viewingItem.categoria && viewingItem.categoria !== "N/A"
                      ? viewingItem.categoria
                      : "Residencial"}
                  </div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Grau de Confiança</div>
                  <div className="mt-1 font-display text-lg font-bold">
                    {formatProbability(viewingItem.probabilidade)}
                  </div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Custo Estimado Mensal</div>
                  <div className="mt-1 font-display text-lg font-bold text-primary">
                    R$ {Number(viewingItem.custo_estimado_mensal || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-display text-sm font-semibold text-foreground">
                  Recomendações de Economia ({viewingItem.recomendacoes?.length || 0})
                </h4>
                {viewingItem.recomendacoes && viewingItem.recomendacoes.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {viewingItem.recomendacoes.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg border p-3 text-xs">
                        <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
                        <span className="font-medium">{rec}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhuma recomendação registrada para este mês.</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setViewingItem(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão (DELETE) */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(v) => !v && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Excluir Análise de Consumo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente o registro deste mês. A operação não pode ser desfeita.
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

      {/* Modal de Edição (PUT) */}
      <Dialog open={!!editingItem} onOpenChange={(v) => !v && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Pencil className="size-5 text-primary" /> Editar Análise de Consumo
            </DialogTitle>
            <DialogDescription>
              Atualize os valores do registro de consumo para recálculo no sistema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-consumo">Consumo (kWh)</Label>
              <Input
                id="edit-consumo"
                type="number"
                step="any"
                value={editConsumo}
                onChange={(e) => setEditConsumo(e.target.value)}
                required
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-month">Mês de Referência (YYYY-MM)</Label>
              <Input
                id="edit-month"
                type="month"
                value={editMonth}
                onChange={(e) => setEditMonth(e.target.value)}
                required
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
