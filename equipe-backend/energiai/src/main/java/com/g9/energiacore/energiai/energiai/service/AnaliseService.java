package com.g9.energiacore.energiai.energiai.service;

import com.g9.energiacore.energiai.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.energiai.dto.AnaliseResponse;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnaliseService {

    private static final double CUSTO_KWH = 0.75;

    public AnaliseResponse analisar(AnaliseRequest request) {
        AnaliseResponse response = new AnaliseResponse();

        double consumoKwh = request.getConsumoKwh() != null ? request.getConsumoKwh() : 0;
        boolean usoPico = request.getUsoHorarioPico() != null && request.getUsoHorarioPico();
        int quantidadeEquipamentos = request.getQuantidadeEquipamentos() != null ? request.getQuantidadeEquipamentos() : 0;
        String tipoImovel = request.getTipoImovel();
        int horasAltoConsumo = request.getHorasAltoConsumo() != null ? request.getHorasAltoConsumo() : 0;

        // Determina categoria e probabilidade baseado nos critérios
        if (consumoKwh > 400 || (usoPico && horasAltoConsumo > 8)) {
            response.setCategoria("Ineficiente");
            response.setProbabilidade(0.81);
        } else if (consumoKwh > 200 || (horasAltoConsumo > 4 && quantidadeEquipamentos > 5)) {
            response.setCategoria("Moderado");
            response.setProbabilidade(0.65);
        } else {
            response.setCategoria("Eficiente");
            response.setProbabilidade(0.45);
        }

        // Define recomendações baseadas no perfil
        response.setRecomendacoes(gerarRecomendacoes(consumoKwh, usoPico, quantidadeEquipamentos, tipoImovel, horasAltoConsumo));

        // Calcula custo estimado mensal
        double custoEstimado = consumoKwh * CUSTO_KWH;
        response.setCustoEstimadoMensal(Math.round(custoEstimado * 100.0) / 100.0);

        return response;
    }

    private List<String> gerarRecomendacoes(double consumoKwh, boolean usoPico, 
                                            int quantidadeEquipamentos, String tipoImovel, 
                                            int horasAltoConsumo) {
        List<String> recomendacoes = new ArrayList<>();

        if (usoPico) {
            recomendacoes.add("Reduzir o uso de equipamentos durante horários de pico");
        }

        if (consumoKwh > 300) {
            recomendacoes.add("Avaliar aparelhos com alto consumo energético");
        }

        if (horasAltoConsumo > 6) {
            recomendacoes.add("Distribuir atividades de maior consumo ao longo do dia");
        }

        if (quantidadeEquipamentos > 10) {
            recomendacoes.add("Considerar desativar equipamentos não essenciais");
        }

        if ("Comercial".equalsIgnoreCase(tipoImovel)) {
            recomendacoes.add("Revisar horários de operação e climatização");
        } else if ("Residencial".equalsIgnoreCase(tipoImovel)) {
            recomendacoes.add("Instalar iluminação LED em toda a residência");
        }

        if (recomendacoes.isEmpty()) {
            recomendacoes.add("Manter o padrão atual de consumo");
        }

        return recomendacoes;
    }
}
