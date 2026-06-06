## MODIFIED Requirements

### Requirement: Leitura multimodal de imagens médicas
O sistema MUST ser capaz de receber imagens (JPEG, PNG, HEIC) capturadas e convertidas em Base64 pelos clientes frontend (React Web e Flutter Mobile). O backend processará esse JSON base64 através do modelo Gemini 1.5 Flash via gateway do OpenRouter para extrair o texto contido nelas, com instruções explícitas de descartar PII. Os clientes deverão apresentar feedback visual de carregamento durante esse processamento, visto que pode levar alguns segundos.

#### Scenario: Usuário envia foto de uma caixa de remédio
- **WHEN** o usuário seleciona ou tira uma foto nítida de uma embalagem de medicamento no frontend
- **THEN** o client frontend codifica para base64 e exibe um loader; o backend usa a IA (Gemini 1.5 Flash via OpenRouter) para extrair o nome do medicamento e o princípio ativo, inicia uma consulta via RAG, e o frontend renderiza a resposta retornada
