package com.g9.energiacore.energiai.controller;

import com.g9.energiacore.energiai.dto.ContactUsRequest;
import com.g9.energiacore.energiai.dto.MessageResponse;
import com.g9.energiacore.energiai.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contact-us")
@Tag(name = "Contato", description = "Endpoint para envio de mensagens via formulário de Fale Conosco")
public class ContactUsController {

    private final EmailService emailService;

    public ContactUsController(EmailService emailService) {
        this.emailService = emailService;
    }

    @Operation(summary = "Enviar mensagem de contato", description = "Recebe a mensagem do formulário Fale Conosco e dispara e-mail via Resend.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mensagem enviada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos")
    })
    @PostMapping
    public ResponseEntity<MessageResponse> contactUs(@Valid @RequestBody ContactUsRequest request) {
        emailService.sendContactUsEmail(request.name(), request.email(), request.subject(), request.message());
        return ResponseEntity.ok(new MessageResponse("Mensagem enviada com sucesso. Entraremos em contato em breve."));
    }
}
