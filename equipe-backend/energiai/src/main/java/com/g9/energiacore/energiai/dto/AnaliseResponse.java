package com.g9.energiacore.energiai.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.YearMonth;
import java.util.List;

public record AnaliseResponse(
        @JsonProperty("id")
        Long id,

        @JsonProperty("reference_month")
        @JsonFormat(pattern = "yyyy-MM")
        YearMonth referenceMonth,

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
