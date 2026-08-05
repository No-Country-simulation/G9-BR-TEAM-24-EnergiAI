# API_CONTRACT.md — Contrato Oficial da API backend (energiai-api)

> **Documento de Auditoria e Especificação Oficial de Contrato**  
> **Data Atualizada:** 04 de Agosto de 2026  
> **Versão da API:** 0.0.1-SNAPSHOT  
> **Stack Backend:** Java 21, Spring Boot 3 (WebMVC 4.1.0-parent / Spring 3.x), OpenAPI (Springdoc 3.0.3), Lombok, ONNX Runtime 1.18.0, Actuator.

---

## 1. VISÃO GERAL DA API

A **energiai-api** é um microserviço stateless de inteligência e cálculo para análise de consumo energético via modelos de Inteligência Artificial (ONNX). A API é a **única fonte de verdade** para as regras de classificação energética e recomendação de ações.

* **URL Base Padrão:** `http://localhost:8080`
* **Prefixo de API:** `/` (não existe prefixo `/api`)
* **Formato de Payload:** JSON (`application/json`)
* **CORS:** Configurado para aceitar `http://localhost:*` e `https://*.vercel.app`.

---

## 2. AUTENTICAÇÃO E SEGURANÇA

* **Autenticação Ativa:** **NENHUMA** (Não existe Spring Security, JWT, OAuth ou Session Management).
* **Visibilidade:** Todos os endpoints são 100% públicos e abertos.
* **Impacto no Frontend:** Telas de Login e Cadastro (`/login`, `/signup`) funcionam exclusivamente em modo focado no cliente (localStorage) e não possuem suporte ou endpoints no backend.

---

## 3. PERSISTÊNCIA E ARMAZENAMENTO DE DADOS

* **Banco de Dados:** **INEXISTENTE** (Sem JPA, Hibernate, JDBC, MongoDB, H2 ou PostgreSQL).
* **Repositories:** **NENHUM** repository implementado.
* **Modelo de Operação:** **Stateless** em memória. O backend processa o payload recebido e devolve o cálculo de inferência da IA imediatamente.
* **Impacto no Frontend:** O backend **não armazena histórico de leituras/faturas**.

---

## 4. INVENTÁRIO COMPLETO DE ENDPOINTS

| Endpoint | Método HTTP | DTO Entrada | DTO Saída | Status Sucesso | Status Erro | Descrição |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `/analise-energetica` | `POST` | `AnaliseRequest` | `AnaliseResponse` | `201 Created` | `400 Bad Request`<br>`500 Internal Error` | Processa consumo de energia e características residenciais/regionais via IA ONNX e gera diagnóstico. |
| `/actuator/health` | `GET` | N/A | JSON Actuator | `200 OK` | `500 Internal Error` | Estado de saúde da aplicação backend. |
| `/actuator/info` | `GET` | N/A | JSON Actuator | `200 OK` | `500 Internal Error` | Informações da aplicação. |
| `/v3/api-docs` | `GET` | N/A | JSON OpenAPI 3.0 | `200 OK` | N/A | Especificação técnica em formato OpenAPI. |
| `/swagger-ui.html` | `GET` | N/A | HTML | `200 OK` | N/A | Interface visual interativa da documentação Swagger. |

---

## 5. DTOs REAIS DA APLICAÇÃO

### 5.1. `AnaliseRequest` (Payload de Entrada para ONNX)

Tipo Java: `record` (`com.g9.energiacore.energiai.dto.AnaliseRequest`)

| Campo JSON | Tipo Java | Anotações / Validações | Descrição |
| :--- | :--- | :--- | :--- |
| `consumo_kwh` | `Double` | `@JsonProperty("consumo_kwh")`<br>`@NotNull`<br>`@Min(0)` | Consumo total de energia elétrica em kWh no período. Não pode ser nulo nem negativo. |
| `uso_horario_pico` | `Boolean` | `@JsonProperty("uso_horario_pico")`<br>`@NotNull` | Indica se o consumo é concentrado no horário de pico (18h-21h). Não pode ser nulo. |
| `quantidade_equipamentos` | `Integer` | `@JsonProperty("quantidade_equipamentos")`<br>`@NotNull`<br>`@Min(1)` | Quantidade total de equipamentos eletroeletrônicos ligados na unidade. Mínimo 1. |
| `tipo_imovel` | `String` | `@JsonProperty("tipo_imovel")`<br>`@NotBlank` | Tipo do imóvel (ex: `"Residencial"`, `"Comercial"`). Não pode ser vazio ou nulo. |
| `horas_alto_consumo` | `Integer` | `@JsonProperty("horas_alto_consumo")`<br>`@NotNull`<br>`@Min(0)`<br>`@Max(24)` | Quantidade de horas por dia com alto consumo de energia. Deve ser entre 0 e 24. |
| `quantidade_ar_condicionado` | `Integer` | `@JsonProperty("quantidade_ar_condicionado")`<br>`@NotNull`<br>`@Min(0)` | Quantidade de aparelhos de ar-condicionado no imóvel. Não nulo, mínimo 0. |
| `moradores` | `Integer` | `@JsonProperty("moradores")`<br>`@NotNull`<br>`@Min(1)` | Quantidade de moradores residentes no imóvel. Não nulo, mínimo 1. |
| `regiao` | `Regiao` (Enum) | `@JsonProperty("regiao")`<br>`@NotNull` | Região geográfica do imóvel no Brasil (`Norte`, `Nordeste`, `Centro-Oeste`, `Sudeste`, `Sul`). |

---

### 5.2. `AnaliseResponse` (Payload de Saída)

Tipo Java: `record` (`com.g9.energiacore.energiai.dto.AnaliseResponse`)

| Campo JSON | Tipo Java | Descrição | Valores Possíveis / Formato |
| :--- | :--- | :--- | :--- |
| `categoria` | `String` | Classificação do nível de eficiência energética do imóvel. | `"Eficiente"`, `"Moderado"`, `"Ineficiente"` |
| `probabilidade` | `Double` | Grau de confiança / probabilidade estatística do resultado. | Ex: `0.42`, `0.68`, `0.88` |
| `recomendacoes` | `List<String>` | Lista de recomendações textuais personalizadas para economia de energia. | Array de Strings |
| `custo_estimado_mensal` | `Double` | Custo estimado mensal em Reais (calculado a R$ 0,75/kWh). | Número flutuante com 2 casas decimais (ex: `262.88`) |

---

## 6. EXEMPLO REAL DE REQUEST E RESPONSE

### 6.1. Exemplo de Sucesso (`POST /analise-energetica`)

**Request HTTP:**
```http
POST /analise-energetica HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "consumo_kwh": 350.5,
  "uso_horario_pico": true,
  "quantidade_equipamentos": 8,
  "tipo_imovel": "Residencial",
  "horas_alto_consumo": 6,
  "quantidade_ar_condicionado": 2,
  "moradores": 4,
  "regiao": "Sudeste"
}
```

**Response HTTP (`201 Created`):**
```json
{
  "categoria": "Moderado",
  "probabilidade": 0.68,
  "recomendacoes": [
    "Reduzir o uso de equipamentos de alta potência durante o horário de pico (18h às 21h)",
    "Manter a temperatura do ar-condicionado em 23°C e realizar limpeza periódica dos filtros",
    "Substituir lâmpadas antigas por tecnologia LED em todos os cômodos"
  ],
  "custo_estimado_mensal": 262.88
}
```
