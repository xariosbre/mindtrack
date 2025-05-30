-- database/migrations/004_create_goals.sql
-- Cria a tabela de metas.

CREATE TABLE `metas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT,
    `habito_id` INT DEFAULT NULL,
    `tipo_meta` ENUM('habito', 'humor', 'custom') NOT NULL,
    `valor_meta` DECIMAL(10, 2) NOT NULL,
    `periodo` ENUM('diario', 'semanal', 'mensal', 'anual') DEFAULT 'diario',
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE DEFAULT NULL,
    `ativa` BOOLEAN DEFAULT TRUE,
    `notificacoes` BOOLEAN DEFAULT TRUE,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`habito_id`) REFERENCES `habitos`(`id`) ON DELETE SET NULL
);