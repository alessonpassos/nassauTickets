CREATE DATABASE nassau_tickets
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nassau_tickets;

-- Usuários do sistema (atendentes)
CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    login VARCHAR(80) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('ATENDENTE', 'GESTOR') NOT NULL DEFAULT 'ATENDENTE',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Guichês
CREATE TABLE guiches (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    numero INT UNSIGNED NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Senhas
CREATE TABLE senhas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    tipo ENUM('SP', 'SE', 'SG') NOT NULL,
    sequencial SMALLINT UNSIGNED NOT NULL,
    data_emissao DATE NOT NULL,
    emitida_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'EMITIDA',
        'AGUARDANDO',
        'CHAMADA',
        'CHAMADA_NOVAMENTE',
        'EM_ATENDIMENTO',
        'ATENDIDA',
        'NAO_COMPARECEU'
    ) NOT NULL DEFAULT 'EMITIDA',
    descartada_em DATETIME NULL,

    UNIQUE KEY uq_senha_sequencial_dia (data_emissao, tipo, sequencial),
    INDEX idx_senhas_fila (status, tipo, emitida_em)
);

-- Atendimentos
CREATE TABLE atendimentos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    senha_id BIGINT UNSIGNED NOT NULL UNIQUE,
    atendente_id BIGINT UNSIGNED NOT NULL,
    guiche_id INT UNSIGNED NOT NULL,
    primeira_chamada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    segunda_chamada_em DATETIME NULL,
    inicio_atendimento_em DATETIME NULL,
    fim_atendimento_em DATETIME NULL,

    CONSTRAINT fk_atendimento_senha
        FOREIGN KEY (senha_id) REFERENCES senhas(id),
    CONSTRAINT fk_atendimento_usuario
        FOREIGN KEY (atendente_id) REFERENCES usuarios(id),
    CONSTRAINT fk_atendimento_guiche
        FOREIGN KEY (guiche_id) REFERENCES guiches(id),

    INDEX idx_atendimentos_data (primeira_chamada_em),
    INDEX idx_atendimentos_atendente (atendente_id),
    INDEX idx_atendimentos_guiche (guiche_id)
);

-- Dados iniciais de exemplo
INSERT INTO guiches (numero) VALUES (1), (2), (3);

-- Registro operacional, um por atendimento; não contém identificação pessoal.
CREATE TABLE IF NOT EXISTS registros_atendimento (
    atendimento_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    tipo_atendimento VARCHAR(30) NOT NULL,
    setor VARCHAR(30) NOT NULL,
    observacao VARCHAR(200) NOT NULL DEFAULT '',
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_registro_atendimento
        FOREIGN KEY (atendimento_id) REFERENCES atendimentos(id)
) ENGINE=InnoDB;
