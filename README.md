# Medicine Chat AI

Bem-vindo ao **Medicine Chat AI**! Esta plataforma foi desenhada para simplificar a leitura de bulas e receitas médicas através de um assistente multimodal com inteligência artificial, garantindo alta conformidade com privacidade (LGPD). A aplicação é dividida em Web, Mobile e Backend.

## 🏗️ Estrutura do Monorepo

O projeto está organizado da seguinte forma:

```text
medicine-chat-ai/
├── apps/
│   ├── mobile/      # Projeto Flutter (iOS e Android)
│   └── web/         # Projeto React (Vite + TailwindCSS)
├── backend/         # API Python (FastAPI + LangChain)
├── openspec/        # Especificações, arquitetura e planejamento técnico
└── docker-compose.yml # Orquestração do ambiente local (banco de dados, etc.)
```

## 🚀 Requisitos Pré-vios

Para rodar este projeto, você precisará ter instalado:

1. [Docker](https://www.docker.com/) e Docker Compose
2. [Python 3.10+](https://www.python.org/)
3. [Node.js](https://nodejs.org/) (versão 18 ou superior)
4. [Flutter SDK](https://flutter.dev/docs/get-started/install)

## 🛠️ Como Iniciar o Ambiente Local

1. Suba o banco de dados PostgreSQL com `pgvector`:
   ```bash
   docker-compose up -d db
   ```
   *Isso disponibilizará o banco de dados na porta `5432`.*

2. (Em breve) Como iniciar o Backend:
   O backend utilizará FastAPI. Após a inicialização do projeto em `./backend`, você poderá rodá-lo localmente com o `uvicorn` ou através do próprio Docker Compose.

3. (Em breve) Como iniciar os Apps (Web/Mobile):
   Instruções detalhadas serão adicionadas nos subdiretórios correspondentes conforme os projetos sejam inicializados.

## 🚀 Como fazer o Deploy (Backend no Cloud Run)

Para fazer o deploy do backend no **Google Cloud Run**, certifique-se de que o Google Cloud CLI (`gcloud`) está instalado e configurado, e então execute os seguintes comandos no diretório `./backend`:

```bash
cd backend
gcloud run deploy medicine-chat-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 2 \
  --concurrency 80 \
  --cpu-boost
```

> **Nota:** As variáveis de ambiente (como banco de dados e chaves de API) já devem estar configuradas no Secret Manager do projeto GCP associado.

## 🔒 Segurança e Privacidade
Este projeto lida com dados médicos. Qualquer contribuição deve garantir a proteção de informações pessoais identificáveis (PII). Processos de anonimização estritos devem ser seguidos antes do armazenamento em banco.

## 📝 Documentação
Consulte a pasta `openspec/` para entender a arquitetura completa, decisões de design, mockups e o roadmap do projeto.
