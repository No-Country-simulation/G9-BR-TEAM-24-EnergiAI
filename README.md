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

## Pipeline de dados e treinamento

O pipeline reproduzível foi reduzido a dois notebooks:

1. [`equipe-dados/tratamento_dados_energia_regressao.ipynb`](equipe-dados/tratamento_dados_energia_regressao.ipynb)
   transforma a planilha PPH 2019 e os dados climáticos em uma tabela analítica
   com uma residência por linha.
2. [`equipe-dados/treinamento_exportacao_modelo_energia.ipynb`](equipe-dados/treinamento_exportacao_modelo_energia.ipynb)
   faz a análise exploratória, seleção de features, treinamento, avaliação,
   explicabilidade, exemplo JSON e exportação do modelo ONNX.

As fontes brutas não fazem parte do repositório. Antes de executar o tratamento,
coloque na raiz do projeto os arquivos `PPH 2019 - Banco de Dados V2.xlsx` e
`2019.csv`. Em seguida, execute os dois notebooks na ordem acima. A tabela
intermediária `equipe-dados/dados_pph2019_tratados_regressao.csv` é gerada pelo
primeiro notebook e não deve ser versionada.

O notebook de treinamento usa uma formulação sem quantidades isoladas de
equipamentos ou lâmpadas.
Posse aparece somente combinada com frequência, duração ou intensidade de uso.
O experimento compara quatro regressors e aplica RFE sobre 30 candidatas. A
escolha global usa parcimônia: entre modelos com RMSE até 0,5% do melhor,
seleciona aquele com menos campos. O resultado atual usa 8 features, das quais
5 são acionáveis. O notebook também exibe uma matriz diagnóstica por faixas de
consumo e produz recomendações KNN/SHAP limitadas a mudanças comportamentais,
sem sugerir o descarte de bens.

Ao final, o notebook também calcula a eficiência relativa aos vizinhos KNN:
até 0,8 vez a mediana é **eficiente**, acima de 1,2 vez é **ineficiente** e os
demais casos são **normais**. A nota de 0 a 100 usa 70 pontos como equivalência
aos vizinhos. O modelo de implantação é exportado em ONNX e seu contrato de
integração está documentado em
[`equipe-dados/resultados_modelagem_uso/INTEGRACAO_BACKEND_ONNX.md`](equipe-dados/resultados_modelagem_uso/INTEGRACAO_BACKEND_ONNX.md).

O domínio operacional é limitado a contas de até 400 kWh. Casos acima desse
valor não participam do ajuste nem das métricas principais e recebem um
disclaimer explícito. A explicabilidade combina SHAP global e comparação KNN
com residências semelhantes.

O tratamento de outliers utiliza limites de 1% e 99% aprendidos exclusivamente
no conjunto de treino. O conjunto de teste não tem observações removidas. Mesmo
com as melhorias, o R² permaneceu abaixo de 0,50 na validação e no teste. Isso
indica limitação preditiva das variáveis disponíveis; o projeto não apresenta
um R² artificialmente superior por meio de divisão aleatória, vazamento do alvo
ou exclusão de casos difíceis do teste.

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
- `scikit-learn`: pipelines, pré-processamento, validação e modelos de referência;
- `xgboost`: modelos de gradient boosting regularizados;
- `jupyterlab`: execução interativa dos notebooks.
- `onnx`, `skl2onnx` e `onnxruntime`: exportação e inferência portátil do modelo.

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
