-- Migration V4: Adicionar coluna reference_month, colunas de resultado de IA e constraint UNIQUE (usuario_id, reference_month) na tabela consumos

ALTER TABLE consumos 
    ADD COLUMN reference_month DATE,
    ADD COLUMN categoria_ia VARCHAR(50),
    ADD COLUMN probabilidade_ia NUMERIC(5, 4),
    ADD COLUMN custo_estimado_mensal NUMERIC(10, 2);

-- Adicionar constraint de unicidade para evitar duplicidade de análise no mesmo mês para o mesmo usuário
ALTER TABLE consumos
    ADD CONSTRAINT uk_consumos_usuario_reference_month UNIQUE (usuario_id, reference_month);

CREATE INDEX idx_consumos_reference_month ON consumos(reference_month);
