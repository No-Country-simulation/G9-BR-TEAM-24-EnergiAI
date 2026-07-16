package com.g9.energiacore.energiai.energiai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AnaliseRequest {

    @JsonProperty("consumo_kwh")
    @NotNull
    @Min(0)
    private Double consumoKwh;

    @JsonProperty("uso_horario_pico")
    @NotNull
    private Boolean usoHorarioPico;

    @JsonProperty("quantidade_equipamentos")
    @NotNull
    @Min(1)
    private Integer quantidadeEquipamentos;

    @JsonProperty("tipo_imovel")
    @NotNull
    private String tipoImovel;

    @JsonProperty("horas_alto_consumo")
    @NotNull
    @Min(0)
    private Integer horasAltoConsumo;

    public AnaliseRequest() {}

    public Double getConsumoKwh() { return consumoKwh; }
    public void setConsumoKwh(Double consumoKwh) { this.consumoKwh = consumoKwh; }

    public Boolean getUsoHorarioPico() { return usoHorarioPico; }
    public void setUsoHorarioPico(Boolean usoHorarioPico) { this.usoHorarioPico = usoHorarioPico; }

    public Integer getQuantidadeEquipamentos() { return quantidadeEquipamentos; }
    public void setQuantidadeEquipamentos(Integer quantidadeEquipamentos) { this.quantidadeEquipamentos = quantidadeEquipamentos; }

    public String getTipoImovel() { return tipoImovel; }
    public void setTipoImovel(String tipoImovel) { this.tipoImovel = tipoImovel; }

    public Integer getHorasAltoConsumo() { return horasAltoConsumo; }
    public void setHorasAltoConsumo(Integer horasAltoConsumo) { this.horasAltoConsumo = horasAltoConsumo; }

    @Override
    public String toString() {
        return "AnaliseRequest{" +
                "consumoKwh=" + consumoKwh +
                ", usoHorarioPico=" + usoHorarioPico +
                ", quantidadeEquipamentos=" + quantidadeEquipamentos +
                ", tipoImovel='" + tipoImovel + '\'' +
                ", horasAltoConsumo=" + horasAltoConsumo +
                '}';
    }
}


