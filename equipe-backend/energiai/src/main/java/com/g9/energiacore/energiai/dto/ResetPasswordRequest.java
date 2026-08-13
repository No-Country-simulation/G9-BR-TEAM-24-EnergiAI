package com.g9.energiacore.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload para redefinição de senha com token")
public record ResetPasswordRequest(
        @Schema(description = "Token de recuperação recebido por e-mail", example = "a1b2c3d4-e5f6-7890-abcd-123456789def")
        @NotBlank(message = "O token é obrigatório")
        String token,

        @Schema(description = "Nova senha do usuário (mínimo 6 caracteres)", example = "NovaSenha123!")
        @NotBlank(message = "A nova senha é obrigatória")
        @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres")
        String newPassword
) {}
