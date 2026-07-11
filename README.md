# EnergiAI

Projeto desenvolvido para o **Hackathon ONE – Projetos G9 | Alura + Oracle**.

> Desafio oficial: [Projetos Hackathon G9 – Brasil](https://alura-es-cursos.github.io/projetos-hackathon-g9-brasil/)

## Sobre o projeto

O EnergiAI tem como objetivo transformar dados de consumo de energia elétrica em informações claras e úteis para residências e pequenos estabelecimentos.

A solução analisa indicadores como consumo mensal em kWh, horários de maior utilização, quantidade de equipamentos, tipo de imóvel e perfil de uso dos ambientes. A partir desses dados, técnicas de Ciência de Dados são utilizadas para:

- identificar padrões de consumo;
- classificar o perfil energético, por exemplo, como **Eficiente**, **Moderado** ou **Ineficiente**;
- apontar possíveis desperdícios;
- gerar recomendações de economia e sustentabilidade;
- estimar o custo mensal de energia;
- disponibilizar os resultados em JSON para integração com outros sistemas.

Para a estimativa financeira, o projeto adota inicialmente a tarifa de referência de **R$ 0,75 por kWh**.

## Necessidade do cliente

Muitas pessoas recebem contas de energia elevadas sem saber quais hábitos ou equipamentos mais influenciam seus gastos. O EnergiAI busca facilitar esse entendimento, permitindo que o usuário:

- conheça seu perfil de consumo energético;
- identifique oportunidades de redução de desperdício;
- receba recomendações personalizadas;
- estime os custos associados ao consumo;
- acompanhe indicadores de eficiência ao longo do tempo.

## Objetivos do MVP

O MVP deve ser capaz de:

1. analisar padrões de consumo energético;
2. classificar o perfil de eficiência;
3. gerar recomendações de melhoria;
4. estimar o impacto financeiro do consumo;
5. disponibilizar os resultados por meio de uma API REST;
6. utilizar pelo menos um serviço da Oracle Cloud Infrastructure (OCI).

## Ciência de Dados

A etapa de dados contempla:

- exploração e limpeza dos dados;
- análise dos padrões de consumo;
- tratamento e transformação de variáveis;
- treinamento e avaliação de modelos supervisionados;
- definição dos critérios de eficiência energética;
- geração de recomendações por regras ou modelos;
- serialização do modelo treinado.

O notebook atual trata os dados de consumo e gera dois conjuntos para comparação entre períodos:

- `df_jan_jun`: consumo de janeiro a junho;
- `df_jun_dez`: consumo de junho a dezembro.

Junho está presente nos dois períodos. Cada conjunto considera apenas registros com pelo menos três meses de consumo positivo no intervalo correspondente.

Notebook: [`equipe-dados/tratamento_dados_energia_regressao.ipynb`](equipe-dados/tratamento_dados_energia_regressao.ipynb)

## API REST

A API será responsável por receber os dados, executar a análise e devolver a classificação, a probabilidade, as recomendações e a estimativa financeira em formato JSON.

### Análise energética

```http
POST /analise-energetica
Content-Type: application/json
```

Exemplo de entrada:

```json
{
  "consumo_kwh": 420,
  "uso_horario_pico": true,
  "quantidade_equipamentos": 10,
  "tipo_imovel": "Casa",
  "horas_alto_consumo": 8
}
```

Exemplo de resposta:

```json
{
  "categoria": "Ineficiente",
  "probabilidade": 0.81,
  "recomendacoes": [
    "Reduzir o uso de equipamentos durante horários de pico",
    "Avaliar aparelhos com alto consumo energético",
    "Distribuir atividades de maior consumo ao longo do dia"
  ],
  "custo_estimado_mensal": 315.00
}
```

A API também deverá oferecer consulta de resultados, validação das entradas, tratamento de erros e documentação dos endpoints. O back-end poderá ser desenvolvido em Java com Spring Boot.

## Oracle Cloud Infrastructure

O projeto deve utilizar pelo menos um serviço OCI. Entre as possibilidades estão:

- **Object Storage:** armazenamento de modelos, dados e artefatos;
- **OCI Compute:** hospedagem da API;
- **OCI Functions:** processamento complementar sob demanda;
- **Banco de dados OCI:** persistência opcional do histórico e dos resultados.

A arquitetura e os serviços escolhidos serão documentados durante o desenvolvimento do MVP.

## Requisitos do ambiente Python

As dependências utilizadas pelo notebook estão listadas no arquivo [`requirements.txt`](requirements.txt):

- `pandas`: manipulação e transformação dos dados;
- `numpy`: operações numéricas;
- `openpyxl`: leitura de arquivos Excel;
- `lxml`: processamento eficiente do XML interno de arquivos XLSX.

### Instalação

Com Python instalado, recomenda-se criar um ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente no Linux ou macOS:

```bash
source .venv/bin/activate
```

No Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Instale as dependências:

```bash
python -m pip install -r requirements.txt
```

Depois, abra e execute o notebook na ordem das células. O arquivo de dados esperado deve estar no caminho indicado no próprio notebook.

## Requisitos mínimos da entrega

- modelo treinado e carregado corretamente;
- classificação funcional do perfil energético;
- recomendações de otimização;
- estimativa do custo de energia;
- API REST documentada;
- integração com OCI;
- no mínimo três exemplos reais ou simulados de utilização.

## Possíveis evoluções

- dashboard de acompanhamento;
- histórico de análises;
- processamento em lote por CSV;
- containerização com Docker;
- testes automatizados;
- alertas de consumo elevado;
- visualizações gráficas;
- comparação entre períodos;
- ranking de eficiência energética;
- simulação de cenários de economia;
- interface para inserção de dados e visualização dos resultados.

## Contexto de mercado

Eficiência energética e sustentabilidade são temas cada vez mais relevantes para consumidores, empresas e governos. Soluções orientadas por dados podem ajudar a reduzir custos, incentivar o consumo consciente, monitorar padrões de utilização e apoiar estratégias ambientais. Mesmo uma solução simples pode gerar valor ao apresentar análises compreensíveis e recomendações personalizadas.
