## Purpose
Esta especificação define os requisitos para ingestão dos dados abertos da ANVISA e vetorização das bulas de medicamentos para viabilizar consultas semânticas via RAG.
## Requirements
### Requirement: Ingestão de dados abertos da ANVISA
O sistema MUST suportar a execução manual e pontual da carga de dados da ANVISA via linha de comando ou execução automatizada/agendada de um pipeline para baixar, limpar e estruturar os dados abertos em CSV referentes a medicamentos registrados na ANVISA.

#### Scenario: Atualização mensal da base de dados
- **WHEN** o job programado ou comando manual disparar a carga da ANVISA
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
- **THEN** os testes validam o pipeline de ingestão da ANVISA, a leitura e processamento de PDFs locais, o split do texto em chunks e a vetorização correta de todas as fontes no banco de teste

### Requirement: Ingestão de arquivos PDF locais
O sistema MUST permitir a leitura e processamento de arquivos PDF a partir de um diretório local configurável. O sistema MUST extrair o texto de cada página, dividir o conteúdo em blocos (chunks) usando delimitadores de caracteres apropriados e gerar embeddings vetoriais para salvar no banco de dados com metadados detalhados (como o nome do arquivo de origem e número da página).

#### Scenario: Ingestão pontual de novos arquivos PDF locais
- **WHEN** o usuário disparar a ingestão manual de arquivos PDF locais passando o caminho do diretório
- **THEN** o sistema lê todos os arquivos PDF contidos nesse diretório, realiza a extração do texto, divide em chunks, gera embeddings e insere no PostgreSQL via pgvector de forma incremental

### Requirement: Execução manual e pontual do script de sincronização
O sistema MUST permitir que a rotina de ingestão e sincronização de dados seja executada manualmente via linha de comando (CLI) no backend. O script MUST aceitar argumentos/parâmetros de entrada para especificar o modo de execução: apenas ANVISA, apenas PDFs locais de um diretório específico, ou ambos.

#### Scenario: Execução manual seletiva do script
- **WHEN** o script de sincronização for executado manualmente com argumentos específicos `--anvisa` ou `--pdf-dir <caminho>`
- **THEN** o sistema executa de forma síncrona e pontual apenas a carga selecionada, gravando os novos registros de medicamentos ou chunks de PDFs no banco e logando detalhadamente o progresso no console

