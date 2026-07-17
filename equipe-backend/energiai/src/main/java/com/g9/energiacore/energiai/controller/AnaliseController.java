package com.g9.energiacore.energiai.controller;

import com.g9.energiacore.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.dto.AnaliseResponse;
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
@Tag(name = "Análise Energética", description = "Endpoints para análise de consumo energético")
public class AnaliseController {

    private static final Logger log = LoggerFactory.getLogger(AnaliseController.class);

    @Autowired
    private AnaliseService analiseService;

    @Operation(
            summary = "Realizar análise energética",
            description = "Recebe os dados de consumo energético e retorna uma análise com categoria, probabilidade, recomendações e custo estimado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Análise realizada com sucesso"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados de entrada inválidos (campos nulos ou fora dos limites permitidos)",
                    content = @Content
            )
    })
    @PostMapping
    public ResponseEntity<AnaliseResponse> analisar(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dados de consumo energético para análise",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = AnaliseRequest.class),
                            examples = @ExampleObject(
                                    name = "Exemplo de requisição",
                                    summary = "Exemplo típico de análise energética",
                                    value = """
                                            {
                                                "consumo_kwh": 350.5,
                                                "uso_horario_pico": true,
                                                "quantidade_equipamentos": 8,
                                                "tipo_imovel": "residencial",
                                                "horas_alto_consumo": 6
                                            }
                                            """
                            )
                    )
            )
            @Valid @RequestBody AnaliseRequest req) {
        log.info("Análise energética solicitada: {}", req);
        AnaliseResponse resp = analiseService.analisar(req);
        return ResponseEntity.status(201).body(resp);
    }
}