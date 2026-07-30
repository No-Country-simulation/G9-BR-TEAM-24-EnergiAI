import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { PRESETS, useTheme, Mode } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Sun, Moon, Sparkles, LogOut, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const t = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie seu perfil e preferências do aplicativo.
        </p>
      </div>

      {/* Perfil do Usuário */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <User className="size-5 text-primary" /> Perfil do Usuário
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl gradient-primary-bg text-xl font-bold text-primary-foreground">
              {user?.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <div className="text-xs text-muted-foreground">
                Imóvel: {user?.level || "Residencial"}
              </div>
            </div>
          </div>
          <div className="mt-5">
            <Button
              variant="outline"
              onClick={() => {
                logout();
                toast.success("Sessão encerrada");
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-2 size-4" /> Sair da conta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aparência e Modo */}
      <Card>
        <CardContent className="p-5">
          <div className="font-display text-lg font-semibold">Modo de Exibição</div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-sm">
            {[
              { id: "light" as const, label: "Claro", icon: Sun },
              { id: "dark" as const, label: "Escuro", icon: Moon },
              { id: "auto" as const, label: "Auto", icon: Sparkles },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => t.set({ mode: m.id as Mode })}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm transition",
                  t.mode === m.id ? "border-primary bg-primary/5 font-medium" : "border-border",
                )}
              >
                <m.icon className="size-4" /> {m.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Temas de Cores */}
      <Card>
        <CardContent className="p-5">
          <div className="font-display text-lg font-semibold">Temas de Cores</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha o esquema de cores para sua experiência.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => t.set({ preset: p.id })}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition-all",
                  t.preset === p.id
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
                <div className="mt-3 text-sm font-semibold">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferências de Interface */}
      <Card>
        <CardContent className="space-y-6 p-5">
          <div className="font-display text-lg font-semibold">Preferências de Interface</div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Animações e Transições</Label>
              <p className="text-xs text-muted-foreground">
                Ativar transições suaves na navegação.
              </p>
            </div>
            <Switch checked={t.animations} onCheckedChange={(v) => t.set({ animations: v })} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>Escala do Texto</Label>
              <span className="text-xs text-muted-foreground">
                {Math.round(t.fontScale * 100)}%
              </span>
            </div>
            <Slider
              value={[t.fontScale * 100]}
              min={90}
              max={115}
              step={5}
              onValueChange={([v]) => t.set({ fontScale: v / 100 })}
              className="mt-3"
            />
          </div>
          <div>
            <Button
              variant="ghost"
              onClick={() => {
                t.reset();
                toast.success("Preferências restauradas");
              }}
            >
              Restaurar Padrões
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
