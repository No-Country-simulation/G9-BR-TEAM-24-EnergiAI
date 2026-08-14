import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Mode = "light" | "dark" | "auto";
export type ThemePreset =
  | "clean-student"
  | "dark-focus"
  | "neon-tech"
  | "minimal-white"
  | "purple-productivity"
  | "blue-focus"
  | "retro-study"
  | "cozy-night";

export interface ThemeState {
  mode: Mode;
  preset: ThemePreset;
  density: "comfortable" | "compact";
  animations: boolean;
  fontScale: number; // 0.9 - 1.15
}

const DEFAULT: ThemeState = {
  mode: "auto",
  preset: "clean-student",
  density: "comfortable",
  animations: true,
  fontScale: 1,
};

const KEY = "buzz.theme";

interface ThemeCtx extends ThemeState {
  set: (patch: Partial<ThemeState>) => void;
  reset: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export const PRESETS: {
  id: ThemePreset;
  label: string;
  description: string;
  vars: Record<string, string>;
  swatch: string[];
}[] = [
  {
    id: "clean-student",
    label: "Clean Student",
    description: "Amarelo mel + azul suave. O padrão do BeeBuzz.",
    swatch: ["#FFD24C", "#7CB0FF", "#F8FAFC"],
    vars: {
      "--primary": "oklch(0.82 0.17 82)",
      "--accent": "oklch(0.72 0.18 255)",
    },
  },
  {
    id: "dark-focus",
    label: "Dark Focus",
    description: "Escuro elegante para foco profundo.",
    swatch: ["#FFC94A", "#8AB4FF", "#0F172A"],
    vars: {
      "--primary": "oklch(0.82 0.17 82)",
      "--accent": "oklch(0.72 0.18 250)",
    },
  },
  {
    id: "neon-tech",
    label: "Neon Tech",
    description: "Verde neon + magenta. Vibe tech.",
    swatch: ["#B4FF3A", "#FF4FD8", "#0B0F1A"],
    vars: {
      "--primary": "oklch(0.86 0.22 135)",
      "--accent": "oklch(0.72 0.29 330)",
    },
  },
  {
    id: "minimal-white",
    label: "Minimal White",
    description: "Preto e branco, mínimo absoluto.",
    swatch: ["#111111", "#666666", "#FFFFFF"],
    vars: {
      "--primary": "oklch(0.25 0 0)",
      "--accent": "oklch(0.55 0 0)",
    },
  },
  {
    id: "purple-productivity",
    label: "Purple Productivity",
    description: "Violeta profundo, foco premium.",
    swatch: ["#A78BFA", "#F0ABFC", "#1E1B4B"],
    vars: {
      "--primary": "oklch(0.7 0.2 300)",
      "--accent": "oklch(0.78 0.18 330)",
    },
  },
  {
    id: "blue-focus",
    label: "Blue Focus",
    description: "Azul profissional e calmo.",
    swatch: ["#3B82F6", "#22D3EE", "#EFF6FF"],
    vars: {
      "--primary": "oklch(0.65 0.2 255)",
      "--accent": "oklch(0.78 0.14 210)",
    },
  },
  {
    id: "retro-study",
    label: "Retro Study",
    description: "Tons quentes, papel e mel.",
    swatch: ["#E07A5F", "#F2CC8F", "#FFF8EF"],
    vars: {
      "--primary": "oklch(0.7 0.15 45)",
      "--accent": "oklch(0.82 0.13 85)",
    },
  },
  {
    id: "cozy-night",
    label: "Cozy Night",
    description: "Noite aconchegante em tons quentes.",
    swatch: ["#F59E0B", "#F472B6", "#1C1917"],
    vars: {
      "--primary": "oklch(0.78 0.17 65)",
      "--accent": "oklch(0.72 0.2 350)",
    },
  },
];

function applyTheme(state: ThemeState) {
  const root = document.documentElement;
  // mode
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark =
    state.mode === "dark" ||
    (state.mode === "auto" && prefersDark) ||
    state.preset === "dark-focus" ||
    state.preset === "neon-tech" ||
    state.preset === "purple-productivity" ||
    state.preset === "cozy-night";
  root.classList.toggle("dark", isDark);

  const preset = PRESETS.find((p) => p.id === state.preset) ?? PRESETS[0];
  Object.entries(preset.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.setProperty("--ring", preset.vars["--primary"] ?? "");
  root.style.fontSize = `${state.fontScale * 100}%`;
  root.dataset.density = state.density;
  root.dataset.animations = state.animations ? "on" : "off";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT, ...JSON.parse(raw) });
    } catch (err) {
      console.warn("Falha ao ler tema do localStorage:", err);
    }
  }, []);

  useEffect(() => {
    applyTheme(state);
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  return (
    <Ctx.Provider
      value={{
        ...state,
        set: (patch) => setState((s) => ({ ...s, ...patch })),
        reset: () => setState(DEFAULT),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
