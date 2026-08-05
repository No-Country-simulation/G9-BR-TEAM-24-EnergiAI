package com.g9.energiacore.energiai.infra.ai;

import com.g9.energiacore.energiai.dto.AnaliseRequest;

/**
 * Interface da camada de inferência de Inteligência Artificial.
 * Isola a regra de execução do modelo ONNX das demais camadas de aplicação.
 */
public interface OnnxInferenceService {
    InferenceResult executarInferenciador(AnaliseRequest request);
}
