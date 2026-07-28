# Dicionário da base analítica EnergiAI

## Identificação e proveniência

Arquivo analisado: `dados_pph2019_tratados_regressao.csv`.

A base é gerada pelo notebook
`tratamento_dados_energia_regressao.ipynb` a partir de:

1. `PPH 2019 - Banco de Dados V2.xlsx`: Pesquisa de Posse e Hábitos de
   Uso de Equipamentos Elétricos na Classe Residencial, realizada pelo
   Procel/Eletrobras. A aba `Banco de Dados` contém as respostas; `Texto das
   perguntas` e `Texto das alternativas` documentam os códigos.
2. `2019.csv`: observações meteorológicas horárias do INMET em 2019, utilizadas
   somente para calcular temperatura média por UF.

A fonte PPH possui 18.775 entrevistas e 27.826 linhas. A diferença ocorre porque
uma entrevista pode ocupar várias linhas. Conforme a orientação oficial sobre a
estrutura da PPH, `LOOP=1` representa a primeira unidade e loops posteriores
representam unidades adicionais de algum equipamento.

A saída possui uma linha por `ENTREVISTA`. Apenas 2.412 residências com pelo
menos seis meses de consumo positivo são mantidas para modelagem. Nenhum limite
superior de consumo é aplicado.

## Convenções de agregação

| Código | Regra |
|---|---|
| `primeiro válido` | Usado em respostas domiciliares repetidas entre loops. Recupera a primeira resposta preenchida da entrevista. |
| `soma entre loops` | Usada em medidas pertencentes a cada unidade de aparelho, como frequência e duração. |
| `média entre loops` | Usada em características médias dos aparelhos, como temperatura do ar-condicionado. |
| `máximo entre loops` | Usado em blocos domiciliares repetidos integralmente, como iluminação e marcações horárias. |
| `ausente` | Resposta não aplicável ou não informada permanece vazia. Não é convertida indiscriminadamente em zero. |
| `zero estrutural` | Aplicado somente quando a estrutura permite concluir ausência, por exemplo, soma de quantidades de um grupo não possuído. |

As frequências categóricas de uso são convertidas em vezes por semana:
`1→6,5`, `2→4,5`, `3→2,5`, `4→1`, `5→0,5`, `6→0,25`, `7→0`.

As durações categóricas são convertidas para pontos médios:
até 10 min = 5 min; 11–30 = 20,5 min; 31–60 = 45,5 min;
61–120 = 90,5 min; 2h01–4h = 3 h; 4h01–6h = 5 h;
6h01–12h = 9 h; 12h01–23h59 = 18 h; 24h = 24 h.

## Colunas

| Coluna | Tipo/unidade | Origem PPH/INMET | Agregação e tratamento | Uso |
|---|---|---|---|---|
| `id_entrevista` | inteiro | `ENTREVISTA` | Identificador único após consolidação. | Auditoria; nunca feature. |
| `uf` | categoria | `UF` | Primeiro válido por entrevista. | Análise; não entra no MVP. |
| `municipio` | categoria | `MUNICIPIO` | Primeiro válido por entrevista. | Auditoria; nunca feature. |
| `escolaridade_chefe` | código | `P3.4` | Primeiro válido. É escolaridade do chefe, não tipo de imóvel. | Análise; não entra no MVP. |
| `moradores_habituais` | pessoas | `P4.1_1` | Primeiro válido. | Engenharia de `moradores_total`. |
| `moradores_ocasionais` | pessoas | `P4.1_2` | Primeiro válido. | Engenharia de `moradores_total`. |
| `tipo_domicilio` | código | `P5.1` | Primeiro válido. `1=Casa`, `2=Apartamento`, `3=Quarto ou cômodo`. | Feature `tipo_imovel`. |
| `cor_paredes` | código | `P5.3` | Primeiro válido. | Análise. |
| `orientacao_janelas` | código | `P5.4` | Primeiro válido. | Análise. |
| `janelas_multiplas_paredes` | código | `P5.5` | Primeiro válido. | Análise. |
| `area_m2` | m² | `P5.7_1_TXT` | Primeiro valor numérico positivo; demais ficam ausentes. | Análise, descartada pelo modelo compacto. |
| `material_paredes` | código | `P5.8` | Primeiro válido. Não representa chuveiro elétrico. | Análise. |
| `material_cobertura` | código | `P5.9` | Primeiro válido. | Análise. |
| `telhado_visivel` | código | `P5.10` | Primeiro válido. | Análise. |
| `uso_comercial` | código | `P5.13` | Primeiro válido; indica atividade comercial/industrial no domicílio. | Análise. |
| `moradores_total` | pessoas | `P4.1_1 + P4.1_2` | Soma de moradores habituais e ocasionais. | Feature `moradores`. |
| `regiao` | categoria | Derivada de `UF` | Mapeamento oficial das UFs para cinco regiões. | Feature do modelo. |
| `meses_consumo_validos` | meses | `P5.15.2_1` a `P5.15.2_12` | Contagem de meses numéricos e positivos. Mínimo 6. | Qualidade; nunca feature. |
| `consumo_medio_kwh` | kWh/mês | `P5.15.2_1` a `P5.15.2_12` | Média dos meses válidos. | Alvo supervisionado. |
| `consumo_mediano_kwh` | kWh/mês | `P5.15.2_1` a `P5.15.2_12` | Mediana dos meses válidos. | Auditoria robusta do alvo. |
| `consumo_iqr_kwh` | kWh | `P5.15.2_1` a `P5.15.2_12` | Percentil 75 menos percentil 25. | Variabilidade; nunca feature. |
| `lampadas_total` | unidades | `P6.1.2.*_*_TXT` | Soma de tipos/ambientes na linha e máximo por entrevista. | Análise. |
| `refrigeradores_qtd` | unidades | `P7.1` | Primeiro válido; quantidade domiciliar declarada. | Soma de equipamentos. |
| `freezers_qtd` | unidades | `P7.2` | Primeiro válido. | Soma de equipamentos. |
| `ar_qtd` | unidades | `P7.3` | Primeiro válido. | Feature `quantidade_ar_condicionado`. |
| `tv_qtd` | unidades | `P8.1` | Primeiro válido. | Soma de equipamentos. |
| `microondas_qtd` | unidades | `P8.2` | Primeiro válido. | Soma de equipamentos. |
| `lavadora_qtd` | unidades | `P8.3` | Primeiro válido. | Soma de equipamentos. |
| `chuveiros_qtd` | unidades | `P10.8` | Primeiro válido. | Soma de equipamentos. |
| `refrigerador_freq_semana` | usos/semana | `P7.1.1.4` | Frequência convertida e somada entre loops. | Análise. |
| `freezer_freq_semana` | usos/semana | `P7.2.1.4` | Frequência convertida e somada entre loops. | Análise. |
| `ar_horas_semana_proxy` | faixas×usos/semana | `P7.3.2.2_0..23` e `P7.3.2.4.1..12` | Média mensal de frequência × faixas horárias, somada entre aparelhos. Não é kWh. | Análise. |
| `ar_temperatura_c` | °C | `P7.3.1.6` | Média entre aparelhos; somente 16–30 °C. | Análise. |
| `tv_horas_semana_proxy` | faixas×usos/semana | `P8.1.1.4` e `P8.1.1.2_0..23` | Frequência × faixas, somada entre televisores. | Análise. |
| `microondas_horas_semana_proxy` | h/semana | `P8.2.1.3`, `P8.2.1.4` | Frequência × ponto médio de duração, somada entre loops. | Análise. |
| `lavagens_semana_proxy` | ciclos/semana | `P8.3.1.5_1_TXT`, `P8.3.1.6` | Lavagens por uso × frequência, somada entre loops. | Análise. |
| `chuveiro_kwh_dia_proxy` | kWh/dia | `P10.9.2`, `P10.9.4`, `P10.9.5`, `P10.9.D` | Potência tabelada × duração × banhos; somente fonte elétrica (`P10.9.2=1`), somada entre chuveiros. | Análise; proxy técnico. |
| `banhos_dia` | banhos/dia | `P10.9.5` | Soma entre chuveiros. | Análise. |
| `banho_duracao_media_min` | minutos | `P10.9.D` | Ponto médio da faixa e média entre chuveiros. | Análise. |
| `cozinha_lazer_equipamentos_qtd` | unidades | `P9.1.2.1..40` | Soma das quantidades dos 40 grupos disponíveis. | Parte de `quantidade_equipamentos`. |
| `cozinha_lazer_horas_aparelho_semana` | aparelho×h/semana | `P9.1.2.*`, `P9.1.4.*`, `P9.1.3.*` | Quantidade × frequência × duração por grupo, depois soma. | Análise; intensidade relativa. |
| `conforto_ti_equipamentos_qtd` | unidades | `P9.2.2.1..16` | Soma das quantidades dos 16 grupos. | Parte de `quantidade_equipamentos`. |
| `conforto_ti_horas_aparelho_semana` | aparelho×h/semana | `P9.2.2.*`, `P9.2.4.*`, `P9.2.3.*` | Quantidade × frequência × duração por grupo, depois soma. | Análise; intensidade relativa. |
| `uso_horario_pico` | 0/1 | `P9.2.5.1..16_18..21` | 1 se algum equipamento tem marcação entre 18h e 21h. Máximo entre loops. | Regra de recomendação/API. |
| `horas_alto_consumo` | 0–4 horas | `P9.2.5.1..16_18..21` | Número de horas distintas marcadas no intervalo 18h–21h. | Regra de recomendação/API. |
| `quantidade_equipamentos` | unidades | `P7.1`, `P7.2`, `P7.3`, `P8.1`, `P8.2`, `P8.3`, `P10.8`, `P9.1.2.*`, `P9.2.2.*` | Soma dos sete grupos principais com os 56 grupos P9. Cada quantidade entra uma vez. | Feature do modelo/API. |
| `habito_eficiencia_01` | índice 0–1 | `P11.2.1` | Preferência de compra por equipamentos eficientes. `Sempre=1`, `Normalmente=.67`, `Raramente=.33`, `Nunca=0`, não aplicável=ausente. | Análise. |
| `habito_eficiencia_02` | índice 0–1 | `P11.2.2` | Desliga TV sem espectadores; mesma codificação. | Análise. |
| `habito_eficiencia_03` | índice 0–1 | `P11.2.3` | Evita aparelhos em stand-by. | Análise. |
| `habito_eficiencia_04` | índice 0–1 | `P11.2.4` | Mantém portas/janelas fechadas com ar-condicionado. | Análise. |
| `habito_eficiencia_05` | índice 0–1 | `P11.2.5` | Desliga ar-condicionado ao sair. | Análise. |
| `habito_eficiencia_06` | índice 0–1 | `P11.2.6` | Evita banho demorado com chuveiro elétrico. | Análise. |
| `habito_eficiencia_07` | índice 0–1 | `P11.2.7` | Usa chave verão do chuveiro. | Análise. |
| `habito_eficiencia_08` | índice 0–1 | `P11.2.8` | Evita abrir repetidamente geladeira/freezer. | Análise. |
| `habito_eficiencia_09` | índice 0–1 | `P11.2.9` | Não guarda alimento quente/sem tampa na geladeira. | Análise. |
| `habito_eficiencia_10` | índice 0–1 | `P11.2.10` | Regula termostato da geladeira conforme estação. | Análise. |
| `habito_eficiencia_11` | índice 0–1 | `P11.2.11` | Não usa traseira da geladeira para secar roupas. | Análise. |
| `habito_eficiencia_12` | índice 0–1 | `P11.2.12` | Mantém borracha de vedação da geladeira. | Análise. |
| `habito_eficiencia_13` | índice 0–1 | `P11.2.13` | Usa máquina de lavar em capacidade máxima. | Análise. |
| `habito_eficiencia_14` | índice 0–1 | `P11.2.14` | Acumula roupas para reduzir usos do ferro. | Análise. |
| `habito_eficiencia_15` | índice 0–1 | `P11.2.15` | Desliga ferro ao interromper o serviço. | Análise. |
| `habito_eficiencia_16` | índice 0–1 | `P11.2.16` | Usa temperatura adequada do ferro. | Análise. |
| `habito_eficiencia_17` | índice 0–1 | `P11.2.17` | Prefere lâmpadas LED/fluorescentes. | Análise. |
| `habito_eficiencia_18` | índice 0–1 | `P11.2.18` | Aproveita iluminação natural. | Análise. |
| `habito_eficiencia_19` | índice 0–1 | `P11.2.19` | Apaga luzes de ambientes desocupados. | Análise. |
| `habito_eficiencia_20` | índice 0–1 | `P11.2.20` | Evita instalações elétricas inadequadas. | Análise. |
| `indice_habitos_eficientes` | índice 0–1 | `P11.2.1..20` | Média dos hábitos respondidos, ignorando não aplicáveis. | Análise; não entra no MVP curto. |
| `habitos_respondidos` | contagem 0–20 | `P11.2.1..20` | Número de hábitos aplicáveis/respondidos. | Qualidade. |
| `temperatura_media_uf_c` | °C | INMET `UF`, `CODIGO (WMO)` e temperatura horária | Remove valores fora de −15 a 45 °C; média por estação e depois média das estações da UF. | Análise; não entra no MVP curto. |

## Campos efetivamente usados pelo MVP

O modelo de consumo de referência usa somente:

- `quantidade_equipamentos`;
- `tipo_domicilio`, exposto como `tipo_imovel`;
- `moradores_total`, exposto como `moradores`;
- `regiao`;
- `ar_qtd`, exposto como `quantidade_ar_condicionado`.

O endpoint também recebe `consumo_kwh`, `uso_horario_pico` e
`horas_alto_consumo`. O primeiro define o perfil em relação à referência; os
dois últimos servem para recomendações, pois não melhoraram materialmente a
validação da regressão.

IDs, localização municipal, meses individuais e estatísticas derivadas do alvo
não entram no treinamento.
