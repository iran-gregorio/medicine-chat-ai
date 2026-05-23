## MODIFIED Requirements

### Requirement: Responder dúvidas sobre medicamentos com contexto da ANVISA
O sistema MUST utilizar a técnica RAG (Retrieval-Augmented Generation) integrando a busca vetorial no PostgreSQL via uma Pipeline ou Chain configurável (`create_retrieval_chain` ou LCEL) para responder a perguntas técnicas sobre medicamentos. Antes de acionar a Chain RAG, o sistema MUST executar os guardrails de entrada para validar se a mensagem está no escopo de medicamentos. Caso a mensagem esteja fora do escopo, o sistema MUST retornar uma resposta educada e empática rejeitando a consulta, sem acionar o processamento principal. O sistema MUST também aplicar guardrails de saída para garantir que nenhuma recomendação médica direta ou prescrição seja sugerida ao usuário. A persona do assistente é configurada como System Message na respectiva Chain.

#### Scenario: Pergunta sobre interação medicamentosa dentro do escopo
- **WHEN** o usuário pergunta se pode misturar medicamento A com medicamento B
- **THEN** o sistema passa pelo guardrail estruturado com sucesso, a Chain de Retrieval busca as bulas de A e B e o LLM retorna uma resposta clara sobre os riscos baseada na fonte oficial

#### Scenario: Pergunta fora de escopo rejeitada pelo guardrail de entrada
- **WHEN** o usuário faz uma pergunta não relacionada a medicamentos (ex: "Qual é a previsão do tempo?")
- **THEN** o guardrail de entrada intercepta a mensagem e o sistema retorna uma resposta educada, interrompendo a pipeline antes da invocação do RAG
