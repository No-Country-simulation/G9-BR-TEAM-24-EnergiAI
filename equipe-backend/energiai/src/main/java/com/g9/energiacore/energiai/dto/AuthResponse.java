package com.g9.energiacore.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta de autenticação com JWT")
public record AuthResponse(
        @Schema(description = "Token JWT para autenticação Bearer")
        String token,

        @Schema(description = "Dados do usuário autenticado")
        UserDTO user
) {}
