package com.g9.energiacore.energiai.infra.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // -------------------------------------------------------
    // Logger: o "diário" interno da aplicação
    // Registra o que acontece no console, nunca no cliente
    // -------------------------------------------------------
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);


    // -------------------------------------------------------
    // CRITÉRIOS 2, 3 e 6
    // Trata erros de validação do DTO (campos inválidos)
    // Exemplo: consumo_kwh enviado como nulo
    // Retorna HTTP 400
    // -------------------------------------------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<StandardError> validationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;

        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> {
                    // Pega o nome JSON real do campo via @JsonProperty
                    String jsonFieldName = resolverNomeCampoJson(ex, fieldError);
                    // Formata como "campo_json: mensagem de erro"
                    return jsonFieldName + ": " + fieldError.getDefaultMessage();
                })
                .collect(Collectors.joining(", "));

        // Log interno de aviso — não vai pro cliente
        log.warn("Erro de validação em {}: {}", request.getRequestURI(), errorMessage);

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Erro de validação",
                errorMessage,
                request.getRequestURI()
        );

        return ResponseEntity.status(status).body(err);
    }


    // -------------------------------------------------------
    // CRITÉRIOS 4 e 6
    // Trata JSON malformado (sintaxe incorreta no corpo da requisição)
    // Exemplo: vírgula sobrando, chave não fechada, etc.
    // Retorna HTTP 400
    // -------------------------------------------------------
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<StandardError> handleJsonMalformado(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;

        // Log interno de aviso — não vai pro cliente
        log.warn("JSON malformado recebido em {}: {}", request.getRequestURI(), ex.getMessage());

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "JSON malformado",
                "O corpo da requisição contém um JSON inválido ou malformado. Verifique a sintaxe.",
                request.getRequestURI()
        );

        return ResponseEntity.status(status).body(err);
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<StandardError> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;
        log.warn("Requisição inválida em {}: {}", request.getRequestURI(), ex.getMessage());

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Requisição Inválida",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<StandardError> handleIllegalState(
            IllegalStateException ex,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.FORBIDDEN;
        log.warn("Acesso não permitido / Estado inválido em {}: {}", request.getRequestURI(), ex.getMessage());

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Acesso Proibido",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(status).body(err);
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<StandardError> handleResponseStatus(
            org.springframework.web.server.ResponseStatusException ex,
            HttpServletRequest request) {

        log.warn("Exceção HTTP {} em {}: {}", ex.getStatusCode(), request.getRequestURI(), ex.getReason());

        StandardError err = new StandardError(
                Instant.now(),
                ex.getStatusCode().value(),
                ex.getStatusCode().toString(),
                ex.getReason() != null ? ex.getReason() : ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(ex.getStatusCode()).body(err);
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<StandardError> handleDataIntegrityViolation(
            org.springframework.dao.DataIntegrityViolationException ex,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.CONFLICT;
        log.warn("Violação de integridade de dados em {}: {}", request.getRequestURI(), ex.getMessage());

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Conflito de Dados",
                "Já existe um registro com os mesmos dados de referência para este usuário.",
                request.getRequestURI()
        );

        return ResponseEntity.status(status).body(err);
    }

    // -------------------------------------------------------
    // CRITÉRIOS 5 e 6
    // Trata qualquer erro inesperado que não foi tratado acima
    // Exemplo: bug interno, serviço fora do ar, etc.
    // Retorna HTTP 500
    // -------------------------------------------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardError> handleErroGenerico(
            Exception ex,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

        // Log interno de erro com stack trace completo — nunca vai pro cliente
        log.error("Erro interno inesperado em {}: ", request.getRequestURI(), ex);

        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Erro interno do servidor",
                "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.",
                request.getRequestURI()
        );

        return ResponseEntity.status(status).body(err);
    }


    // -------------------------------------------------------
    // MÉTODO AUXILIAR — usado pelo validationException()
    // Procura a anotação @JsonProperty no campo do DTO
    // e retorna o nome JSON correto
    // Se não encontrar, usa o nome Java como alternativa
    // -------------------------------------------------------
    private String resolverNomeCampoJson(MethodArgumentNotValidException ex, FieldError fieldError) {
        try {
            // Pega a classe do objeto que foi validado (ex: AnaliseRequest)
            Class<?> classeDoDto = ex.getBindingResult().getTarget().getClass();

            // Procura o campo pelo nome Java (ex: consumoKwh)
            Field campo = classeDoDto.getDeclaredField(fieldError.getField());

            // Verifica se esse campo tem a anotação @JsonProperty
            JsonProperty anotacao = campo.getAnnotation(JsonProperty.class);

            // Se tiver @JsonProperty, retorna o nome dela (ex: "consumo_kwh")
            // Se não tiver, usa o nome Java mesmo (ex: "consumoKwh")
            return (anotacao != null && !anotacao.value().isEmpty())
                    ? anotacao.value()
                    : fieldError.getField();

        } catch (NoSuchFieldException e) {
            // Se der algum problema ao procurar o campo,
            // usa o nome Java como alternativa segura
            return fieldError.getField();
        }
    }
}