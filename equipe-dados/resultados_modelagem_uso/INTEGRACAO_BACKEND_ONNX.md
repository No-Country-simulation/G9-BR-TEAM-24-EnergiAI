# Integração do modelo ONNX

O artefato de implantação é `modelo_features_uso.onnx`. A extensão padronizada
é `.onnx`; `.oxnn` não é um formato reconhecido pelo ONNX Runtime. O arquivo
`manifesto_onnx.json` é o contrato de entradas, saída, domínio e regra de
eficiência.

## Fluxo recomendado

1. Carregue uma única `InferenceSession` na inicialização da API.
2. Valide e transforme o formulário nas features descritas no manifesto.
3. Envie cada feature como uma matriz de uma linha: `float32` para números e
   `string` para `uf`.
4. Obtenha `consumo_estimado_kwh` do ONNX.
5. Consulte as residências comparáveis na base KNN e calcule a mediana de
   consumo dos vizinhos.
6. Use o consumo real informado, quando disponível, para calcular eficiência.
   Se ele não existir, use a previsão e identifique essa origem na resposta.
7. Compare somente features acionáveis com a mediana dos vizinhos para gerar
   recomendações. Elas são associações, não garantias causais.

O ONNX contém a regressão, mas não a base de vizinhos nem o SHAP. Esses
componentes devem ficar em um serviço analítico separado ou ser materializados
em uma tabela versionada.

## Exemplo em Python

```python
from pathlib import Path

import numpy as np
import onnxruntime as ort

MODEL_PATH = Path("modelo_features_uso.onnx")
session = ort.InferenceSession(
    str(MODEL_PATH),
    providers=["CPUExecutionProvider"],
)


def prever_consumo(features: dict) -> float:
    inputs = {}
    for item in session.get_inputs():
        value = features[item.name]
        dtype = object if item.type == "tensor(string)" else np.float32
        inputs[item.name] = np.asarray([[value]], dtype=dtype)
    prediction = session.run(None, inputs)[0]
    return float(np.asarray(prediction).reshape(-1)[0])


def avaliar_eficiencia(consumo_kwh: float, mediana_vizinhos_kwh: float) -> dict:
    if mediana_vizinhos_kwh <= 0:
        raise ValueError("A mediana dos vizinhos deve ser positiva.")

    ratio = consumo_kwh / mediana_vizinhos_kwh
    classification = (
        "eficiente" if ratio <= 0.80
        else "ineficiente" if ratio > 1.20
        else "normal"
    )
    score = float(np.clip(140.0 - 70.0 * ratio, 0.0, 100.0))
    return {
        "razao_consumo_vizinhos": round(ratio, 3),
        "classificacao_eficiencia": classification,
        "nota_eficiencia_0_100": round(score, 1),
    }
```

## Contrato sugerido da resposta

```json
{
  "previsao_kwh": 254.72,
  "consumo_usado_na_eficiencia_kwh": 310.0,
  "origem_consumo_eficiencia": "informado_pelo_usuario",
  "mediana_vizinhos_kwh": 243.0,
  "razao_consumo_vizinhos": 1.276,
  "classificacao_eficiencia": "ineficiente",
  "nota_eficiencia_0_100": 50.7,
  "recomendacoes": [],
  "disclaimer": "Modelo válido prioritariamente até 400 kWh."
}
```

Para produção, versione juntos o ONNX, o manifesto, a transformação das
features e a referência KNN. Monitore erro por faixa de consumo e não apresente
recomendação quando não houver vizinhos suficientemente próximos.
