package com.g9.energiacore.energiai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Value("${RESEND_FROM_EMAIL:onboarding@resend.dev}")
    private String resendFromEmail;

    private final HttpClient httpClient;

    public EmailService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendConfirmationEmail(String toEmail, String recipientName, String token) {
        String subject = "Confirmação de E-mail — EnergiAI / BeeBuzz";
        String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Olá, %s!</h2>
                    <p>Obrigado por se cadastrar no <strong>EnergiAI / BeeBuzz</strong>.</p>
                    <p>Para ativar sua conta, utilize o token de confirmação abaixo:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-weight: bold; letter-spacing: 1px; font-size: 16px;">
                        %s
                    </div>
                    <p style="margin-top: 20px; font-size: 12px; color: #777;">Este token expira em 24 horas.</p>
                </div>
                """, recipientName, token);

        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendForgotPasswordEmail(String toEmail, String recipientName, String token) {
        String subject = "Recuperação de Senha — EnergiAI / BeeBuzz";
        String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Olá, %s!</h2>
                    <p>Recebemos uma solicitação de redefinição de senha para sua conta no <strong>EnergiAI / BeeBuzz</strong>.</p>
                    <p>Utilize o token abaixo para redefinir sua senha:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-weight: bold; letter-spacing: 1px; font-size: 16px;">
                        %s
                    </div>
                    <p style="margin-top: 20px; font-size: 12px; color: #777;">Este token expira em 1 hora. Caso não tenha solicitado a alteração, ignore este e-mail.</p>
                </div>
                """, recipientName, token);

        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendContactUsEmail(String fromName, String fromEmail, String subject, String messageContent) {
        String mailSubject = "Novo Contato via Formulário: " + subject;
        String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Novo contato recebido do portal EnergiAI</h2>
                    <p><strong>Nome:</strong> %s</p>
                    <p><strong>E-mail:</strong> %s</p>
                    <p><strong>Assunto:</strong> %s</p>
                    <hr/>
                    <p><strong>Mensagem:</strong></p>
                    <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff;">%s</p>
                </div>
                """, fromName, fromEmail, subject, messageContent);

        sendEmail(resendFromEmail, mailSubject, htmlContent);
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.warn("RESEND_API_KEY não configurada. E-mail simulado no log. Para: '{}', Assunto: '{}'", to, subject);
            return;
        }

        try {
            String jsonPayload = String.format("""
                    {
                        "from": "%s",
                        "to": ["%s"],
                        "subject": "%s",
                        "html": "%s"
                    }
                    """,
                    escapeJson(resendFromEmail),
                    escapeJson(to),
                    escapeJson(subject),
                    escapeJson(htmlContent));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_API_URL))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("E-mail enviado com sucesso via Resend para '{}'", to);
            } else {
                log.error("Erro ao enviar e-mail via Resend API (HTTP {}): {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Falha na comunicação com a API da Resend: {}", e.getMessage(), e);
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
