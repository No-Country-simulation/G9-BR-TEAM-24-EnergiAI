package com.g9.energiacore.energiai;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class AnaliseControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("Deve retornar 200 OK e o JSON de Mock correto ao enviar dados validos")
  void deveRetornarMockComSucesso() throws Exception {
    // O JSON exato que o edital exige como entrada
    String jsonRequest = """
        {
            "consumo_kwh": 420,
            "uso_horario_pico": true,
            "quantidade_equipamentos": 10,
            "tipo_imovel": "Casa",
            "horas_alto_consumo": 8
        }
        """;

    mockMvc.perform(post("/analise-energetica")
        .contentType(MediaType.APPLICATION_JSON)
        .content(jsonRequest))
        .andExpect(status().isCreated())
        // Valida se as chaves de saída estão no formato snake_case exigido
        .andExpect(jsonPath("$.categoria").exists())
        .andExpect(jsonPath("$.probabilidade").exists())
        .andExpect(jsonPath("$.recomendacoes").isArray())
        .andExpect(jsonPath("$.custo_estimado_mensal").exists());
  }

  @Test
  @DisplayName("Deve retornar 400 Bad Request quando tipo_imovel for em branco ou vazio")
  void deveRetornar400QuandoTipoImovelForEmBranco() throws Exception {
    String jsonRequest = """
        {
            "consumo_kwh": 350.0,
            "uso_horario_pico": true,
            "quantidade_equipamentos": 5,
            "tipo_imovel": "   ",
            "horas_alto_consumo": 6
        }
        """;

    mockMvc.perform(post("/analise-energetica")
        .contentType(MediaType.APPLICATION_JSON)
        .content(jsonRequest))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Erro de validação"));
  }

  @Test
  @DisplayName("Deve retornar 400 Bad Request quando horas_alto_consumo for maior que 24")
  void deveRetornar400QuandoHorasAltoConsumoExceder24() throws Exception {
    String jsonRequest = """
        {
            "consumo_kwh": 350.0,
            "uso_horario_pico": true,
            "quantidade_equipamentos": 5,
            "tipo_imovel": "Residencial",
            "horas_alto_consumo": 25
        }
        """;

    mockMvc.perform(post("/analise-energetica")
        .contentType(MediaType.APPLICATION_JSON)
        .content(jsonRequest))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Erro de validação"));
  }
}
