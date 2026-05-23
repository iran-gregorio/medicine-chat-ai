## ADDED Requirements

### Requirement: Dedicated ingestion service
O sistema SHALL isolar o processo de ingestão de dados do RAG em uma estrutura de código independente da API principal, rodando de forma local sem depender de containers do Docker.

#### Scenario: Running the ingestion script
- **WHEN** the `ingestion-backend` is triggered (via local script execution or schedule)
- **THEN** it connects to the database, processes the ANVISA data, generates embeddings, and saves them to `pgvector` without impacting the main API service.

### Requirement: PII Anonymization during data processing
O sistema SHALL garantir que todas as PIIs em receitas médicas enviadas ou processadas (se integradas à ingestão de exemplos/dados adicionais) sejam devidamente anonimizadas antes da geração de embeddings e armazenamento no banco vetorial.

#### Scenario: Processing medical prescriptions with PII
- **WHEN** the ingestion pipeline processes a text or image containing PII (like patient names or CPF)
- **THEN** the system applies redaction/masking to the sensitive data before saving the chunks to the vector database.
