## ADDED Requirements

### Requirement: Respostas de chat via streaming
O sistema SHALL fornecer um endpoint para suportar streaming de tokens da LLM de modo que a interface do usuário possa renderizar a resposta progressivamente, melhorando o tempo de primeira interação (TTFB).

#### Scenario: Interface do usuário consome tokens progressivamente
- **WHEN** o usuário envia uma mensagem
- **THEN** o sistema inicia a geração da LLM e envia tokens parciais (chunks) assim que disponíveis através de uma conexão aberta (Server-Sent Events ou WebSockets)
