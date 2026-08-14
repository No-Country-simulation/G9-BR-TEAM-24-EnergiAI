package com.g9.energiacore.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload para registro de novo usuário")
public record RegisterRequest(
        @Schema(description = "Nome completo do usuário", example = "Ana Silva")
        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
        String name,

        @Schema(description = "E-mail de cadastro", example = "ana.silva@exemplo.com")
        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail em formato inválido")
        String email,

        @Schema(description = "Senha do usuário (mínimo 6 caracteres)", example = "SenhaSegura123!")
        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres")
        String password
) {}
