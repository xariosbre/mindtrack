-- database/migrations/003_create_moods.sql
-- Cria a tabela de avaliações de humor.

CREATE TABLE `avaliacoes_humor` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `data_avaliacao` DATE NOT NULL UNIQUE,
    `nota_humor` INT NOT NULL,
    `observacoes` TEXT,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    CHECK (`nota_humor` >= 1 AND `nota_humor` <= 5)
);