package com.g9.energiacore.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Payload para confirmação de e-mail por token")
public record VerifyEmailRequest(
        @Schema(description = "Token de confirmação recebido por e-mail", example = "d9b23e12-34f5-4678-8a90-123456789abc")
        @NotBlank(message = "O token de confirmação é obrigatório")
        String token
) {}
