import { useMutation } from "@tanstack/react-query";
import { api, AnaliseRequest, AnaliseResponse, analiseRequestSchema, REGIOES, Regiao } from "./api";

export type { AnaliseRequest, AnaliseResponse, Regiao };
export { analiseRequestSchema, api, REGIOES };

export function useAnaliseEnergetica() {
  return useMutation<AnaliseResponse, Error, AnaliseRequest>({
    mutationFn: (payload: AnaliseRequest) => api.realizarAnalise(payload),
  });
}
