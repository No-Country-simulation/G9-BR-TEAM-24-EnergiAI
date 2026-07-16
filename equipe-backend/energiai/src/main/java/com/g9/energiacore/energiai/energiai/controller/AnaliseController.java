package com.energiai.controller;

import com.energiai.dto.AnaliseRequest;
import com.energiai.dto.AnaliseResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;

@RestController
@RequestMapping("/analise-energetica")
public class AnaliseController {

    private static final double TARIFA_PADRAO = 0.75;

    @PostMapping
    public ResponseEntity<AnaliseResponse> analisar(@RequestBody AnaliseRequest req) {
        AnaliseResponse resp = new AnaliseResponse();

        if (req.getConsumoKwh() != null && req.getConsumoKwh() > 400) {
            resp.setCategoria("Ineficiente");
            resp.setProbabilidade(0.81);
        } else {
            resp.setCategoria("Moderado");
            resp.setProbabilidade(0.65);
        }

        resp.setRecomendacoes(Arrays.asList(
                "Reduzir o uso de equipamentos durante horários de pico",
                "Avaliar aparelhos com alto consumo energetico",
                "Distribuir atividades de maior consumo ao longo do dia"
        ));

        double custo = (req.getConsumoKwh() != null ? req.getConsumoKwh() * TARIFA_PADRAO : 0.0);
        resp.setCustoEstimadoMensal(Math.round(custo * 100.0) / 100.0);

        return ResponseEntity.ok(resp);
    }
}

