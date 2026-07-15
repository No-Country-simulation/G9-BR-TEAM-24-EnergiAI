package com.g9.energiacore.energiai.infra.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<StandardError> validationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        
        StandardError err = new StandardError(
                Instant.now(),
                status.value(),
                "Erro de validação",
                errorMessage,
                request.getRequestURI()
        );
        
        return ResponseEntity.status(status).body(err);
    }
}
