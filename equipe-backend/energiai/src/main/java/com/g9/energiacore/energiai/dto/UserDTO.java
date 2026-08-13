package com.g9.energiacore.energiai.dto;

import com.g9.energiacore.energiai.domain.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados do usuário (sem campos sensíveis)")
public record UserDTO(
        @Schema(description = "ID do usuário", example = "1")
        Long id,

        @Schema(description = "Nome completo", example = "Ana Silva")
        String name,

        @Schema(description = "E-mail cadastrado", example = "ana.silva@exemplo.com")
        String email,

        @Schema(description = "Indica se o e-mail foi confirmado", example = "true")
        Boolean confirmed
) {
    public static UserDTO fromEntity(User user) {
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getConfirmed());
    }
}
