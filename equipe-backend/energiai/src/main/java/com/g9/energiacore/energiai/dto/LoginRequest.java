package com.g9.energiacore.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Payload para login de usuário")
public record LoginRequest(
        @Schema(description = "E-mail cadastrado", example = "ana.silva@exemplo.com")
        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail em formato inválido")
        String email,

        @Schema(description = "Senha do usuário", example = "SenhaSegura123!")
        @NotBlank(message = "A senha é obrigatória")
        String password
) {}
