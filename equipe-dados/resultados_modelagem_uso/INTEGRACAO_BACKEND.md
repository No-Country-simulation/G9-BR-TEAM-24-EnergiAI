# Contrato EnergiAI 2.0 para o back-end

O Spring Boot deve carregar `modelo_consumo_referencia.onnx`. O modelo recebe
cinco campos e retorna o consumo de referência de uma residência semelhante.
Classificação, custo e recomendações são regras de negócio documentadas abaixo.

## POST `/analise-energetica`

Entrada completa:

```json
{
  "consumo_kwh": 420.0,
  "uso_horario_pico": true,
  "quantidade_equipamentos": 10.0,
  "tipo_imovel": "Casa",
  "horas_alto_consumo": 4.0,
  "moradores": 3.0,
  "regiao": "Sudeste",
  "quantidade_ar_condicionado": 1.0
}
```

Entradas ONNX, todas com shape `[1,1]`:

| Campo | Tipo ONNX |
|---|---|
| `quantidade_equipamentos` | `float` |
| `tipo_imovel` | `string` |
| `moradores` | `float` |
| `regiao` | `string` |
| `quantidade_ar_condicionado` | `float` |

A saída `variable` é um `float[1,1]`: `consumo_referencia_kwh`.

## Classificação

Calcule `indice = consumo_kwh / consumo_referencia_kwh`:

- índice ≤ 0,85: `Eficiente`;
- 0,85 < índice < 1,15: `Moderado`;
- índice ≥ 1,15: `Ineficiente`.

A incerteza residual e os limites também estão em `manifesto_modelo.json`.
O cálculo de probabilidade de referência está implementado na função `analisar`
do notebook `treinamento_exportacao_modelo_energia.ipynb`.

O custo mensal é `consumo_kwh × 0,75`. A tarifa fica no manifesto para permitir
atualização sem retreinar.

## Validação

- `consumo_kwh`: 1 a 5.000;
- `quantidade_equipamentos`: 0 a 200;
- `horas_alto_consumo`: 0 a 4;
- `moradores`: 1 a 30;
- `quantidade_ar_condicionado`: 0 a 30;
- `uso_horario_pico`: booleano;
- `tipo_imovel`: `Casa`, `Apartamento` ou `Quarto ou cômodo`;
- `regiao`: uma das cinco regiões brasileiras.

Retorne HTTP 400 para contrato inválido e HTTP 422 para valor fora do domínio.

## Recomendações

- uso no pico: distribuir cargas fora de 18h–21h;
- três ou quatro horas de alto consumo: alternar atividades;
- presença de ar-condicionado: portas fechadas e temperatura próxima de 23 °C;
- mais de cinco equipamentos por morador: evitar stand-by e priorizar ENCE A;
- perfil ineficiente: revisar banho elétrico, refrigeração e cargas resistivas.

[`tres_exemplos_api.json`](tres_exemplos_api.json) contém três requisições e
respostas completas. `modelo_energia.joblib` existe para testes Python; não deve
ser carregado pela aplicação Java.
