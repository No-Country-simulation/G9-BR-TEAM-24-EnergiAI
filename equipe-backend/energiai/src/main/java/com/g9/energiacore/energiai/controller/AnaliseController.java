package com.g9.energiacore.energiai.controller;

import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.dto.AnaliseResponse;
import com.g9.energiacore.energiai.infra.security.SecurityUtils;
import com.g9.energiacore.energiai.service.AnaliseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analise-energetica")
@Tag(name = "Análise Energética", description = "Endpoints para análise de consumo energético via IA")
public class AnaliseController {

    private static final Logger log = LoggerFactory.getLogger(AnaliseController.class);

    private final AnaliseService analiseService;
    private final SecurityUtils securityUtils;

    @Autowired
    public AnaliseController(AnaliseService analiseService, SecurityUtils securityUtils) {
        this.analiseService = analiseService;
        this.securityUtils = securityUtils;
    }

    @Operation(
            summary = "Realizar análise energética",
            description = "Recebe os dados de consumo energético e características do imóvel, executa a inferência preditiva ONNX e salva o consumo associado ao usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Análise realizada e salva com sucesso"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados de entrada inválidos",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Já existe uma análise registrada para o mês de referência informado",
                    content = @Content
            )
    })
    @PostMapping
    public ResponseEntity<AnaliseResponse> analisar(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dados de consumo e perfil do imóvel para a inferência do modelo de IA",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = AnaliseRequest.class),
                            examples = @ExampleObject(
                                     name = "Exemplo de requisição completa",
                                     summary = "Exemplo típico de análise energética com mês de referência",
                                     value = """
                                             {
                                                 "reference_month": "2026-08-01",
                                                 "consumo_kwh": 350.5,
                                                 "uso_horario_pico": true,
                                                 "quantidade_equipamentos": 8,
                                                 "tipo_imovel": "Residencial",
                                                 "horas_alto_consumo": 6,
                                                 "quantidade_ar_condicionado": 2,
                                                 "moradores": 4,
                                                 "regiao": "Sudeste"
                                             }
                                             """
                            )
                    )
            )
            @Valid @RequestBody AnaliseRequest req) {
        log.info("Análise energética solicitada com novos atributos ONNX: {}", req);
        User currentUser = securityUtils.getAuthenticatedUser();
        AnaliseResponse resp = analiseService.analisar(req, currentUser);
        return ResponseEntity.status(201).body(resp);
    }
}