import { z } from "zod";

export const REGIOES = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"] as const;
export type Regiao = (typeof REGIOES)[number];

export const analiseRequestSchema = z.object({
  consumo_kwh: z.number().positive("Consumo (kWh) deve ser maior que zero"),
  uso_horario_pico: z.boolean(),
  quantidade_equipamentos: z
    .number()
    .min(1, "Quantidade de equipamentos deve ser no mínimo 1"),
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
});

export type AnaliseRequest = z.infer<typeof analiseRequestSchema>;

export interface AnaliseResponse {
  categoria: string;
  probabilidade: number;
  recomendacoes: string[];
  custo_estimado_mensal: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api-beebuzz.nebula-labs.tech";

export const api = {
  async realizarAnalise(payload: AnaliseRequest): Promise<AnaliseResponse> {
    const validated = analiseRequestSchema.parse(payload);

    const res = await fetch(`${API_BASE_URL}/analise-energetica`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validated),
    });

    if (!res.ok) {
      throw new Error(`Erro na API (${res.status}): Falha ao realizar análise energética.`);
    }

    const data = await res.json();

    return {
      categoria: String(data.categoria || ""),
      probabilidade: Number(data.probabilidade ?? 0),
      recomendacoes: Array.isArray(data.recomendacoes) ? data.recomendacoes.map(String) : [],
      custo_estimado_mensal: Number(data.custo_estimado_mensal ?? 0),
    };
  },
};
