package com.g9.energiacore.energiai.service;

import com.g9.energiacore.energiai.domain.Consumo;
import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.dto.AnaliseResponse;
import com.g9.energiacore.energiai.dto.Regiao;
import com.g9.energiacore.energiai.infra.ai.InferenceResult;
import com.g9.energiacore.energiai.infra.ai.OnnxInferenceService;
import com.g9.energiacore.energiai.repository.ConsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnaliseService {

    private static final double CUSTO_KWH = 0.75;
    private final OnnxInferenceService onnxInferenceService;
    private final ConsumoRepository consumoRepository;

    @Autowired
    public AnaliseService(OnnxInferenceService onnxInferenceService, ConsumoRepository consumoRepository) {
        this.onnxInferenceService = onnxInferenceService;
        this.consumoRepository = consumoRepository;
    }

    @Transactional
    public AnaliseResponse analisar(AnaliseRequest request, User user) {
        LocalDate refMonth = request.referenceMonth() != null 
                ? request.referenceMonth().atDay(1) 
                : LocalDate.now().withDayOfMonth(1);

        // 1. Verifica se já existe uma análise para usuario_id + reference_month
        if (user != null && user.getId() != null) {
            if (consumoRepository.existsByUsuarioIdAndReferenceMonth(user.getId(), refMonth)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Já existe uma análise energética registrada para o mês de referência " + refMonth);
            }
        }

        // 2. Executa a inferência preditiva desacoplada via ONNX
        InferenceResult inferenceResult = onnxInferenceService.executarInferenciador(request);

        String categoria = inferenceResult.categoria();
        double probabilidade = inferenceResult.probabilidade();

        // 3. Recomendações e cálculo financeiro
        List<String> recomendacoes = gerarRecomendacoes(request);
        double consumoKwh = request.consumoKwh() != null ? request.consumoKwh() : 0.0;
        double custoEstimado = consumoKwh * CUSTO_KWH;
        double custoEstimadoMensal = Math.round(custoEstimado * 100.0) / 100.0;

        Long consumoId = null;

        // 4. Persiste a entidade Consumo se o usuário estiver autenticado
        if (user != null && user.getId() != null) {
            Consumo consumo = Consumo.builder()
                    .usuarioId(user.getId())
                    .referenceMonth(refMonth)
                    .consumoKwh(request.consumoKwh())
                    .usoHorarioPico(request.usoHorarioPico())
                    .quantidadeEquipamentos(request.quantidadeEquipamentos())
                    .tipoImovel(request.tipoImovel())
                    .horasAltoConsumo(request.horasAltoConsumo())
                    .quantidadeArCondicionado(request.quantidadeArCondicionado())
                    .moradores(request.moradores())
                    .regiao(request.regiao())
                    .categoriaIa(categoria)
                    .probabilidadeIa(probabilidade)
                    .custoEstimadoMensal(custoEstimadoMensal)
                    .build();

            consumo = consumoRepository.save(consumo);
            consumoId = consumo.getId();
        }

        return new AnaliseResponse(consumoId, refMonth, categoria, probabilidade, recomendacoes, custoEstimadoMensal);
    }

    public List<String> gerarRecomendacoes(AnaliseRequest request) {
        List<String> recomendacoes = new ArrayList<>();

        if (Boolean.TRUE.equals(request.usoHorarioPico())) {
            recomendacoes.add("Reduzir o uso de equipamentos de alta potência durante o horário de pico (18h às 21h)");
        }
        if (request.quantidadeArCondicionado() != null && request.quantidadeArCondicionado() > 0) {
            recomendacoes.add("Manter a temperatura do ar-condicionado em 23°C e realizar limpeza periódica dos filtros");
        }
        if (request.regiao() == Regiao.NORTE || request.regiao() == Regiao.NORDESTE) {
            recomendacoes.add("Utilizar ventilação natural e cortinas térmicas para amenizar o impacto do calor regional");
        }
        if (request.consumoKwh() != null && request.moradores() != null && (request.consumoKwh() / request.moradores()) > 100) {
            recomendacoes.add("Consumo por morador elevado: conscientizar sobre o tempo no banho e uso de eletrodomésticos");
        }
        if (request.horasAltoConsumo() != null && request.horasAltoConsumo() > 6) {
            recomendacoes.add("Distribuir tarefas de alto consumo energético ao longo do dia");
        }
        if (request.quantidadeEquipamentos() != null && request.quantidadeEquipamentos() > 10) {
            recomendacoes.add("Desligar equipamentos em standby usando filtros de linha com chave liga/desliga");
        }
        if ("Comercial".equalsIgnoreCase(request.tipoImovel())) {
            recomendacoes.add("Otimizar horários de funcionamento do sistema de climatização e iluminação comercial");
        } else if ("Residencial".equalsIgnoreCase(request.tipoImovel())) {
            recomendacoes.add("Substituir lâmpadas antigas por tecnologia LED em todos os cômodos");
        }

        if (recomendacoes.isEmpty()) {
            recomendacoes.add("Manter o excelente padrão atual de consumo consciente");
        }

        return recomendacoes;
    }
}
