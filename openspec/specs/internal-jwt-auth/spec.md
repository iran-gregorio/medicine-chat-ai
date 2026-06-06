# internal-jwt-auth Specification

## Purpose
TBD - created by archiving change mvp-phase-1-core. Update Purpose after archive.
## Requirements
### Requirement: Autenticação JWT Interna
O sistema SHALL implementar a emissão e validação de tokens JWT (`access_token`) diretamente no backend (`routers/auth.py`), armazenando usuários e senhas hasheadas (via `bcrypt`) no banco de dados PostgreSQL, prescindindo de provedores de identidade externos no MVP.

#### Scenario: Usuário faz login com sucesso e obtém JWT
- **WHEN** o usuário envia credenciais corretas (email e senha) para a rota `/auth/login`
- **THEN** o sistema retorna um Bearer token assinado pelo backend, válido para acesso aos endpoints protegidos

