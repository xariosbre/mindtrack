-- database/migrations/002_create_habits.sql
-- Cria tabelas relacionadas a hábitos: categorias e hábitos em si, e registros de hábitos.

CREATE TABLE `categorias_habitos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(100) NOT NULL UNIQUE,
    `cor` VARCHAR(7) DEFAULT NULL,
    `icone` VARCHAR(50) DEFAULT NULL,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `habitos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `categoria_id` INT,
    `nome` VARCHAR(255) NOT NULL,
    `descricao` TEXT,
    `frequencia` VARCHAR(50) DEFAULT 'diario',
    `tipo_medicao` ENUM('quantitativo', 'binario') DEFAULT 'binario',
    `unidade` VARCHAR(50) DEFAULT NULL,
    `meta_diaria` DECIMAL(10, 2) DEFAULT NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`categoria_id`) REFERENCES `categorias_habitos`(`id`) ON DELETE SET NULL
);

CREATE TABLE `registros_habitos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `habito_id` INT NOT NULL,
    `usuario_id` INT NOT NULL,
    `data_registro` DATE NOT NULL,
    `valor` DECIMAL(10, 2) DEFAULT NULL,
    `concluido` BOOLEAN DEFAULT FALSE,
    `observacoes` TEXT,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`habito_id`) REFERENCES `habitos`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    UNIQUE (`habito_id`, `data_registro`)
);