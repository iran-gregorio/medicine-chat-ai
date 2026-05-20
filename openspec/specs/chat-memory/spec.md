# chat-memory Specification

## Purpose
TBD - created by archiving change ai-chat-with-memory. Update Purpose after archive.
## Requirements
### Requirement: Persistir mensagens com histórico contextual
O sistema MUST persistir cada mensagem do usuário e cada resposta da IA na tabela `messages`, vinculada à `conversation_id`. Ao invocar o LLM, o sistema MUST injetar as mensagens recentes da conversa como contexto, limitadas a `CONTEXT_WINDOW_MESSAGES` (padrão: 20 mensagens mais recentes).

#### Scenario: Envio de mensagem com histórico
- **WHEN** o usuário autenticado faz `POST /chat/conversations/{id}/messages` com `{"message": "Qual a dosagem?"}`
- **THEN** o sistema carrega as últimas 20 mensagens da conversa, injeta no prompt como histórico, invoca o LLM, persiste a resposta com `role='assistant'` e retorna `{"reply": "...", "message_id": "..."}`

#### Scenario: Conversa sem histórico (primeira mensagem)
- **WHEN** é a primeira mensagem em uma conversa
- **THEN** o sistema invoca o LLM sem histórico contextual e gera o `title` da conversa com as primeiras 50 chars da mensagem do usuário

### Requirement: Resumo automático ao exceder limite de tokens
O sistema MUST gerar um resumo da conversa via LLM quando o total estimado de tokens do histórico ultrapassar `SUMMARY_TOKEN_THRESHOLD` (padrão: 2000). O resumo é armazenado em `conversations.summary` e as mensagens antigas são excluídas do contexto injetado (mas não do banco), mantendo as últimas 5 mensagens reais para continuidade.

#### Scenario: Histórico excede threshold de tokens
- **WHEN** o histórico acumulado de uma conversa ultrapassa 2000 tokens
- **THEN** o sistema gera um resumo via LLM, persiste em `conversations.summary`, e nas próximas chamadas usa `[summary + últimas 5 mensagens]` como contexto

#### Scenario: Resumo não apaga mensagens do banco
- **WHEN** o resumo automático é acionado
- **THEN** as mensagens antigas permanecem na tabela `messages` (para auditoria) mas não são incluídas no contexto enviado ao LLM

### Requirement: Purge automático de mensagens com mais de 7 dias
O sistema MUST executar diariamente uma tarefa de limpeza que remove todas as mensagens com `created_at` inferior a `NOW() - INTERVAL '7 days'`. Conversas sem mensagens restantes MUST também ser removidas.

#### Scenario: Purge diário bem-sucedido
- **WHEN** o job de purge é executado
- **THEN** todas as mensagens com mais de 7 dias são deletadas e conversas vazias são removidas

#### Scenario: Purge não afeta mensagens recentes
- **WHEN** o job de purge é executado
- **THEN** mensagens com `created_at` dentro dos últimos 7 dias permanecem intactas

### Requirement: Cobertura e Validação por Testes
O sistema MUST garantir que todo o código correspondente a esta spec seja coberto e validado por testes automatizados (unitários e integrados).

#### Scenario: Testes de memória e purge
- **WHEN** a suite de testes é executada
- **THEN** os testes validam: injeção de histórico, acionamento de resumo, e execução correta do job de purge

