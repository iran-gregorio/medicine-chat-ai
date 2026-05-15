# password-recovery Specification

## Purpose
TBD - created by archiving change auth-screens. Update Purpose after archive.
## Requirements
### Requirement: Recuperação via E-mail
O sistema MUST permitir a solicitação de recuperação de senha por e-mail, enviando um link seguro com token.

#### Scenario: Solicitação de reset
- **GIVEN** um e-mail cadastrado `user@example.com`
- **WHEN** o usuário solicita `POST /auth/forgot-password`
- **THEN** o sistema gera um token e envia o e-mail de recuperação

### Requirement: Redefinição de Senha
O sistema MUST permitir a redefinição da senha usando um token válido e não expirado.

#### Scenario: Redefinição bem-sucedida
- **GIVEN** um token de reset válido para um usuário
- **WHEN** o usuário envia `POST /auth/reset-password` com a nova senha
- **THEN** o sistema atualiza a senha e invalida o token

