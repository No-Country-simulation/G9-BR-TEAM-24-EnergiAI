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

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    private final HttpClient httpClient;

    public EmailService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public void sendConfirmationEmail(String toEmail, String recipientName, String token) {
        String subject = "Confirmação de E-mail — EnergiAI / BeeBuzz";
        String link = frontendUrl + "/verify-email?token=" + token;
        String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #16a34a;">Olá, %s!</h2>
                    <p>Obrigado por se cadastrar no <strong>EnergiAI / BeeBuzz</strong>.</p>
                    <p>Para ativar sua conta e concluir seu cadastro, clique no botão abaixo:</p>
                    <div style="margin: 25px 0;">
                        <a href="%s" style="background-color: #16a34a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirmar Minha Conta</a>
                    </div>
                    <p style="font-size: 13px; color: #666;">Ou acesse diretamente o link: <br/><a href="%s" style="color: #2563eb;">%s</a></p>
                    <p style="margin-top: 20px; font-size: 12px; color: #777;">Este link expira em 24 horas.</p>
                </div>
                """, recipientName, link, link, link);

        sendEmail(toEmail, subject, htmlContent);
    }

    public void sendForgotPasswordEmail(String toEmail, String recipientName, String token) {
        String subject = "Recuperação de Senha — EnergiAI / BeeBuzz";
        String link = frontendUrl + "/reset-password?token=" + token;
        String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #2563eb;">Olá, %s!</h2>
                    <p>Recebemos uma solicitação de redefinição de senha para sua conta no <strong>EnergiAI / BeeBuzz</strong>.</p>
                    <p>Para criar uma nova senha, clique no botão abaixo:</p>
                    <div style="margin: 25px 0;">
                        <a href="%s" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
                    </div>
                    <p style="font-size: 13px; color: #666;">Ou acesse diretamente o link: <br/><a href="%s" style="color: #2563eb;">%s</a></p>
                    <p style="margin-top: 20px; font-size: 12px; color: #777;">Este link expira em 1 hora. Caso não tenha solicitado a alteração, ignore este e-mail.</p>
                </div>
                """, recipientName, link, link, link);

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
