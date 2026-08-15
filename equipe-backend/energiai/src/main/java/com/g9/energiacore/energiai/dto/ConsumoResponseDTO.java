package com.g9.energiacore.energiai.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.g9.energiacore.energiai.domain.Consumo;

import java.time.YearMonth;
import java.time.OffsetDateTime;
import java.util.List;

public record ConsumoResponseDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("usuario_id") Long usuarioId,
        @JsonProperty("reference_month") @JsonFormat(pattern = "yyyy-MM") YearMonth referenceMonth,
        @JsonProperty("consumo_kwh") Double consumoKwh,
        @JsonProperty("uso_horario_pico") Boolean usoHorarioPico,
        @JsonProperty("quantidade_equipamentos") Integer quantidadeEquipamentos,
        @JsonProperty("tipo_imovel") String tipoImovel,
        @JsonProperty("horas_alto_consumo") Integer horasAltoConsumo,
        @JsonProperty("quantidade_ar_condicionado") Integer quantidadeArCondicionado,
        @JsonProperty("moradores") Integer moradores,
        @JsonProperty("regiao") Regiao regiao,
        @JsonProperty("categoria") String categoriaIa,
        @JsonProperty("probabilidade") Double probabilidadeIa,
        @JsonProperty("custo_estimado_mensal") Double custoEstimadoMensal,
        @JsonProperty("recomendacoes") List<String> recomendacoes,
        @JsonProperty("created_at") OffsetDateTime createdAt
) {
    public static ConsumoResponseDTO fromEntity(Consumo consumo, List<String> recomendacoes) {
        return new ConsumoResponseDTO(
                consumo.getId(),
                consumo.getUsuarioId(),
                consumo.getReferenceMonth() != null ? YearMonth.from(consumo.getReferenceMonth()) : null,
                consumo.getConsumoKwh(),
                consumo.getUsoHorarioPico(),
                consumo.getQuantidadeEquipamentos(),
                consumo.getTipoImovel(),
                consumo.getHorasAltoConsumo(),
                consumo.getQuantidadeArCondicionado(),
                consumo.getMoradores(),
                consumo.getRegiao(),
                consumo.getCategoriaIa(),
                consumo.getProbabilidadeIa(),
                consumo.getCustoEstimadoMensal(),
                recomendacoes,
                consumo.getCreatedAt()
        );
    }
}
