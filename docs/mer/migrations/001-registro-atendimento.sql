-- Executar no banco existente. Não recria nem apaga usuários ou atendimentos.
USE nassau_tickets;

CREATE TABLE IF NOT EXISTS registros_atendimento (
    atendimento_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    tipo_atendimento VARCHAR(30) NOT NULL,
    setor VARCHAR(30) NOT NULL,
    observacao VARCHAR(200) NOT NULL DEFAULT '',
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_registro_atendimento
        FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id)
) ENGINE=InnoDB;
