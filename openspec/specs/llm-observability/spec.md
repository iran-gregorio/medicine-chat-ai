## ADDED Requirements

### Requirement: Rastreamento de execução da LLM
O sistema SHALL registrar o uso de tokens, tempo de execução e passos das chains executadas pelo LangChain através de Callbacks configurados globalmente ou por requisição.

#### Scenario: Geração de resposta registra latência e tokens
- **WHEN** o sistema gera uma resposta RAG
- **THEN** um Callback intercepta o início e o fim da chamada, logando o total de tokens gastos e o tempo total da operação para monitoramento
