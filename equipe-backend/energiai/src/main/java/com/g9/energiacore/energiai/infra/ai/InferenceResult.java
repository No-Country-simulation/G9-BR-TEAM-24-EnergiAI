package com.g9.energiacore.energiai.infra.ai;

/**
 * Record que representa o resultado bruto da inferência efetuada pelo modelo ONNX.
 */
public record InferenceResult(
    String categoria,
    Double probabilidade,
    Double consumoPreditoOnnx
) {}
