-- Migration V1: Criar tabela de consumos de energia elétrica

CREATE TABLE consumos (
    id BIGSERIAL PRIMARY KEY,
    consumo_kwh NUMERIC(10, 2) NOT NULL CONSTRAINT chk_consumos_consumo_kwh CHECK (consumo_kwh >= 0),
    uso_horario_pico BOOLEAN NOT NULL,
    quantidade_equipamentos INTEGER NOT NULL CONSTRAINT chk_consumos_qtd_equipamentos CHECK (quantidade_equipamentos >= 1),
    tipo_imovel VARCHAR(100) NOT NULL,
    horas_alto_consumo INTEGER NOT NULL CONSTRAINT chk_consumos_horas_alto CHECK (horas_alto_consumo >= 0 AND horas_alto_consumo <= 24),
    quantidade_ar_condicionado INTEGER NOT NULL CONSTRAINT chk_consumos_qtd_ac CHECK (quantidade_ar_condicionado >= 0),
    moradores INTEGER NOT NULL CONSTRAINT chk_consumos_moradores CHECK (moradores >= 1),
    regiao VARCHAR(50) NOT NULL,
    usuario_id BIGINT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices essenciais para relatórios, filtros de usuário e análises temporais
CREATE INDEX idx_consumos_usuario_id ON consumos(usuario_id);
CREATE INDEX idx_consumos_created_at ON consumos(created_at);
CREATE INDEX idx_consumos_tipo_regiao ON consumos(tipo_imovel, regiao);
