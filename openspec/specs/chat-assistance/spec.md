## ADDED Requirements

### Requirement: Responder dúvidas sobre medicamentos com contexto da ANVISA
O sistema MUST utilizar LangChain e a técnica RAG (Retrieval-Augmented Generation) acessando os vetores da ANVISA no PostgreSQL para responder a perguntas técnicas sobre medicamentos de forma simples.

#### Scenario: Pergunta sobre interação medicamentosa
- **WHEN** o usuário pergunta se pode misturar medicamento A com medicamento B
- **THEN** o sistema consulta o banco vetorial pelas bulas de A e B e o LLM retorna uma resposta clara sobre os riscos baseada na fonte oficial

### Requirement: Histórico de chat por usuário
O sistema MUST manter o histórico de conversas separado por sessão e associado ao usuário autenticado, de forma criptografada no banco.

#### Scenario: Usuário retoma uma conversa antiga
- **WHEN** o usuário abre uma conversa antiga no app
- **THEN** o histórico é carregado e a LLM possui contexto das mensagens anteriores dessa sessão específica

### Requirement: Cobertura e Validação por Testes
O sistema MUST garantir que todo o código correspondente a esta spec seja coberto e validado por testes automatizados (unitários e integrados), com suporte a execução no ambiente de testes local (docker-compose).

