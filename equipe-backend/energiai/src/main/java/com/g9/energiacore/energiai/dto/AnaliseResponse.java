package com.g9.energiacore.energiai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;

public record AnaliseResponse(
        @JsonProperty("id")
        Long id,

        @JsonProperty("reference_month")
        LocalDate referenceMonth,

        @JsonProperty("categoria")
        String categoria,

        @JsonProperty("probabilidade")
        Double probabilidade,

        @JsonProperty("recomendacoes")
        List<String> recomendacoes,

        @JsonProperty("custo_estimado_mensal")
        Double custoEstimadoMensal
) {
    public AnaliseResponse(String categoria, Double probabilidade, List<String> recomendacoes, Double custoEstimadoMensal) {
        this(null, null, categoria, probabilidade, recomendacoes, custoEstimadoMensal);
    }
}
