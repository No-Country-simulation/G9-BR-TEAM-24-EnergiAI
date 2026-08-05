package com.g9.energiacore.energiai.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Região geográfica do imóvel no Brasil", enumAsRef = true)
public enum Regiao {
    NORTE("Norte"),
    NORDESTE("Nordeste"),
    CENTRO_OESTE("Centro-Oeste"),
    SUDESTE("Sudeste"),
    SUL("Sul");

    private final String descricao;

    Regiao(String descricao) {
        this.descricao = descricao;
    }

    @JsonValue
    public String getDescricao() {
        return descricao;
    }

    @JsonCreator
    public static Regiao fromString(String value) {
        if (value == null) {
            return null;
        }
        String cleanValue = value.trim();
        for (Regiao r : Regiao.values()) {
            if (r.descricao.equalsIgnoreCase(cleanValue) || r.name().equalsIgnoreCase(cleanValue)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Região inválida: '" + value + "'. Valores aceitos: Norte, Nordeste, Centro-Oeste, Sudeste, Sul.");
    }
}
