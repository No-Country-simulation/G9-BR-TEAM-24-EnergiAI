package com.g9.energiacore.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Payload para solicitação de recuperação de senha")
public record ForgotPasswordRequest(
        @Schema(description = "E-mail cadastrado do usuário", example = "ana.silva@exemplo.com")
        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail em formato inválido")
        String email
) {}
