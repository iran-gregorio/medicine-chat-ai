## ADDED Requirements

### Requirement: Frontend React Web Interface
O frontend React MUST implementar telas de Login/Registro consumindo a API do backend, gerenciar a sessão localmente (JWT) e prover uma interface de Chat que permita o envio de texto e upload de imagens (Base64) consumindo a rota `/api/images/process`.

#### Scenario: Envio de imagem na interface Web
- **WHEN** o usuário seleciona e envia uma imagem através do React Web
- **THEN** a imagem é convertida em base64, enviada ao backend junto com o JWT, e a resposta sanitizada da IA/RAG é exibida na interface do chat com um indicador de carregamento durante a espera
