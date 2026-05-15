# user-login Specification

## Purpose
TBD - created by archiving change auth-screens. Update Purpose after archive.
## Requirements
### Requirement: Autenticação Multi-identificador
O sistema MUST permitir login usando e-mail ou telefone, validando a senha com bcrypt e retornando tokens JWT (access e refresh).

#### Scenario: Login com e-mail
- **GIVEN** um usuário cadastrado com e-mail `user@example.com`
- **WHEN** o usuário envia `POST /auth/login` com esse e-mail e senha correta
- **THEN** o sistema retorna status `200` com `access_token` e `refresh_token`

### Requirement: Gerenciamento de Sessão (Refresh/Logout)
O sistema MUST permitir a renovação do access token via refresh token e a revogação ativa do refresh token no logout.

#### Scenario: Logout de usuário
- **GIVEN** um usuário autenticado com um `refresh_token` válido
- **WHEN** o usuário envia `POST /auth/logout` com o token
- **THEN** o sistema revoga o token no banco e retorna `200 OK`

