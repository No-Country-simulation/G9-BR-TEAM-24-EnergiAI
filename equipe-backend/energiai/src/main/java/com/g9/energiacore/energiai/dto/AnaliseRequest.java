package com.g9.energiacore.energiai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Payload com dados de consumo e características do imóvel para análise energética pelo modelo de IA")
public record AnaliseRequest(
        @Schema(description = "Consumo total de energia elétrica em kWh no mês", example = "350.5")
        @JsonProperty("consumo_kwh")
        @NotNull
        @Min(0)
        Double consumoKwh,

        @Schema(description = "Indica se o uso de energia é concentrado em horário de pico (18h às 21h)", example = "true")
        @JsonProperty("uso_horario_pico")
        @NotNull
        Boolean usoHorarioPico,

        @Schema(description = "Quantidade total de equipamentos eletrônicos na unidade", example = "8")
        @JsonProperty("quantidade_equipamentos")
        @NotNull
        @Min(1)
        Integer quantidadeEquipamentos,

        @Schema(description = "Tipo ou categoria do imóvel (ex: Residencial, Comercial)", example = "Residencial")
        @JsonProperty("tipo_imovel")
        @NotBlank
        String tipoImovel,

        @Schema(description = "Horas diárias estimadas de uso em alto consumo (0 a 24 horas)", example = "6")
        @JsonProperty("horas_alto_consumo")
        @NotNull
        @Min(0)
        @Max(24)
        Integer horasAltoConsumo,

        @Schema(description = "Quantidade de aparelhos de ar-condicionado no imóvel", example = "2")
        @JsonProperty("quantidade_ar_condicionado")
        @NotNull
        @Min(0)
        Integer quantidadeArCondicionado,

        @Schema(description = "Quantidade de moradores residentes no imóvel", example = "4")
        @JsonProperty("moradores")
        @NotNull
        @Min(1)
        Integer moradores,

        @Schema(description = "Região geográfica do imóvel no Brasil (Valores: Norte, Nordeste, Centro-Oeste, Sudeste, Sul)", example = "Sudeste")
        @JsonProperty("regiao")
        @NotNull
        Regiao regiao
) {}
