package com.g9.energiacore.energiai;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local") // Força o uso do LocalMockStorageService
class ApplicationSanityTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void applicationShouldStartAndActuatorHealthShouldReturn200() throws Exception {
    // Testa se o Spring Boot subiu e se o Actuator está respondendo
    mockMvc.perform(get("/actuator/health"))
      .andExpect(status().isOk());
  }
}
