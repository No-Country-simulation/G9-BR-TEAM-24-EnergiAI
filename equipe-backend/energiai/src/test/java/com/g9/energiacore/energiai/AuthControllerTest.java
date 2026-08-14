package com.g9.energiacore.energiai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.domain.UserConfirmationToken;
import com.g9.energiacore.energiai.dto.LoginRequest;
import com.g9.energiacore.energiai.dto.RegisterRequest;
import com.g9.energiacore.energiai.dto.VerifyEmailRequest;
import com.g9.energiacore.energiai.repository.UserConfirmationTokenRepository;
import com.g9.energiacore.energiai.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserConfirmationTokenRepository tokenRepository;

    @Test
    @DisplayName("Deve registrar novo usuário com sucesso, salvar senha com hash e gerar token de confirmação")
    void deveRegistrarUsuarioComSucesso() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("Carlos Oliveira", "carlos.test@exemplo.com", "SenhaSegura123");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").exists());

        User user = userRepository.findByEmail("carlos.test@exemplo.com").orElse(null);
        assertNotNull(user);
        assertEquals("Carlos Oliveira", user.getName());
        assertFalse(user.getConfirmed());
        assertNotEquals("SenhaSegura123", user.getPassword(), "A senha deve ser armazenada como hash, nunca em plaintext");
    }

    @Test
    @DisplayName("Deve recusar login de usuário pendente de confirmação com status 403")
    void deveRecusarLoginSemConfirmacao() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("Mariana Lima", "mariana.test@exemplo.com", "SenhaSegura123");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = new LoginRequest("mariana.test@exemplo.com", "SenhaSegura123");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Deve confirmar e-mail por token e realizar login com sucesso retornando JWT")
    void deveConfirmarEmailERealizarLoginComSucesso() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("Lucas Costa", "lucas.test@exemplo.com", "SenhaSegura123");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail("lucas.test@exemplo.com").orElseThrow();
        UserConfirmationToken token = tokenRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .findFirst().orElseThrow();

        VerifyEmailRequest verifyReq = new VerifyEmailRequest(token.getToken());

        mockMvc.perform(post("/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        assertTrue(userRepository.findByEmail("lucas.test@exemplo.com").orElseThrow().getConfirmed());

        LoginRequest loginReq = new LoginRequest("lucas.test@exemplo.com", "SenhaSegura123");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("lucas.test@exemplo.com"));
    }
}
