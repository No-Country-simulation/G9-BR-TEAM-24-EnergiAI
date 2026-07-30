import { useMutation } from "@tanstack/react-query";
import { api, AnaliseRequest, AnaliseResponse, analiseRequestSchema } from "./api";

export type { AnaliseRequest, AnaliseResponse };
export { analiseRequestSchema, api };

export function useAnaliseEnergetica() {
  return useMutation<AnaliseResponse, Error, AnaliseRequest>({
    mutationFn: (payload: AnaliseRequest) => api.realizarAnalise(payload),
  });
}
