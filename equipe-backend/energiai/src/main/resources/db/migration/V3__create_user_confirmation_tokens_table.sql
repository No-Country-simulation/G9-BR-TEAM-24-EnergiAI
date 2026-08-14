-- Migration V3: Criar tabela de tokens de confirmação de e-mail e constraint relacional com a tabela de consumos

CREATE TABLE user_confirmation_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL CONSTRAINT uk_user_tokens_token UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_confirmation_tokens_token ON user_confirmation_tokens(token);

-- Constraint de chave estrangeira relacionando consumos com a tabela users
ALTER TABLE consumos 
    ADD CONSTRAINT fk_consumos_user 
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL;
