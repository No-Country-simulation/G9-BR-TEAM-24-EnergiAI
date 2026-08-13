package com.g9.energiacore.energiai.infra.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;

@Service
@Primary
public class OciModelStorageService implements ModelStorageService, ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OciModelStorageService.class);
    private static final String TEMP_MODEL_FILENAME = "modelo_energia.onnx";

    @Value("${OCI_MODEL_URL:}")
    private String ociModelUrl;

    private final ClasspathModelStorageService fallbackStorageService;
    private final Path tempModelPath;
    private final HttpClient httpClient;

    public OciModelStorageService(ClasspathModelStorageService fallbackStorageService) {
        this.fallbackStorageService = fallbackStorageService;
        this.tempModelPath = Paths.get(System.getProperty("java.io.tmpdir"), TEMP_MODEL_FILENAME);
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    @Override
    public void run(ApplicationArguments args) {
        downloadModelFromOciIfConfigured();
    }

    public synchronized void downloadModelFromOciIfConfigured() {
        if (ociModelUrl == null || ociModelUrl.isBlank()) {
            log.info("OCI_MODEL_URL não foi informada. O armazenamento continuará utilizando o modelo local (Classpath).");
            return;
        }

        log.info("Iniciando download do modelo ONNX remoto via OCI Object Storage PAR...");

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ociModelUrl.trim()))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

            if (response.statusCode() == 200) {
                try (InputStream is = response.body()) {
                    Files.copy(is, tempModelPath, StandardCopyOption.REPLACE_EXISTING);
                }

                if (Files.exists(tempModelPath) && Files.size(tempModelPath) > 0) {
                    log.info("Modelo ONNX baixado com sucesso da OCI Object Storage (Tamanho: {} bytes, Salvo em: '{}')",
                            Files.size(tempModelPath), tempModelPath.toAbsolutePath());
                    return;
                } else {
                    log.warn("Arquivo baixado da OCI está vazio ou inválido.");
                }
            } else {
                log.warn("Falha no download do modelo OCI (HTTP Status {}).", response.statusCode());
            }
        } catch (Exception e) {
            log.warn("Erro durante o download do modelo ONNX da OCI: {}. Ativando fallback local.", e.getMessage());
        }
    }

    @Override
    public InputStream getModelFile() {
        if (Files.exists(tempModelPath)) {
            try {
                if (Files.size(tempModelPath) > 0) {
                    log.info("Carregando modelo ONNX da OCI a partir do armazenamento temporário: {}", tempModelPath.toAbsolutePath());
                    return new FileInputStream(tempModelPath.toFile());
                }
            } catch (Exception e) {
                log.warn("Erro ao ler modelo temporário baixado: {}. Acionando fallback do Classpath.", e.getMessage());
            }
        }

        log.info("Modelo remoto não disponível. Acionando fallback para ClasspathModelStorageService.");
        return fallbackStorageService.getModelFile();
    }
}
