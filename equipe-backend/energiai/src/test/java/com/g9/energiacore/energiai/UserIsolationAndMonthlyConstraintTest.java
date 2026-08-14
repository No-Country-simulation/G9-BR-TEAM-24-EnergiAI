package com.g9.energiacore.energiai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.g9.energiacore.energiai.domain.User;
import com.g9.energiacore.energiai.dto.AnaliseRequest;
import com.g9.energiacore.energiai.dto.AnaliseResponse;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class UserIsolationAndMonthlyConstraintTest {

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

    private User userA;
    private User userB;
    private String tokenA;
    private String tokenB;

    public UserIsolationAndMonthlyConstraintTest() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @BeforeEach
    void setUp() {
        consumoRepository.deleteAll();
        userRepository.deleteAll();

        userA = userRepository.save(User.builder()
                .name("Usuário A")
                .email("usera@exemplo.com")
                .password(passwordEncoder.encode("Senha123!"))
                .confirmed(true)
                .build());

        userB = userRepository.save(User.builder()
                .name("Usuário B")
                .email("userb@exemplo.com")
                .password(passwordEncoder.encode("Senha123!"))
                .confirmed(true)
                .build());

        tokenA = jwtService.generateToken(userA.getEmail(), userA.getId(), userA.getName());
        tokenB = jwtService.generateToken(userB.getEmail(), userB.getId(), userB.getName());
    }

    @Test
    @DisplayName("Isolamento: Usuário B não consegue consultar a análise (GET /consumos/{id}) do Usuário A")
    void deveImpedirUsuarioBDeConsultarConsumoDoUsuarioA() throws Exception {
        AnaliseRequest reqA = new AnaliseRequest(
                YearMonth.of(2026, 8),
                300.0,
                true,
                5,
                "Residencial",
                4,
                1,
                3,
                Regiao.SUDESTE
        );

        MvcResult result = mockMvc.perform(post("/analise-energetica")
                .header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqA)))
                .andExpect(status().isCreated())
                .andReturn();

        AnaliseResponse created = objectMapper.readValue(result.getResponse().getContentAsString(), AnaliseResponse.class);
        assertNotNull(created.id());

        // Tentar consultar usando o token do Usuário B (deve retornar 404 Not Found por isolamento)
        mockMvc.perform(get("/consumos/" + created.id())
                .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Regra Mensal: Usuário A enviando duas vezes o mesmo reference_month gera 409 CONFLICT na segunda tentativa")
    void deveGerarConflito409AoEnviarMesmoMesDeReferencia() throws Exception {
        YearMonth refMonth = YearMonth.of(2026, 8);

        AnaliseRequest req1 = new AnaliseRequest(
                refMonth,
                350.0,
                false,
                4,
                "Residencial",
                3,
                1,
                2,
                Regiao.SUL
        );

        // Primeira requisição: Deve ter sucesso 201 Created
        mockMvc.perform(post("/analise-energetica")
                .header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        // Segunda requisição com mesmo mês de referência para o Usuário A: Deve falhar com 409 CONFLICT
        mockMvc.perform(post("/analise-energetica")
                .header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Regra Mensal: Usuário A e Usuário B podem ter análises no mesmo mês de referência sem conflito")
    void devemPermitirAnalisesNoMesmoMesParaUsuariosDiferentes() throws Exception {
        YearMonth refMonth = YearMonth.of(2026, 8);

        AnaliseRequest reqA = new AnaliseRequest(
                refMonth,
                250.0,
                true,
                3,
                "Residencial",
                2,
                1,
                2,
                Regiao.NORDESTE
        );

        AnaliseRequest reqB = new AnaliseRequest(
                refMonth,
                400.0,
                false,
                8,
                "Comercial",
                6,
                2,
                5,
                Regiao.CENTRO_OESTE
        );

        // Usuário A cria para 2026-08-01 -> 201 Created
        mockMvc.perform(post("/analise-energetica")
                .header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqA)))
                .andExpect(status().isCreated());

        // Usuário B cria para 2026-08-01 -> 201 Created sem conflito
        mockMvc.perform(post("/analise-energetica")
                .header("Authorization", "Bearer " + tokenB)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reqB)))
                .andExpect(status().isCreated());
    }
}
