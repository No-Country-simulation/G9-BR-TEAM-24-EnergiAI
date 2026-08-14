import { z } from "zod";

export const REGIOES = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"] as const;
export type Regiao = (typeof REGIOES)[number];

export const analiseRequestSchema = z.object({
  consumo_kwh: z.number().positive("Consumo (kWh) deve ser maior que zero"),
  uso_horario_pico: z.boolean(),
  quantidade_equipamentos: z.number().min(1, "Quantidade de equipamentos deve ser no mínimo 1"),
  tipo_imovel: z.string().min(1, "Informe o tipo de imóvel"),
  horas_alto_consumo: z
    .number()
    .min(0, "Horas deve ser no mínimo 0")
    .max(24, "Horas deve ser no máximo 24"),
  quantidade_ar_condicionado: z
    .number()
    .min(0, "Quantidade de ar-condicionado não pode ser negativa"),
  moradores: z.number().min(1, "Quantidade de moradores deve ser no mínimo 1"),
  regiao: z.enum(REGIOES, {
    errorMap: () => ({ message: "Informe uma região válida" }),
  }),
  reference_month: z.string().optional(),
});

export type AnaliseRequest = z.infer<typeof analiseRequestSchema>;

export interface AnaliseResponse {
  id?: string | number;
  categoria: string;
  probabilidade: number;
  recomendacoes: string[];
  custo_estimado_mensal: number;
  consumo_kwh?: number;
  reference_month?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    level?: string;
    createdAt?: string;
    onboarded?: boolean;
  };
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const TOKEN_KEY = "buzz.token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    if (!endpoint.includes("/auth/login") && !endpoint.includes("/auth/register")) {
      setStoredToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("buzz.user");
        window.dispatchEvent(new CustomEvent("buzz:unauthorized"));
      }
    }
  }

  let data: any = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMsg =
      data?.message ||
      data?.error ||
      `Erro na requisição HTTP (${res.status}): ${res.statusText || "Falha na comunicação"}`;
    throw new ApiError(res.status, errorMsg, data);
  }

  return data;
}

export function parseAnaliseResponse(item: any, fallbackPayload?: AnaliseRequest): AnaliseResponse {
  if (!item) {
    return {
      categoria: "N/A",
      probabilidade: 0,
      recomendacoes: [],
      custo_estimado_mensal: 0,
    };
  }

  const categoria =
    item.categoria || item.category || item.categoriaEnergia || item.perfil || "N/A";

  const probRaw = item.probabilidade ?? item.probability ?? item.precisao ?? item.score;
  const probabilidade = typeof probRaw === "number" ? probRaw : Number(probRaw || 0);

  const custoRaw =
    item.custo_estimado_mensal ??
    item.custoEstimadoMensal ??
    item.custo_estimado ??
    item.custoEstimado ??
    item.custoMensal ??
    item.custo;
  const custo_estimado_mensal = typeof custoRaw === "number" ? custoRaw : Number(custoRaw || 0);

  const recsRaw = item.recomendacoes || item.recommendations || item.dicas;
  const recomendacoes = Array.isArray(recsRaw) ? recsRaw.map(String) : [];

  const consumoRaw =
    item.consumo_kwh ?? item.consumoKwh ?? item.consumo ?? fallbackPayload?.consumo_kwh;
  const consumo_kwh = typeof consumoRaw === "number" ? consumoRaw : Number(consumoRaw || 0);

  const refMonth =
    item.reference_month ||
    item.referenceMonth ||
    item.mesReferencia ||
    item.mes_referencia ||
    fallbackPayload?.reference_month ||
    new Date().toISOString().slice(0, 7);

  return {
    id: item.id || item.analiseId || item.consumoId,
    categoria: String(categoria),
    probabilidade,
    recomendacoes,
    custo_estimado_mensal,
    consumo_kwh,
    reference_month: String(refMonth),
    createdAt: item.createdAt || item.dataAnalise || item.created_at || new Date().toISOString(),
  };
}

export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const data = await fetchWithAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return {
        token: data.token || data.accessToken || "jwt_token_placeholder",
        user: data.user || {
          id: data.userId || String(Date.now()),
          name: data.name || email.split("@")[0],
          email,
          level: data.level || "Residencial",
          createdAt: new Date().toISOString(),
          onboarded: data.onboarded ?? true,
        },
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "Erro ao conectar ao serviço de autenticação.");
    }
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    level: string;
  }): Promise<AuthResponse> {
    try {
      const resData = await fetchWithAuth("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return {
        token: resData.token || resData.accessToken || "jwt_token_placeholder",
        user: resData.user || {
          id: resData.userId || String(Date.now()),
          name: data.name,
          email: data.email,
          level: data.level,
          createdAt: new Date().toISOString(),
          onboarded: false,
        },
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "Erro ao registrar novo usuário.");
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await fetchWithAuth("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await fetchWithAuth("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async verifyEmail(token: string): Promise<void> {
    await fetchWithAuth("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  async contactUs(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await fetchWithAuth("/contact-us", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async realizarAnalise(payload: AnaliseRequest): Promise<AnaliseResponse> {
    const validated = analiseRequestSchema.parse(payload);
    const data = await fetchWithAuth("/analise-energetica", {
      method: "POST",
      body: JSON.stringify(validated),
    });

    return parseAnaliseResponse(data, validated);
  },

  async getConsumos(): Promise<AnaliseResponse[]> {
    const data = await fetchWithAuth("/consumos", {
      method: "GET",
    });

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => parseAnaliseResponse(item));
  },

  async deleteConsumo(id: string | number): Promise<void> {
    await fetchWithAuth(`/consumos/${id}`, {
      method: "DELETE",
    });
  },

  async updateConsumo(
    id: string | number,
    payload: Partial<AnaliseRequest>,
  ): Promise<AnaliseResponse> {
    const data = await fetchWithAuth(`/consumos/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return parseAnaliseResponse(data);
  },
};
