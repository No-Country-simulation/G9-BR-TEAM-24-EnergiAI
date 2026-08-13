package com.g9.energiacore.energiai.controller;

import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.dto.UserDTO;
import com.g9.energiacore.energiai.infra.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@Tag(name = "Usuários", description = "Endpoints para consulta do perfil do usuário autenticado")
public class UserController {

    private final SecurityUtils securityUtils;

    public UserController(SecurityUtils securityUtils) {
        this.securityUtils = securityUtils;
    }

    @Operation(summary = "Obter perfil do usuário autenticado", description = "Retorna os dados do usuário a partir do token JWT no contexto de segurança.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dados do usuário retornados com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado ou token inválido")
    })
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        User user = securityUtils.getAuthenticatedUser();
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}
