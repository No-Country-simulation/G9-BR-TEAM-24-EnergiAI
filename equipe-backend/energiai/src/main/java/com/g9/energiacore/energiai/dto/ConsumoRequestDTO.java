package com.g9.energiacore.energiai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Schema(description = "Payload para criação ou atualização de consumo mensal")
public record ConsumoRequestDTO(
        @Schema(description = "Mês de referência da conta de energia (AAAA-MM-DD)", example = "2026-08-01")
        @JsonProperty("reference_month")
        @NotNull
        LocalDate referenceMonth,

        @Schema(description = "Consumo em kWh", example = "350.5")
        @JsonProperty("consumo_kwh")
        @NotNull
        @Min(0)
        Double consumoKwh,

        @Schema(description = "Uso no horário de pico", example = "true")
        @JsonProperty("uso_horario_pico")
        @NotNull
        Boolean usoHorarioPico,

        @Schema(description = "Quantidade de equipamentos", example = "8")
        @JsonProperty("quantidade_equipamentos")
        @NotNull
        @Min(1)
        Integer quantidadeEquipamentos,

        @Schema(description = "Tipo do imóvel", example = "Residencial")
        @JsonProperty("tipo_imovel")
        @NotBlank
        String tipoImovel,

        @Schema(description = "Horas de alto consumo (0-24)", example = "6")
        @JsonProperty("horas_alto_consumo")
        @NotNull
        @Min(0)
        @Max(24)
        Integer horasAltoConsumo,

        @Schema(description = "Quantidade de ar-condicionado", example = "2")
        @JsonProperty("quantidade_ar_condicionado")
        @NotNull
        @Min(0)
        Integer quantidadeArCondicionado,

        @Schema(description = "Número de moradores", example = "4")
        @JsonProperty("moradores")
        @NotNull
        @Min(1)
        Integer moradores,

        @Schema(description = "Região do imóvel", example = "Sudeste")
        @JsonProperty("regiao")
        @NotNull
        Regiao regiao
) {
    public AnaliseRequest toAnaliseRequest() {
        return new AnaliseRequest(
                referenceMonth,
                consumoKwh,
                usoHorarioPico,
                quantidadeEquipamentos,
                tipoImovel,
                horasAltoConsumo,
                quantidadeArCondicionado,
                moradores,
                regiao
        );
    }
}
