package com.g9.energiacore.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Mensagem simples de resposta")
public record MessageResponse(
        @Schema(description = "Mensagem descritiva")
        String message
) {}
