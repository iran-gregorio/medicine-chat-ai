# user-registration Specification

## Purpose
TBD - created by archiving change auth-screens. Update Purpose after archive.
## Requirements
### Requirement: Registro de Novo Usuário
O sistema MUST permitir o cadastro de novos usuários validando e-mail único, telefone normalizado e senha segura.

#### Scenario: Registro bem-sucedido
- **GIVEN** um usuário com dados válidos e e-mail `new@example.com`
- **WHEN** o usuário envia `POST /auth/register`
- **THEN** o sistema salva o usuário com senha hasheada e retorna status `201`

