package com.g9.energiacore.energiai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Payload para envio de mensagem de contato")
public record ContactUsRequest(
        @Schema(description = "Nome do remetente", example = "João Souza")
        @NotBlank(message = "O nome é obrigatório")
        String name,

        @Schema(description = "E-mail para resposta", example = "joao.souza@exemplo.com")
        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail em formato inválido")
        String email,

        @Schema(description = "Assunto da mensagem", example = "Dúvida sobre a análise energética")
        @NotBlank(message = "O assunto é obrigatório")
        String subject,

        @Schema(description = "Conteúdo da mensagem", example = "Gostaria de saber mais sobre o plano comercial...")
        @NotBlank(message = "A mensagem é obrigatória")
        String message
) {}
