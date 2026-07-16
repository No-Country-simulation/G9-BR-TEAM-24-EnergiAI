package com.g9.energiacore.energiai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AnaliseRequest(
        @JsonProperty("consumo_kwh")
        @NotNull
        @Min(0)
        Double consumoKwh,

        @JsonProperty("uso_horario_pico")
        @NotNull
        Boolean usoHorarioPico,

        @JsonProperty("quantidade_equipamentos")
        @NotNull
        @Min(1)
        Integer quantidadeEquipamentos,

        @JsonProperty("tipo_imovel")
        @NotNull
        String tipoImovel,

        @JsonProperty("horas_alto_consumo")
        @NotNull
        @Min(0)
        Integer horasAltoConsumo
) {}


