package com.g9.energiacore.energiai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.dto.ContactUsRequest;
import com.g9.energiacore.energiai.dto.Regiao;
import com.g9.energiacore.energiai.infra.security.JwtService;
import com.g9.energiacore.energiai.repository.ConsumoRepository;
import com.g9.energiacore.energiai.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class SecurityRulesTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConsumoRepository consumoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private User testUser;
    private String validToken;

    public SecurityRulesTest() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @BeforeEach
    void setUp() {
        consumoRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .name("User Segurança")
                .email("seguranca@exemplo.com")
                .password(passwordEncoder.encode("Senha123!"))
                .confirmed(true)
                .build());

        validToken = jwtService.generateToken(testUser.getEmail(), testUser.getId(), testUser.getName());
    }

    @Test
    @DisplayName("TESTE 1 — Rejeitar análise (POST /analise-energetica) sem JWT (401/403)")
    void deveRejeitarAnaliseSemJWT() throws Exception {
        AnaliseRequest req = new AnaliseRequest(
                YearMonth.of(2026, 8),
                350.0,
                true,
                6,
                "Residencial",
                5,
                1,
                3,
                Regiao.SUDESTE
        );

        mockMvc.perform(post("/analise-energetica")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("TESTE 2 — Rejeitar análise (POST /analise-energetica) com JWT inválido (401/403)")
    void deveRejeitarAnaliseComJWTInvalido() throws Exception {
        AnaliseRequest req = new AnaliseRequest(
                YearMonth.of(2026, 8),
                350.0,
                true,
                6,
                "Residencial",
                5,
                1,
                3,
                Regiao.SUDESTE
        );

        mockMvc.perform(post("/analise-energetica")
                .header("Authorization", "Bearer token-invalido")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("TESTE 3 — Permitir análise (POST /analise-energetica) com JWT válido")
    void devePermitirAnaliseComJWTValido() throws Exception {
        AnaliseRequest req = new AnaliseRequest(
                YearMonth.of(2026, 8),
                350.0,
                true,
                6,
                "Residencial",
                5,
                1,
                3,
                Regiao.SUDESTE
        );

        mockMvc.perform(post("/analise-energetica")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("TESTE 4 — Permitir contato (POST /contact-us) sem JWT")
    void devePermitirContatoSemJWT() throws Exception {
        ContactUsRequest req = new ContactUsRequest(
                "Contato Teste",
                "contato@teste.com",
                "Dúvida Comercial",
                "Mensagem de teste de segurança."
        );

        mockMvc.perform(post("/contact-us")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TESTE 5 — Permitir onboarding /auth sem JWT")
    void devePermitirAuthSemJWT() throws Exception {
        String jsonLogin = """
                {
                    "email": "invalido@exemplo.com",
                    "password": "SenhaErrada"
                }
                """;

        // Deve processar na camada de controller e retornar 40x (erro de negócio e não bloqueio do filtro de segurança)
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonLogin))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("TESTE 6 — Rejeitar histórico (GET /consumos) e perfil (GET /users/me) sem JWT (401/403)")
    void deveRejeitarEndpointsProtegidosSemJWT() throws Exception {
        mockMvc.perform(get("/consumos"))
                .andExpect(status().is4xxClientError());

        mockMvc.perform(get("/users/me"))
                .andExpect(status().is4xxClientError());
    }
}
