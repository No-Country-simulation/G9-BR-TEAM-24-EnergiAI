package com.g9.energiacore.energiai.service;

import com.g9.energiacore.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.dto.AnaliseResponse;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnaliseService {

    private static final double CUSTO_KWH = 0.75;

    public AnaliseResponse analisar(AnaliseRequest request) {
        // Ajustado para usar os assessores do Record (sem o "get")
        double consumoKwh = request.consumoKwh() != null ? request.consumoKwh() : 0;
        boolean usoPico = request.usoHorarioPico() != null && request.usoHorarioPico();
        int quantidadeEquipamentos = request.quantidadeEquipamentos() != null ? request.quantidadeEquipamentos() : 0;
        String tipoImovel = request.tipoImovel();
        int horasAltoConsumo = request.horasAltoConsumo() != null ? request.horasAltoConsumo() : 0;

        String categoria;
        double probabilidade;

        // Lógica de classificação
        if (consumoKwh > 400 || (usoPico && horasAltoConsumo > 8)) {
            categoria = "Ineficiente";
            probabilidade = 0.81;
        } else if (consumoKwh > 200 || (horasAltoConsumo > 4 && quantidadeEquipamentos > 5)) {
            categoria = "Moderado";
            probabilidade = 0.65;
        } else {
            categoria = "Eficiente";
            probabilidade = 0.45;
        }

        List<String> recomendacoes = gerarRecomendacoes(consumoKwh, usoPico, quantidadeEquipamentos, tipoImovel, horasAltoConsumo);

        double custoEstimado = consumoKwh * CUSTO_KWH;
        double custoEstimadoMensal = Math.round(custoEstimado * 100.0) / 100.0;

        // Retorna instanciando o Record AnaliseResponse
        return new AnaliseResponse(categoria, probabilidade, recomendacoes, custoEstimadoMensal);
    }

    private List<String> gerarRecomendacoes(double consumoKwh, boolean usoPico, int quantidadeEquipamentos, String tipoImovel, int horasAltoConsumo) {
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

        if (tipoImovel != null) {
            if ("Comercial".equalsIgnoreCase(tipoImovel)) {
                recomendacoes.add("Revisar horários de operação e climatização");
            } else if ("Residencial".equalsIgnoreCase(tipoImovel)) {
                recomendacoes.add("Instalar iluminação LED em toda a residência");
            }
        }

        if (recomendacoes.isEmpty()) {
            recomendacoes.add("Manter o padrão atual de consumo");
        }

        return recomendacoes;
    }
}
