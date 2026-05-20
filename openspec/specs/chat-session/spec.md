# chat-session Specification

## Purpose
TBD - created by archiving change ai-chat-with-memory. Update Purpose after archive.
## Requirements
### Requirement: Criar nova conversa autenticada
O sistema MUST permitir que um usuário autenticado crie uma nova sessão de conversa associada ao seu `user_id`. A conversa deve ser iniciada vazia e ter seu `title` gerado automaticamente a partir das primeiras 50 caracteres da primeira mensagem enviada.

#### Scenario: Usuário cria uma nova conversa
- **WHEN** o usuário autenticado faz `POST /chat/conversations` com um JWT válido
- **THEN** o sistema retorna `201 Created` com o `id` UUID da nova conversa e `title` null

#### Scenario: Usuário não autenticado tenta criar conversa
- **WHEN** uma requisição `POST /chat/conversations` é feita sem token JWT ou com token inválido
- **THEN** o sistema retorna `401 Unauthorized`

### Requirement: Listar conversas do usuário
O sistema MUST retornar apenas as conversas pertencentes ao usuário autenticado, ordenadas pela data de atualização mais recente, com paginação (cursor-based ou offset).

#### Scenario: Listagem de conversas do usuário
- **WHEN** o usuário autenticado faz `GET /chat/conversations`
- **THEN** o sistema retorna uma lista de conversas com `id`, `title`, `created_at`, `updated_at` apenas desse usuário

#### Scenario: Listagem vazia para novo usuário
- **WHEN** o usuário autenticado não possui nenhuma conversa
- **THEN** o sistema retorna `200 OK` com lista vazia `[]`

### Requirement: Cobertura e Validação por Testes
O sistema MUST garantir que todo o código correspondente a esta spec seja coberto e validado por testes automatizados (unitários e integrados).

#### Scenario: Testes de endpoints de sessão
- **WHEN** a suite de testes é executada contra o ambiente de teste
- **THEN** todos os endpoints de criação e listagem de conversas passam com usuário autenticado e retornam 401 sem autenticação

