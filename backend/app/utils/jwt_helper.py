# A maioria das funcionalidades JWT é tratada diretamente por flask_jwt_extended.
# Este arquivo pode ser usado para funções auxiliares se a complexidade aumentar,
# por exemplo:
# - Gerenciar tokens de refresh
# - Adicionar claims customizados aos tokens
# - Implementar um mecanismo de blacklist de tokens

# Por enquanto, a funcionalidade básica de JWT é coberta pelas rotas de autenticação
# e pelos decorators de jwt_required.