-- Inserir categorias de hábitos padrão (se desejar algumas pré-definidas)
INSERT INTO `categorias_habitos` (`nome`, `cor`, `icone`) VALUES
('Saúde e Bem-Estar', '#28a745', 'heart'),
('Produtividade', '#007bff', 'briefcase'),
('Aprendizado', '#ffc107', 'book'),
('Finanças', '#6f42c1', 'dollar-sign'),
('Relacionamentos', '#fd7e14', 'users'),
('Hobbies', '#17a2b8', 'paint-brush');

-- Exemplo de inserção de um usuário administrador inicial (senha é 'admin123' hashed)
-- Use um gerador de bcrypt para obter o hash real para segurança em produção
-- Para bcrypt('admin123'), um hash pode ser: $2b$12$EXAMPLEHASHSTRING.EXAMPLEHASHSTRING
-- Você DEVE gerar um hash real em vez de usar um placeholder em produção.
-- No seu código Python, você usaria `bcrypt.hashpw(b'admin123', bcrypt.gensalt())`
INSERT INTO `usuarios` (`nome`, `email`, `senha`, `tipo_usuario`) VALUES
('Admin Inicial', 'admin@example.com', '$2b$12$pG/Jk2bX4xYj5D3z7k9O3u.Q2mS7hL6eQ8fG1i2j3k4l5m6n7o8p9q0r1s2t3u', 'admin'); -- Placeholder hash, substitua!

-- Adicione outros dados iniciais conforme necessário, ex:
-- INSERT INTO `habitos` (...) VALUES (...);
-- INSERT INTO `metas` (...) VALUES (...);