package com.g9.energiacore.energiai.infra.storage;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import lombok.extern.slf4j.Slf4j;

//futuramente iremos criar uma classe OciStorageService implements ModelStorageService anotada com @Profile("prod").

@Slf4j
@Service
@Profile("local") // Ativado apenas no desenvolvimento local
public class LocalMockStorageService implements ModelStorageService {

    @Override
    public InputStream getModelFile() {
        log.info("Carregando modelo MOCK do storage local...");
        // Retorna um stream vazio ou um arquivo de teste
        return new ByteArrayInputStream("mock-onnx-content".getBytes());
    }
}

