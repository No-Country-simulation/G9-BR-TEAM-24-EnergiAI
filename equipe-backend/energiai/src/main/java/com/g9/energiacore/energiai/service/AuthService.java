package com.g9.energiacore.energiai.service;

import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.domain.UserConfirmationToken;
import com.g9.energiacore.energiai.dto.*;
import com.g9.energiacore.energiai.infra.security.JwtService;
import com.g9.energiacore.energiai.repository.UserConfirmationTokenRepository;
import com.g9.energiacore.energiai.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final UserConfirmationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       UserConfirmationTokenRepository tokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        String cleanEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("E-mail já cadastrado no sistema.");
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(cleanEmail)
                .password(passwordEncoder.encode(request.password()))
                .confirmed(false)
                .build();

        user = userRepository.save(user);

        String tokenValue = UUID.randomUUID().toString();
        UserConfirmationToken confirmationToken = UserConfirmationToken.builder()
                .token(tokenValue)
                .user(user)
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .build();

        tokenRepository.save(confirmationToken);

        emailService.sendConfirmationEmail(user.getEmail(), user.getName(), tokenValue);

        log.info("Novo usuário registrado: '{}'. Token de confirmação gerado com sucesso.", cleanEmail);

        return new MessageResponse("Usuário registrado com sucesso. Verifique seu e-mail para confirmar a conta.");
    }

    @Transactional
    public MessageResponse verifyEmail(VerifyEmailRequest request) {
        UserConfirmationToken token = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Token de confirmação inválido ou não encontrado."));

        if (token.isUsed()) {
            throw new IllegalArgumentException("Este token de confirmação já foi utilizado.");
        }

        if (token.isExpired()) {
            throw new IllegalArgumentException("O token de confirmação expirou. Solicite um novo cadastro.");
        }

        User user = token.getUser();
        user.setConfirmed(true);
        userRepository.save(user);

        token.setUsedAt(OffsetDateTime.now());
        tokenRepository.save(token);

        log.info("E-mail do usuário '{}' confirmado com sucesso.", user.getEmail());

        return new MessageResponse("E-mail confirmado com sucesso. Sua conta está ativa para login.");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Credenciais inválidas.");
        }

        if (!Boolean.TRUE.equals(user.getConfirmed())) {
            throw new IllegalStateException("Conta pendente de confirmação. Por favor, verifique seu e-mail antes de realizar o login.");
        }

        String jwt = jwtService.generateToken(user.getEmail(), user.getId(), user.getName());
        log.info("Login efetuado com sucesso para o usuário: '{}'", cleanEmail);

        return new AuthResponse(jwt, UserDTO.fromEntity(user));
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String cleanEmail = request.email().trim().toLowerCase();

        userRepository.findByEmail(cleanEmail).ifPresent(user -> {
            String tokenValue = UUID.randomUUID().toString();
            UserConfirmationToken resetToken = UserConfirmationToken.builder()
                    .token(tokenValue)
                    .user(user)
                    .expiresAt(OffsetDateTime.now().plusHours(1))
                    .build();

            tokenRepository.save(resetToken);
            emailService.sendForgotPasswordEmail(user.getEmail(), user.getName(), tokenValue);
            log.info("Token de recuperação de senha gerado para o e-mail: '{}'", cleanEmail);
        });

        // Retorna mensagem padrão para evitar enumeração de e-mails
        return new MessageResponse("Se o e-mail estiver cadastrado, você receberá as instruções para redefinição de senha.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        UserConfirmationToken token = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Token de redefinição de senha inválido ou não encontrado."));

        if (token.isUsed()) {
            throw new IllegalArgumentException("Este token de redefinição já foi utilizado.");
        }

        if (token.isExpired()) {
            throw new IllegalArgumentException("O token de redefinição de senha expirou. Solicite um novo e-mail de recuperação.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        token.setUsedAt(OffsetDateTime.now());
        tokenRepository.save(token);

        log.info("Senha redefinida com sucesso para o usuário: '{}'", user.getEmail());

        return new MessageResponse("Senha redefinida com sucesso. Você já pode realizar o login com a nova senha.");
    }
}
