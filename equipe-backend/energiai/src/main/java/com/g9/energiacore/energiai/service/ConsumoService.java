package com.g9.energiacore.energiai.service;

import com.g9.energiacore.energiai.domain.Consumo;
import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.dto.ConsumoRequestDTO;
import com.g9.energiacore.energiai.dto.ConsumoResponseDTO;
import com.g9.energiacore.energiai.infra.ai.InferenceResult;
import com.g9.energiacore.energiai.infra.ai.OnnxInferenceService;
import com.g9.energiacore.energiai.repository.ConsumoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class ConsumoService {

    private static final double CUSTO_KWH = 0.75;
    private final ConsumoRepository consumoRepository;
    private final OnnxInferenceService onnxInferenceService;
    private final AnaliseService analiseService;

    @Autowired
    public ConsumoService(ConsumoRepository consumoRepository,
                          OnnxInferenceService onnxInferenceService,
                          AnaliseService analiseService) {
        this.consumoRepository = consumoRepository;
        this.onnxInferenceService = onnxInferenceService;
        this.analiseService = analiseService;
    }

    @Transactional(readOnly = true)
    public List<ConsumoResponseDTO> listarHistorico(User user) {
        List<Consumo> consumos = consumoRepository.findByUsuarioIdOrderByReferenceMonthDesc(user.getId());
        return consumos.stream()
                .map(c -> {
                    AnaliseRequest req = new AnaliseRequest(
                            c.getReferenceMonth() != null ? YearMonth.from(c.getReferenceMonth()) : null,
                            c.getConsumoKwh(),
                            c.getUsoHorarioPico(),
                            c.getQuantidadeEquipamentos(),
                            c.getTipoImovel(),
                            c.getHorasAltoConsumo(),
                            c.getQuantidadeArCondicionado(),
                            c.getMoradores(),
                            c.getRegiao()
                    );
                    List<String> recomendacoes = analiseService.gerarRecomendacoes(req);
                    return ConsumoResponseDTO.fromEntity(c, recomendacoes);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public ConsumoResponseDTO buscarPorId(Long id, User user) {
        Consumo c = consumoRepository.findByIdAndUsuarioId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Análise de consumo com ID " + id + " não encontrada para o usuário."));

        AnaliseRequest req = new AnaliseRequest(
                c.getReferenceMonth() != null ? YearMonth.from(c.getReferenceMonth()) : null,
                c.getConsumoKwh(),
                c.getUsoHorarioPico(),
                c.getQuantidadeEquipamentos(),
                c.getTipoImovel(),
                c.getHorasAltoConsumo(),
                c.getQuantidadeArCondicionado(),
                c.getMoradores(),
                c.getRegiao()
        );
        List<String> recomendacoes = analiseService.gerarRecomendacoes(req);
        return ConsumoResponseDTO.fromEntity(c, recomendacoes);
    }


    @Transactional
    public ConsumoResponseDTO atualizarConsumo(Long id, ConsumoRequestDTO dto, User user) {
        Consumo consumo = consumoRepository.findByIdAndUsuarioId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Análise de consumo com ID " + id + " não encontrada para o usuário."));

        LocalDate refMonthDate = dto.referenceMonth() != null ? dto.referenceMonth().atDay(1) : null;

        // Se o mês de referência foi alterado, verifica se conflita com outra conta do mesmo usuário
        if (refMonthDate != null && !refMonthDate.equals(consumo.getReferenceMonth())) {
            Optional<Consumo> existente = consumoRepository.findByUsuarioIdAndReferenceMonth(user.getId(), refMonthDate);
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "O mês de referência " + dto.referenceMonth() + " já possui outra análise cadastrada.");
            }
        }

        // Reprocessamento da inferência preditiva com os dados atualizados
        AnaliseRequest analiseReq = dto.toAnaliseRequest();
        InferenceResult inferenceResult = onnxInferenceService.executarInferenciador(analiseReq);
        List<String> recomendacoes = analiseService.gerarRecomendacoes(analiseReq);

        double custoEstimadoMensal = Math.round((dto.consumoKwh() * CUSTO_KWH) * 100.0) / 100.0;

        consumo.setReferenceMonth(refMonthDate);
        consumo.setConsumoKwh(dto.consumoKwh());
        consumo.setUsoHorarioPico(dto.usoHorarioPico());
        consumo.setQuantidadeEquipamentos(dto.quantidadeEquipamentos());
        consumo.setTipoImovel(dto.tipoImovel());
        consumo.setHorasAltoConsumo(dto.horasAltoConsumo());
        consumo.setQuantidadeArCondicionado(dto.quantidadeArCondicionado());
        consumo.setMoradores(dto.moradores());
        consumo.setRegiao(dto.regiao());
        consumo.setCategoriaIa(inferenceResult.categoria());
        consumo.setProbabilidadeIa(inferenceResult.probabilidade());
        consumo.setCustoEstimadoMensal(custoEstimadoMensal);

        consumo = consumoRepository.save(consumo);
        return ConsumoResponseDTO.fromEntity(consumo, recomendacoes);
    }

    @Transactional
    public void deletarConsumo(Long id, User user) {
        Consumo consumo = consumoRepository.findByIdAndUsuarioId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Análise de consumo com ID " + id + " não encontrada para o usuário."));
        consumoRepository.delete(consumo);
    }
}
