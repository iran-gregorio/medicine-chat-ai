## MODIFIED Requirements

### Requirement: Guardrail de Entrada para Validação de Escopo
O sistema MUST interceptar todas as mensagens de entrada do usuário antes do processamento principal e classificá-las utilizando as capacidades de extração estruturada do framework de IA (`with_structured_output`). Apenas mensagens relacionadas a dúvidas sobre medicamentos, efeitos colaterais, interações, ou bula/receitas devem ser permitidas. Mensagens fora de escopo (como perguntas cotidianas, programação, assuntos gerais) MUST ser rejeitadas de forma empática através do próprio guardrail, com garantia de integridade do formato de saída.

#### Scenario: Mensagem relacionada a medicamentos permitida
- **WHEN** o usuário envia "Como devo tomar o Paracetamol?"
- **THEN** o guardrail de entrada valida estruturalmente como DENTRO do escopo e permite a execução da Chain RAG

#### Scenario: Mensagem fora de escopo rejeitada
- **WHEN** o usuário envia "Me conte uma piada sobre programação"
- **THEN** o guardrail de entrada valida estruturalmente como FORA do escopo e o sistema retorna imediatamente uma mensagem educada de rejeição, sem chamar o processamento vetorial ou LLM principal
