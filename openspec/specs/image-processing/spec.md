## Purpose
Esta especificação define os requisitos para leitura multimodal de imagens de medicamentos e anonimização automática de dados pessoais (PII) antes da persistência.

## Requirements

### Requirement: Leitura multimodal de imagens médicas
O sistema MUST ser capaz de receber imagens (JPEG, PNG, HEIC) enviadas pelos aplicativos móvel e web e processá-las utilizando um modelo de IA multimodal (LLM) para extrair o texto contido nelas.

#### Scenario: Usuário envia foto de uma caixa de remédio
- **WHEN** o usuário faz o upload de uma foto nítida de uma embalagem de medicamento
- **THEN** a IA extrai o nome do medicamento e o princípio ativo, iniciando uma consulta via RAG

### Requirement: Anonimização de dados pessoais (PII)
O sistema MUST implementar um processo de anonimização (via regex, NLP Presidio ou prompt na própria LLM) para borrar ou remover nomes de pacientes, médicos, CRMs e dados sensíveis antes de salvar permanentemente os dados processados da imagem.

#### Scenario: Usuário envia foto de receita médica
- **WHEN** uma receita é enviada com o nome do paciente no cabeçalho
- **THEN** o sistema processa a imagem, identifica os medicamentos, e mascara o nome do paciente antes de salvar a transcrição da receita no banco de dados

### Requirement: Cobertura e Validação por Testes
O sistema MUST garantir que todo o código correspondente a esta spec seja coberto e validado por testes automatizados (unitários e integrados), com suporte a execução no ambiente de testes local (docker-compose).

#### Scenario: Suite de testes de processamento de imagens
- **WHEN** a suite de testes é executada
- **THEN** os testes validam a extração multimodal e a anonimização de PII

