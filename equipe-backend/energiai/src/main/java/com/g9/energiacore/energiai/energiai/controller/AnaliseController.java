package com.g9.energiacore.energiai.energiai.controller;

import com.g9.energiacore.energiai.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.energiai.dto.AnaliseResponse;
import com.g9.energiacore.energiai.energiai.service.AnaliseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/analise-energetica")
public class AnaliseController {

    private static final Logger log = LoggerFactory.getLogger(AnaliseController.class);

    @Autowired
    private AnaliseService analiseService;

    @PostMapping
    public ResponseEntity<AnaliseResponse> analisar(@RequestBody AnaliseRequest req) {
        log.info("Análise energética solicitada: {}", req);
        AnaliseResponse resp = analiseService.analisar(req);
        return ResponseEntity.status(201).body(resp);
    }
}

