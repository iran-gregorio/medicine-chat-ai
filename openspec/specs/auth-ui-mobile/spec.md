# auth-ui-mobile Specification

## Purpose
TBD - created by archiving change auth-screens. Update Purpose after archive.
## Requirements
### Requirement: Interface de Autenticação Mobile
O sistema MUST prover telas de Login, Cadastro e Recuperação de Senha no app Flutter usando Riverpod e GoRouter.

#### Scenario: Login no Mobile
- **GIVEN** a tela de login aberta no app
- **WHEN** o usuário insere credenciais e clica em Entrar
- **THEN** o sistema autentica e navega para a Home usando o AuthNotifier

### Requirement: Segurança Mobile
O sistema MUST armazenar tokens JWT de forma segura usando flutter_secure_storage.

#### Scenario: Persistência de Sessão
- **GIVEN** um usuário logado com sucesso
- **WHEN** o app é reiniciado
- **THEN** o sistema lê o token do SecureStorage e mantém o usuário autenticado

