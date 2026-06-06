## MODIFIED Requirements

### Requirement: Registro e Login
O sistema MUST permitir que os usuários se registrem e façam login através de email/senha utilizando um sistema local do próprio backend, gerando um token JWT seguro. As aplicações clientes (React Web e Flutter Mobile) MUST persistir este token localmente (ex: localStorage ou secure storage) e enviá-lo via cabeçalho `Authorization: Bearer` para consumir as rotas protegidas da API. (vedado OAuth de terceiros para o MVP).

#### Scenario: Login bem-sucedido no App Mobile
- **WHEN** o usuário insere credenciais válidas na tela de login do Flutter
- **THEN** o sistema autentica o usuário via validação de hash, retorna um JWT gerado pelo backend, e o Flutter o armazena e envia no cabeçalho das requisições subsequentes para a API de Chat
