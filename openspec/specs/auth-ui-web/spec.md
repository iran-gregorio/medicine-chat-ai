# auth-ui-web Specification

## Purpose
TBD - created by archiving change auth-screens. Update Purpose after archive.
## Requirements
### Requirement: Interface de Autenticação Web
O sistema MUST prover telas de Login, Cadastro e Recuperação de Senha seguindo a identidade visual da plataforma.

#### Scenario: Acesso à tela de Login
- **GIVEN** um usuário não autenticado
- **WHEN** acessa a rota `/login`
- **THEN** o sistema exibe o formulário de login com campos identifier e password

### Requirement: Persistência e Segurança de Sessão
O sistema MUST persistir os tokens JWT no localStorage e usar interceptors para refresh automático.

#### Scenario: Refresh de Token automático
- **GIVEN** uma sessão com token expirado e refresh token válido
- **WHEN** o usuário faz uma requisição à API
- **THEN** o interceptor realiza o refresh e completa a requisição original

