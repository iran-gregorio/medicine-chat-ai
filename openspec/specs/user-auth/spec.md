## ADDED Requirements

### Requirement: Registro e Login
O sistema MUST permitir que os usuários se registrem e façam login através de email/senha ou provedores sociais (OAuth), gerando um token JWT seguro para comunicação com a API em Python.

#### Scenario: Login bem-sucedido no App Mobile
- **WHEN** o usuário insere credenciais válidas na tela de login do Flutter
- **THEN** o sistema autentica o usuário e retorna um JWT que permite o acesso às rotas protegidas da API de Chat

### Requirement: Sincronização entre plataformas
O sistema MUST garantir que, uma vez autenticado via Web (React) ou Mobile (Flutter), o usuário consiga visualizar todo o seu histórico de chats, receitas processadas e configurações de perfil de forma consistente, pois os dados são lidos do mesmo backend e PostgreSQL.

#### Scenario: Acesso cross-platform
- **WHEN** o usuário inicia um chat pelo App Web e depois faz login na sua conta pelo App Mobile
- **THEN** a lista de conversas e o conteúdo daquele chat estão perfeitamente sincronizados na nova sessão

### Requirement: Cobertura e Validação por Testes
O sistema MUST garantir que todo o código correspondente a esta spec seja coberto e validado por testes automatizados (unitários e integrados), com suporte a execução no ambiente de testes local (docker-compose).

