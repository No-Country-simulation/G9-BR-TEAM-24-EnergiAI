package com.g9.energiacore.energiai;

import com.g9.energiacore.energiai.domain.User;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@Transactional
class AnaliseControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ConsumoRepository consumoRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private JwtService jwtService;

  private String token;

  @BeforeEach
  void setUp() {
    consumoRepository.deleteAll();
    userRepository.deleteAll();

    User testUser = userRepository.save(User.builder()
            .name("User Teste")
            .email("teste@exemplo.com")
            .password(passwordEncoder.encode("Senha123!"))
            .confirmed(true)
            .build());

    token = jwtService.generateToken(testUser.getEmail(), testUser.getId(), testUser.getName());
  }

  @Test
  @DisplayName("Deve retornar 201 Created e JSON valido ao enviar o DTO completo do modelo ONNX com JWT")
  void deveRetornarMockComSucesso() throws Exception {
    String jsonRequest = """
        {
            "consumo_kwh": 420.5,
            "uso_horario_pico": true,
            "quantidade_equipamentos": 10,
            "tipo_imovel": "Residencial",
            "horas_alto_consumo": 8,
            "quantidade_ar_condicionado": 2,
            "moradores": 4,
            "regiao": "Sudeste"
        }
        """;

    mockMvc.perform(post("/analise-energetica")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content(jsonRequest))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.categoria").exists())
        .andExpect(jsonPath("$.probabilidade").exists())
        .andExpect(jsonPath("$.recomendacoes").isArray())
        .andExpect(jsonPath("$.custo_estimado_mensal").exists());
  }

  @Test
  @DisplayName("Deve retornar 400 Bad Request quando quantidade_ar_condicionado for nulo ou menor que 0 com JWT")
  void deveRetornar400QuandoQuantidadeArCondicionadoForInvalida() throws Exception {
    String jsonRequest = """
        {
            "consumo_kwh": 350.0,
            "uso_horario_pico": true,
            "quantidade_equipamentos": 5,
            "tipo_imovel": "Residencial",
            "horas_alto_consumo": 6,
            "quantidade_ar_condicionado": -1,
            "moradores": 3,
            "regiao": "Sul"
        }
        """;

    mockMvc.perform(post("/analise-energetica")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content(jsonRequest))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Erro de validação"));
  }

  @Test
  @DisplayName("Deve retornar 400 Bad Request quando moradores for menor que 1 com JWT")
  void deveRetornar400QuandoMoradoresForMenorQueUm() throws Exception {
    String jsonRequest = """
        {
            "consumo_kwh": 350.0,
            "uso_horario_pico": true,
            "quantidade_equipamentos": 5,
            "tipo_imovel": "Residencial",
            "horas_alto_consumo": 6,
            "quantidade_ar_condicionado": 1,
            "moradores": 0,
            "regiao": "Nordeste"
        }
        """;

    mockMvc.perform(post("/analise-energetica")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content(jsonRequest))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Erro de validação"));
  }

  @Test
  @DisplayName("Deve retornar 400 Bad Request quando regiao for nula ou invalida com JWT")
  void deveRetornar400QuandoRegiaoForInvalida() throws Exception {
    String jsonRequest = """
        {
            "consumo_kwh": 350.0,
            "uso_horario_pico": true,
            "quantidade_equipamentos": 5,
            "tipo_imovel": "Residencial",
            "horas_alto_consumo": 6,
            "quantidade_ar_condicionado": 1,
            "moradores": 2,
            "regiao": "RegiaoInvalida"
        }
        """;

    mockMvc.perform(post("/analise-energetica")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content(jsonRequest))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Deve retornar 201 Created para todas as regioes brasileiras permitidas com JWT")
  void deveAceitarTodasAsRegioesPermitidas() throws Exception {
    String[] regioes = {"Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"};

    for (String regiao : regioes) {
      consumoRepository.deleteAll();
      String jsonRequest = String.format("""
          {
              "consumo_kwh": 250.0,
              "uso_horario_pico": false,
              "quantidade_equipamentos": 4,
              "tipo_imovel": "Residencial",
              "horas_alto_consumo": 3,
              "quantidade_ar_condicionado": 1,
              "moradores": 2,
              "regiao": "%s"
          }
          """, regiao);

      mockMvc.perform(post("/analise-energetica")
          .header("Authorization", "Bearer " + token)
          .contentType(MediaType.APPLICATION_JSON)
          .content(jsonRequest))
          .andExpect(status().isCreated());
    }
  }
}
