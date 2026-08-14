package com.g9.energiacore.energiai.infra.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

/**
 * Abstração de armazenamento local do modelo ONNX.
 * Responsável por carregar o modelo binário a partir do classpath ou mock local.
 * Preparado para ser substituído transparentemente pelo OciStorageService em ambientes de produção.
 */
@Service("classpathModelStorageService")
public class ClasspathModelStorageService implements ModelStorageService {

    private static final Logger log = LoggerFactory.getLogger(ClasspathModelStorageService.class);
    private static final String DEFAULT_MODEL_PATH = "model/modelo_energia.onnx";

    @Override
    public InputStream getModelFile() {
        log.info("Buscando arquivo binário do modelo ONNX no classpath local: {}", DEFAULT_MODEL_PATH);
        InputStream resourceStream = getClass().getClassLoader().getResourceAsStream(DEFAULT_MODEL_PATH);
        
        if (resourceStream != null) {
            return resourceStream;
        }
        
        log.warn("Arquivo {} não encontrado no classpath. Retornando stream de fallback local para simulação.", DEFAULT_MODEL_PATH);
        return new ByteArrayInputStream("mock-onnx-model-content".getBytes());
    }
}
