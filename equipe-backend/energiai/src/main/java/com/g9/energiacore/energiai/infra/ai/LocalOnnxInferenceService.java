package com.g9.energiacore.energiai.infra.ai;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import com.g9.energiacore.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.infra.storage.ModelStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Implementação nativa da inferência ONNX Runtime via Java SDK C++ Bindings.
 * Aloca tensores individuais (OnnxTensor) para cada entrada nomeada exigida pelo modelo
 * de regressão (`modelo_consumo_base_analitica_df4.onnx`).
 */
@Service
public class LocalOnnxInferenceService implements OnnxInferenceService {

    private static final Logger log = LoggerFactory.getLogger(LocalOnnxInferenceService.class);

    private final ModelStorageService modelStorageService;

    @Autowired
    public LocalOnnxInferenceService(ModelStorageService modelStorageService) {
        this.modelStorageService = modelStorageService;
    }

    @Override
    public InferenceResult executarInferenciador(AnaliseRequest request) {
        String regiaoStr = request.regiao() != null ? request.regiao().getDescricao() : "Sudeste";
        String tipoImovelStr = request.tipoImovel() != null ? request.tipoImovel() : "Residencial";

        log.info("Iniciando inferência ONNX nativa para o imóvel tipo '{}' na região '{}'",
                tipoImovelStr, regiaoStr);

        try (InputStream modelStream = modelStorageService.getModelFile()) {
            byte[] modelBytes = modelStream.readAllBytes();

            OrtEnvironment env = OrtEnvironment.getEnvironment();
            try (OrtSession session = env.createSession(modelBytes, new OrtSession.SessionOptions())) {

                Map<String, OnnxTensor> inputTensors = new HashMap<>();

                // Converte cada parâmetro do DTO para seu tipo e formato de tensor exigido pelo ONNX [1, 1]
                float usoPicoFloat = Boolean.TRUE.equals(request.usoHorarioPico()) ? 1.0f : 0.0f;
                float qtdEquipFloat = request.quantidadeEquipamentos() != null ? request.quantidadeEquipamentos().floatValue() : 1.0f;
                float horasAltoFloat = request.horasAltoConsumo() != null ? request.horasAltoConsumo().floatValue() : 0.0f;
                float qtdArFloat = request.quantidadeArCondicionado() != null ? request.quantidadeArCondicionado().floatValue() : 0.0f;
                float moradoresFloat = request.moradores() != null ? request.moradores().floatValue() : 1.0f;

                // 1. uso_horario_pico -> tensor(float) [1, 1]
                inputTensors.put("uso_horario_pico", OnnxTensor.createTensor(env, new float[][]{{usoPicoFloat}}));

                // 2. quantidade_equipamentos -> tensor(float) [1, 1]
                inputTensors.put("quantidade_equipamentos", OnnxTensor.createTensor(env, new float[][]{{qtdEquipFloat}}));

                // 3. tipo_imovel -> tensor(string) [1, 1]
                inputTensors.put("tipo_imovel", OnnxTensor.createTensor(env, new String[][]{{tipoImovelStr}}));

                // 4. horas_alto_consumo -> tensor(float) [1, 1]
                inputTensors.put("horas_alto_consumo", OnnxTensor.createTensor(env, new float[][]{{horasAltoFloat}}));

                // 5. quantidade_ar_condicionado -> tensor(float) [1, 1]
                inputTensors.put("quantidade_ar_condicionado", OnnxTensor.createTensor(env, new float[][]{{qtdArFloat}}));

                // 6. moradores -> tensor(float) [1, 1]
                inputTensors.put("moradores", OnnxTensor.createTensor(env, new float[][]{{moradoresFloat}}));

                // 7. regiao -> tensor(string) [1, 1]
                inputTensors.put("regiao", OnnxTensor.createTensor(env, new String[][]{{regiaoStr}}));

                try (OrtSession.Result result = session.run(inputTensors)) {
                    // Saída da regressão ONNX "variable" -> tensor(float) [1, 1]
                    float[][] outputArray = (float[][]) result.get(0).getValue();
                    double consumoPreditoOnnx = Math.round(outputArray[0][0] * 100.0) / 100.0;

                    log.info("Inferência ONNX nativa executada com sucesso. Consumo predito pelo modelo: {} kWh", consumoPreditoOnnx);

                    // Classificação baseada no consumo predito da IA vs consumo informado
                    double consumoInformado = request.consumoKwh() != null ? request.consumoKwh() : consumoPreditoOnnx;
                    double desvioRatio = consumoInformado / Math.max(1.0, consumoPreditoOnnx);

                    String categoria;
                    double probabilidade;

                    if (desvioRatio > 1.25 || consumoInformado > 400) {
                        categoria = "Ineficiente";
                        probabilidade = 0.88;
                    } else if (desvioRatio >= 0.90 || consumoInformado > 200) {
                        categoria = "Moderado";
                        probabilidade = 0.68;
                    } else {
                        categoria = "Eficiente";
                        probabilidade = 0.42;
                    }

                    return new InferenceResult(categoria, probabilidade, consumoPreditoOnnx);
                } finally {
                    // Liberação explícita de memória nativa C++ para todos os OnnxTensor alocados
                    for (OnnxTensor tensor : inputTensors.values()) {
                        try {
                            tensor.close();
                        } catch (Exception e) {
                            log.warn("Erro ao fechar OnnxTensor: {}", e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Erro na execução nativa do modelo ONNX: {}", e.getMessage(), e);
            throw new RuntimeException("Falha na inferência do modelo ONNX: " + e.getMessage(), e);
        }
    }
}
