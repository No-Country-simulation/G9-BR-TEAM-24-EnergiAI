package com.g9.energiacore.energiai.energiai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AnaliseResponse {

    @JsonProperty("categoria")
    private String categoria;

    @JsonProperty("probabilidade")
    private Double probabilidade;

    @JsonProperty("recomendacoes")
    private List<String> recomendacoes;

    @JsonProperty("custo_estimado_mensal")
    private Double custoEstimadoMensal;

    public AnaliseResponse() {}

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Double getProbabilidade() { return probabilidade; }
    public void setProbabilidade(Double probabilidade) { this.probabilidade = probabilidade; }

    public List<String> getRecomendacoes() { return recomendacoes; }
    public void setRecomendacoes(List<String> recomendacoes) { this.recomendacoes = recomendacoes; }

    public Double getCustoEstimadoMensal() { return custoEstimadoMensal; }
    public void setCustoEstimadoMensal(Double custoEstimadoMensal) { this.custoEstimadoMensal = custoEstimadoMensal; }

    @Override
    public String toString() {
        return "AnaliseResponse{" +
                "categoria='" + categoria + '\'' +
                ", probabilidade=" + probabilidade +
                ", recomendacoes=" + recomendacoes +
                ", custoEstimadoMensal=" + custoEstimadoMensal +
                '}';
    }
}




