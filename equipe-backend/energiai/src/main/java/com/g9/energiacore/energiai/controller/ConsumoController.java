package com.g9.energiacore.energiai.controller;

import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.dto.ConsumoRequestDTO;
import com.g9.energiacore.energiai.dto.ConsumoResponseDTO;
import com.g9.energiacore.energiai.infra.security.SecurityUtils;
import com.g9.energiacore.energiai.service.ConsumoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consumos")
@Tag(name = "Histórico de Consumos", description = "Endpoints para gerenciamento do histórico de consumo mensal do usuário logado")
public class ConsumoController {

    private final ConsumoService consumoService;
    private final SecurityUtils securityUtils;

    public ConsumoController(ConsumoService consumoService, SecurityUtils securityUtils) {
        this.consumoService = consumoService;
        this.securityUtils = securityUtils;
    }

    @Operation(summary = "Listar histórico de consumos", description = "Retorna todas as análises do usuário logado, ordenadas pelo mês de referência em ordem decrescente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado")
    })
    @GetMapping
    public ResponseEntity<List<ConsumoResponseDTO>> listarHistorico() {
        User user = securityUtils.getAuthenticatedUser();
        List<ConsumoResponseDTO> historico = consumoService.listarHistorico(user);
        return ResponseEntity.ok(historico);
    }

    @Operation(summary = "Buscar consumo por ID", description = "Retorna os detalhes de uma análise específica do usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Consumo encontrado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Consumo não encontrado ou pertence a outro usuário")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ConsumoResponseDTO> buscarPorId(@PathVariable Long id) {
        User user = securityUtils.getAuthenticatedUser();
        ConsumoResponseDTO dto = consumoService.buscarPorId(id, user);
        return ResponseEntity.ok(dto);
    }


    @Operation(summary = "Atualizar consumo existente", description = "Atualiza os dados de um mês específico e reprocessa a inferência da IA.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Consumo atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Consumo não encontrado"),
            @ApiResponse(responseCode = "409", description = "O novo mês de referência informado já possui outra análise cadastrada")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ConsumoResponseDTO> atualizarConsumo(@PathVariable Long id, @Valid @RequestBody ConsumoRequestDTO req) {
        User user = securityUtils.getAuthenticatedUser();
        ConsumoResponseDTO dto = consumoService.atualizarConsumo(id, req, user);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Excluir consumo", description = "Remove uma análise do histórico do usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Consumo excluído com sucesso"),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado"),
            @ApiResponse(responseCode = "404", description = "Consumo não encontrado ou pertence a outro usuário")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarConsumo(@PathVariable Long id) {
        User user = securityUtils.getAuthenticatedUser();
        consumoService.deletarConsumo(id, user);
        return ResponseEntity.noContent().build();
    }
}
