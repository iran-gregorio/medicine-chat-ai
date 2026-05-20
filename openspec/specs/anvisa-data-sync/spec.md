## Purpose
Esta especificação define os requisitos para ingestão dos dados abertos da ANVISA e vetorização das bulas de medicamentos para viabilizar consultas semânticas via RAG.

## Requirements

### Requirement: Ingestão de dados abertos da ANVISA
O sistema MUST ter um pipeline programado (por exemplo, via Cronjob ou Celery/Airflow em Python) para baixar, limpar e estruturar os dados abertos em CSV referentes a medicamentos registrados na ANVISA.

#### Scenario: Atualização mensal da base de dados
- **WHEN** o job programado rodar no primeiro dia do mês
- **THEN** o sistema faz o download das bases atualizadas, atualiza os registros de medicamentos no PostgreSQL e loga o resultado da operação

### Requirement: Vetorização de bulas para RAG
O sistema MUST pegar o conteúdo textual descritivo dos medicamentos/bulas ingeridos e processá-los com um modelo de embedding (como text-embedding-3-small) para salvar esses vetores em tabelas do PostgreSQL via `pgvector`.

#### Scenario: Inclusão de um novo medicamento na base
- **WHEN** o pipeline de ingestão detecta um novo medicamento recém-registrado na base da ANVISA
- **THEN** o sistema gera os embeddings do seu princípio ativo e indicações, e armazena na coluna vetorial para que fique imediatamente disponível para consultas RAG

### Requirement: Cobertura e Validação por Testes
O sistema MUST garantir que todo o código correspondente a esta spec seja coberto e validado por testes automatizados (unitários e integrados), com suporte a execução no ambiente de testes local (docker-compose).

#### Scenario: Suite de testes de ingestão de dados
- **WHEN** a suite de testes é executada
- **THEN** os testes validam o pipeline de ingestão e a vetorização correta das bulas

