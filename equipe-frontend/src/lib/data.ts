import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  AnaliseRequest,
  AnaliseResponse,
  analiseRequestSchema,
  REGIOES,
  Regiao,
  ApiError,
  parseAnaliseResponse,
} from "./api";

export type { AnaliseRequest, AnaliseResponse, Regiao };
export { analiseRequestSchema, api, REGIOES, ApiError, parseAnaliseResponse };

export function useAnaliseEnergetica() {
  return useMutation<AnaliseResponse, Error, AnaliseRequest>({
    mutationFn: (payload: AnaliseRequest) => api.realizarAnalise(payload),
  });
}

export function useConsumos() {
  return useQuery<AnaliseResponse[], Error>({
    queryKey: ["consumos"],
    queryFn: () => api.getConsumos(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useDeleteConsumo() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string | number>({
    mutationFn: (id: string | number) => api.deleteConsumo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumos"] });
    },
  });
}

export function useUpdateConsumo() {
  const queryClient = useQueryClient();
  return useMutation<
    AnaliseResponse,
    Error,
    { id: string | number; payload: Partial<AnaliseRequest> }
  >({
    mutationFn: ({ id, payload }) => api.updateConsumo(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumos"] });
    },
  });
}

export function useContactUs() {
  return useMutation<
    void,
    Error,
    { name: string; email: string; subject: string; message: string }
  >({
    mutationFn: (data) => api.contactUs(data),
  });
}

export function useForgotPassword() {
  return useMutation<void, Error, string>({
    mutationFn: (email: string) => api.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation<void, Error, { token: string; newPassword: string }>({
    mutationFn: ({ token, newPassword }) => api.resetPassword(token, newPassword),
  });
}

export function useVerifyEmail() {
  return useMutation<void, Error, string>({
    mutationFn: (token: string) => api.verifyEmail(token),
  });
}
