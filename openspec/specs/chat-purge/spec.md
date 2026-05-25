## ADDED Requirements

### Requirement: Endpoint de Purge via HTTP
O sistema DEVE prover um endpoint (ex: `POST /internal/purge`) que invoque de forma síncrona ou assíncrona o expurgo de mensagens antigas do chat.

#### Scenario: Acionamento via Cloud Scheduler
- **WHEN** uma requisição POST é disparada no endpoint de purge
- **THEN** a função interna `purge_old_messages` é executada

### Requirement: Remoção do APScheduler Interno
O sistema NÃO DEVE iniciar tarefas de schedulers internos durante o ciclo de vida global (lifespan) da aplicação.

#### Scenario: Inicialização do FastAPI
- **WHEN** a aplicação principal (`main.py`) iniciar
- **THEN** o `AsyncIOScheduler` não é mais instanciado nem configurado
