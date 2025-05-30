-- Desativar verificações de chave estrangeira temporariamente para permitir a criação/recriação de tabelas
SET FOREIGN_KEY_CHECKS = 0;

-- Tabela de Usuários (HU01 - Cadastro, HU04 - Perfil, HU05 - Perfis de Acesso)
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `senha` VARCHAR(255) NOT NULL, -- Senha hashed (bcrypt)
    `tipo_usuario` ENUM('usuario', 'admin') DEFAULT 'usuario', -- HU05
    `foto_perfil` VARCHAR(255) DEFAULT NULL, -- HU04
    `ativo` BOOLEAN DEFAULT TRUE, -- Para desativação lógica (HU05)
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela para Tokens de Recuperação de Senha (HU03 - Recuperação de Senha)
DROP TABLE IF EXISTS `tokens_recuperacao`;
CREATE TABLE `tokens_recuperacao` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `expiracao` TIMESTAMP NOT NULL,
    `usado` BOOLEAN DEFAULT FALSE,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
);

-- Tabela de Categorias de Hábitos (Para organizar hábitos, conforme `HabitCategory` no `habit.py`)
DROP TABLE IF EXISTS `categorias_habitos`;
CREATE TABLE `categorias_habitos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(100) NOT NULL UNIQUE,
    `cor` VARCHAR(7) DEFAULT NULL, -- Ex: #RRGGBB
    `icone` VARCHAR(50) DEFAULT NULL, -- Ex: nome de um ícone de biblioteca (FontAwesome, Material Icons)
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Hábitos (HU06 - Criação/Gerenciamento de Hábitos)
DROP TABLE IF EXISTS `habitos`;
CREATE TABLE `habitos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `categoria_id` INT,
    `nome` VARCHAR(255) NOT NULL,
    `descricao` TEXT,
    `frequencia` VARCHAR(50) DEFAULT 'diario', -- Ex: 'diario', 'semanal', 'mensal', 'dias_especificos'
    `tipo_medicao` ENUM('quantitativo', 'binario') DEFAULT 'binario', -- 'quantitativo' (valor numérico), 'binario' (sim/não)
    `unidade` VARCHAR(50) DEFAULT NULL, -- Ex: 'minutos', 'litros', 'páginas', 'vezes'
    `meta_diaria` DECIMAL(10, 2) DEFAULT NULL, -- Para hábitos quantitativos
    `ativo` BOOLEAN DEFAULT TRUE, -- Para desativação lógica
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`categoria_id`) REFERENCES `categorias_habitos`(`id`) ON DELETE SET NULL
);

-- Tabela de Registros de Hábitos (HU06 - Registro de Progresso)
DROP TABLE IF EXISTS `registros_habitos`;
CREATE TABLE `registros_habitos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `habito_id` INT NOT NULL,
    `usuario_id` INT NOT NULL, -- Redundante mas útil para otimização de queries
    `data_registro` DATE NOT NULL,
    `valor` DECIMAL(10, 2) DEFAULT NULL, -- Para hábitos quantitativos
    `concluido` BOOLEAN DEFAULT FALSE, -- Para hábitos binários ou indicação de meta atingida
    `observacoes` TEXT,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`habito_id`) REFERENCES `habitos`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    UNIQUE (`habito_id`, `data_registro`) -- Garante apenas um registro por hábito por dia
);

-- Tabela de Avaliações de Humor (HU07 - Avaliar Humor Diário)
DROP TABLE IF EXISTS `avaliacoes_humor`;
CREATE TABLE `avaliacoes_humor` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `data_avaliacao` DATE NOT NULL UNIQUE, -- Uma avaliação por dia por usuário
    `nota_humor` INT NOT NULL, -- Escala de 1 a 5 (conforme `mood.py`)
    `observacoes` TEXT,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    CHECK (`nota_humor` >= 1 AND `nota_humor` <= 5)
);

-- Tabela de Metas (HU09 - Definir Metas)
DROP TABLE IF EXISTS `metas`;
CREATE TABLE `metas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT,
    `habito_id` INT DEFAULT NULL, -- Se a meta estiver ligada a um hábito específico
    `tipo_meta` ENUM('habito', 'humor', 'custom') NOT NULL, -- Ex: 'atingir X no hábito Y', 'manter humor Z', 'objetivo livre'
    `valor_meta` DECIMAL(10, 2) NOT NULL, -- Valor numérico da meta (ex: 50min, nota 4, etc.)
    `periodo` ENUM('diario', 'semanal', 'mensal', 'anual') DEFAULT 'diario', -- Ex: 'diario', 'semanal' para metas de humor
    `data_inicio` DATE NOT NULL,
    `data_fim` DATE DEFAULT NULL,
    `ativa` BOOLEAN DEFAULT TRUE,
    `notificacoes` BOOLEAN DEFAULT TRUE,
    `data_criacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `data_atualizacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`habito_id`) REFERENCES `habitos`(`id`) ON DELETE SET NULL
);


-- Habilitar verificações de chave estrangeira novamente
SET FOREIGN_KEY_CHECKS = 1;