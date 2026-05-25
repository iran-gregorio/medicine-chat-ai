## ADDED Requirements

### Requirement: Porta Dinâmica do Dockerfile
O sistema DEVE expor a aplicação na porta especificada pela variável de ambiente `$PORT`.

#### Scenario: Execução no Cloud Run
- **WHEN** o contêiner inicia no Cloud Run (ou outro ambiente que defina `$PORT`)
- **THEN** a API Uvicorn escuta exatamente nessa porta e não numa porta hardcoded

### Requirement: Conexão Padrão TCP com o Supabase
O sistema DEVE realizar a conexão ao banco de dados via a string de conexão padrão TCP definida na variável de ambiente correspondente (`DATABASE_URL`).

#### Scenario: Inicialização com credenciais Supabase
- **WHEN** a aplicação sobe e acessa `DATABASE_URL`
- **THEN** o `database.py` estrutura e estabalece a conexão SQLAlchemy sem depender de Unix Sockets, suportando hosts externos da internet como os do Supabase
