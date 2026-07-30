# API_CONTRACT.md — Contrato Oficial da API backend (energiai-api)

> **Documento de Auditoria e Especificação Oficial de Contrato**  
> **Data:** 29 de Julho de 2026  
> **Versão da API:** 0.0.1-SNAPSHOT  
> **Stack Backend:** Java 21, Spring Boot 3 (WebMVC 4.1.0-parent / Spring 3.x), OpenAPI (Springdoc 3.0.3), Lombok, Actuator.

---

## 1. VISÃO GERAL DA API

A **energiai-api** é um microserviço stateless de inteligência e cálculo para análise de consumo energético. A API é a **única fonte de verdade** para as regras de classificação energética e recomendação de ações.

- **URL Base Padrão:** `http://localhost:8080`
- **Prefixo de API:** `/` (não existe prefixo `/api`)
- **Formato de Payload:** JSON (`application/json`)
- **CORS:** Configurado para `http://localhost:5173` (ambientes de desenvolvimento Vite/React).

---

## 2. AUTENTICAÇÃO E SEGURANÇA

- **Autenticação Ativa:** **NENHUMA** (Não existe Spring Security, JWT, OAuth ou Session Management).
- **Visibilidade:** Todos os endpoints são 100% públicos e abertos.
- **Impacto no Frontend:** Telas de Login e Cadastro (`/login`, `/signup`) e hooks de sessão (`useAuth`) funcionam exclusivamente em modo focado no cliente (localStorage) e não possuem suporte ou endpoints no backend.

---

## 3. PERSISTÊNCIA E ARMAZENAMENTO DE DADOS

- **Banco de Dados:** **INEXISTENTE** (Sem JPA, Hibernate, JDBC, MongoDB, H2 ou PostgreSQL).
- **Repositories:** **NENHUM** repository implementado.
- **Modelo de Operação:** **Stateless** em memória. O backend processa o payload recebido e devolve o cálculo imediatamente.
- **Impacto no Frontend:** O backend **não armazena histórico de leituras/faturas**. Endpoints de histórico (`GET /entries`), criação persistente (`POST /entries`), remoção (`DELETE /entries/{id}`) ou povoamento (`POST /entries/seed`) **não existem**.

---

## 4. INVENTÁRIO COMPLETO DE ENDPOINTS

| Endpoint              | Método HTTP |   DTO Entrada    |     DTO Saída     | Status Sucesso |                Status Erro                | Descrição                                                                                           |
| :-------------------- | :---------: | :--------------: | :---------------: | :------------: | :---------------------------------------: | :-------------------------------------------------------------------------------------------------- |
| `/analise-energetica` |   `POST`    | `AnaliseRequest` | `AnaliseResponse` | `201 Created`  | `400 Bad Request`<br>`500 Internal Error` | Processa consumo de energia e gera diagnóstico com categoria, probabilidade, recomendações e custo. |
| `/actuator/health`    |    `GET`    |       N/A        |   JSON Actuator   |    `200 OK`    |           `500 Internal Error`            | Estado de saúde da aplicação backend.                                                               |
| `/actuator/info`      |    `GET`    |       N/A        |   JSON Actuator   |    `200 OK`    |           `500 Internal Error`            | Informações da aplicação.                                                                           |
| `/v3/api-docs`        |    `GET`    |       N/A        | JSON OpenAPI 3.0  |    `200 OK`    |                    N/A                    | Especificação técnica em formato OpenAPI.                                                           |
| `/swagger-ui.html`    |    `GET`    |       N/A        |       HTML        |    `200 OK`    |                    N/A                    | Interface visual interativa da documentação Swagger.                                                |

---

## 5. DTOs REAIS DA APLICAÇÃO

### 5.1. `AnaliseRequest` (Payload de Entrada)

Tipo Java: `record` (`com.g9.energiacore.energiai.dto.AnaliseRequest`)

| Campo JSON                | Tipo Java | Anotações / Validações                                                         | Descrição                                                                            |
| :------------------------ | :-------- | :----------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| `consumo_kwh`             | `Double`  | `@JsonProperty("consumo_kwh")`<br>`@NotNull`<br>`@Min(0)`                      | Consumo total de energia elétrica em kWh no período. Não pode ser nulo nem negativo. |
| `uso_horario_pico`        | `Boolean` | `@JsonProperty("uso_horario_pico")`<br>`@NotNull`                              | Indica se o consumo é concentrado no horário de pico (18h-21h). Não pode ser nulo.   |
| `quantidade_equipamentos` | `Integer` | `@JsonProperty("quantidade_equipamentos")`<br>`@NotNull`<br>`@Min(1)`          | Quantidade total de equipamentos eletroeletrônicos ligados na unidade. Mínimo 1.     |
| `tipo_imovel`             | `String`  | `@JsonProperty("tipo_imovel")`<br>`@NotBlank`                                  | Tipo do imóvel (ex: `"Residencial"`, `"Comercial"`). Não pode ser vazio ou nulo.     |
| `horas_alto_consumo`      | `Integer` | `@JsonProperty("horas_alto_consumo")`<br>`@NotNull`<br>`@Min(0)`<br>`@Max(24)` | Quantidade de horas por dia com alto consumo de energia. Deve ser entre 0 e 24.      |

---

### 5.2. `AnaliseResponse` (Payload de Saída)

Tipo Java: `record` (`com.g9.energiacore.energiai.dto.AnaliseResponse`)

| Campo JSON              | Tipo Java      | Descrição                                                                | Valores Possíveis / Formato                                                              |
| :---------------------- | :------------- | :----------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| `categoria`             | `String`       | Classificação do nível de eficiência energética do imóvel.               | `"Eficiente"`, `"Moderado"`, `"Ineficiente"`                                             |
| `probabilidade`         | `Double`       | Grau de confiança / probabilidade estatística do resultado.              | `0.45` (Eficiente), `0.65` (Moderado), `0.81` (Ineficiente)                              |
| `recomendacoes`         | `List<String>` | Lista de recomendações textuais personalizadas para economia de energia. | Array de Strings (ex: `["Reduzir o uso de equipamentos durante horários de pico", ...]`) |
| `custo_estimado_mensal` | `Double`       | Custo estimado mensal em Reais (calculado a R$ 0,75/kWh).                | Número flutuante com 2 casas decimais (ex: `262.88`)                                     |

---

### 5.3. `StandardError` (Payload de Erro de Validação/Servidor)

Tipo Java: `record` (`com.g9.energiacore.energiai.infra.exception.StandardError`)

| Campo JSON  | Tipo Java | Descrição                                                                            |
| :---------- | :-------- | :----------------------------------------------------------------------------------- |
| `timestamp` | `Instant` | Data e hora em formato ISO 8601 UTC.                                                 |
| `status`    | `Integer` | Código de status HTTP (ex: `400`, `500`).                                            |
| `error`     | `String`  | Título / Categoria legível do erro (ex: `"Erro de validação"`, `"JSON malformado"`). |
| `message`   | `String`  | Detalhamento técnico do erro com nomes dos campos JSON mapeados via `@JsonProperty`. |
| `path`      | `String`  | URI da requisição que gerou a exceção.                                               |

---

## 6. EXEMPLOS REAIS DE REQUEST E RESPONSE

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
  "horas_alto_consumo": 6
}
```

**Response HTTP (`201 Created`):**

```json
{
  "categoria": "Ineficiente",
  "probabilidade": 0.81,
  "recomendacoes": [
    "Reduzir o uso de equipamentos durante horários de pico",
    "Avaliar aparelhos com alto consumo energético",
    "Instalar iluminação LED em toda a residência"
  ],
  "custo_estimado_mensal": 262.88
}
```

---

### 6.2. Exemplo de Erro de Validação (`400 Bad Request`)

**Request HTTP (Campos Inválidos):**

```http
POST /analise-energetica HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "consumo_kwh": -50.0,
  "uso_horario_pico": null,
  "quantidade_equipamentos": 0,
  "tipo_imovel": "",
  "horas_alto_consumo": 30
}
```

**Response HTTP (`400 Bad Request`):**

```json
{
  "timestamp": "2026-07-29T14:45:00.123456Z",
  "status": 400,
  "error": "Erro de validação",
  "message": "consumo_kwh: deve ser maior ou igual a 0, uso_horario_pico: não deve ser nulo, quantidade_equipamentos: deve ser maior ou igual a 1, tipo_imovel: não deve estar em branco, horas_alto_consumo: deve ser menor ou igual a 24",
  "path": "/analise-energetica"
}
```

---

## 7. ANÁLISE DE ENDPOINTS E INCOMPATIBILIDADES COM O FRONTEND

### 7.1. Endpoints Inexistentes Solicitados pelo Frontend

O frontend atual em `/home/punk/projetos/flow-energy` tenta efetuar chamadas REST para os seguintes recursos que **NÃO EXISTEM** no backend:

| Endpoint no Frontend |  Método  | Status no Backend | Diagnóstico                                                         |
| :------------------- | :------: | :---------------: | :------------------------------------------------------------------ |
| `/api/entries`       |  `GET`   |  **NÃO EXISTE**   | O backend não possui banco de dados nem histórico de lançamentos.   |
| `/api/entries`       |  `POST`  |  **NÃO EXISTE**   | O backend não possui persistência para guardar lançamentos mensais. |
| `/api/entries/{id}`  | `DELETE` |  **NÃO EXISTE**   | O backend não suporta deleção nem identificadores (`id`).           |
| `/api/entries/seed`  |  `POST`  |  **NÃO EXISTE**   | O backend não fornece massa de dados / seeds.                       |
| `/api/auth/*`        |  `POST`  |  **NÃO EXISTE**   | O backend não possui serviço de login, cadastro ou tokens JWT.      |

---

### 7.2. Status do Único Endpoint Real (`/analise-energetica`)

- **Existe no Backend?** **SIM** (`POST /analise-energetica`).
- **É Consumido pelo Frontend Atualmente?** **NÃO**. O frontend gerava classificações e recomendações localmente via código TypeScript (`classifyEfficiency` e `recommendations` em `src/lib/data.ts`) e nunca realizou uma requisição HTTP real para `/analise-energetica`.
