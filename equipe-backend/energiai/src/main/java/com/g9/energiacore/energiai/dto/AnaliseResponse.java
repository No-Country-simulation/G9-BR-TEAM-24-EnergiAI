package com.g9.energiacore.energiai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record AnaliseResponse(
        @JsonProperty("categoria")
        String categoria,

        @JsonProperty("probabilidade")
        Double probabilidade,

        @JsonProperty("recomendacoes")
        List<String> recomendacoes,

        @JsonProperty("custo_estimado_mensal")
        Double custoEstimadoMensal
) {}




