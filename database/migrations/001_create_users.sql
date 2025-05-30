-- database/migrations/001_create_users.sql
-- Cria a tabela de usuários e a tabela de tokens de recuperação de senha.

CREATE TABLE `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `senha` VARCHAR(255) NOT NULL,
    `tipo_usuario` ENUM('usuario', 'admin') DEFAULT 'usuario',
    `foto_perfil` VARCHAR(255) DEFAULT NULL,
    `ativo` BOOLEAN DEFAULT TRUE,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `tokens_recuperacao` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `expiracao` TIMESTAMP NOT NULL,
    `usado` BOOLEAN DEFAULT FALSE,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);