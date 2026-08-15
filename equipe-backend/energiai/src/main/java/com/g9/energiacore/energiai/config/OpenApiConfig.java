package com.g9.energiacore.energiai.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "EnergiAI / BeeBuzz API",
        version = "1.0",
        description = "API RESTful do sistema EnergiAI / BeeBuzz para análise preditiva de consumo energético via IA e gestão de faturas."
    ),
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Informe o token JWT obtido no endpoint /auth/login. O cabeçalho Authorization: Bearer <token> será enviado automaticamente nas requisições."
)
public class OpenApiConfig {
}
