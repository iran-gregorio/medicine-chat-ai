## Purpose
Esta especificação define os requisitos para o assistente de chat médico, incluindo o uso de RAG com o banco de dados da ANVISA para responder dúvidas de medicamentos de forma contextualizada.
## Requirements
### Requirement: Responder dúvidas sobre medicamentos com contexto da ANVISA
O sistema MUST utilizar LangChain e a técnica RAG (Retrieval-Augmented Generation) acessando os vetores da ANVISA no PostgreSQL para responder a perguntas técnicas sobre medicamentos de forma simples.

#### Scenario: Pergunta sobre interação medicamentosa
- **WHEN** o usuário pergunta se pode misturar medicamento A com medicamento B
- **THEN** o sistema consulta o banco vetorial pelas bulas de A e B e o LLM retorna uma resposta clara sobre os riscos baseada na fonte oficial

### Requirement: Histórico de chat por usuário
O sistema MUST manter o histórico de conversas separado por sessão e associado ao usuário autenticado, persistido no banco de dados PostgreSQL. O histórico MUST ser retido por no máximo **7 dias** a partir da data de criação de cada mensagem, sendo removido automaticamente após esse período. O sistema MUST aplicar resumo automático via LLM quando o histórico exceder `SUMMARY_TOKEN_THRESHOLD` tokens, mantendo as últimas 5 mensagens reais para continuidade do contexto.

#### Scenario: Usuário retoma uma conversa antiga dentro de 7 dias
- **WHEN** o usuário abre uma conversa criada nos últimos 7 dias
- **THEN** o histórico é carregado do banco e a LLM possui contexto das mensagens anteriores dessa sessão específica

#### Scenario: Conversa com histórico resumido
- **WHEN** o histórico da conversa ultrapassa o limiar de tokens e foi resumido
- **THEN** o sistema injeta o resumo + últimas 5 mensagens reais no contexto do LLM

#### Scenario: Mensagens com mais de 7 dias são removidas
- **WHEN** o job de purge diário é executado
- **THEN** mensagens com `created_at < NOW() - INTERVAL '7 days'` são deletadas e o histórico dessas conversas não é mais servido ao LLM

### Requirement: Cobertura e Validação por Testes
O sistema MUST garantir que todo o código correspondente a esta spec seja coberto e validado por testes automatizados (unitários e integrados), com suporte a execução no ambiente de testes local (docker-compose).

#### Scenario: Suite de testes de chat
- **WHEN** a suite de testes é executada
- **THEN** os testes validam o assistente de chat com contexto ANVISA

