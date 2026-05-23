## MODIFIED Requirements

### Requirement: Resumo automático ao exceder limite de tokens
O sistema MUST gerar um resumo da conversa via componentes nativos do LangChain (ex: `ConversationSummaryBufferMemory`) quando o total estimado de tokens do histórico ultrapassar `SUMMARY_TOKEN_THRESHOLD` (padrão: 2000). O resumo é gerenciado automaticamente e as mensagens excedentes são consolidadas, mantendo o controle transparente do limite da janela de contexto enviada ao LLM.

#### Scenario: Histórico excede threshold de tokens
- **WHEN** o histórico acumulado de uma conversa ultrapassa 2000 tokens na memória
- **THEN** a abstração de memória nativa do sistema gera automaticamente um resumo das mensagens antigas, mantendo o limite do tamanho do contexto nas próximas interações da LLM

#### Scenario: Resumo não apaga mensagens do banco
- **WHEN** o resumo automático é acionado pela abstração de memória
- **THEN** as mensagens originais passadas permanecem na tabela `messages` principal (para visualização no front-end) mas o contexto compactado é o que transita na integração com a LLM
