## ADDED Requirements

### Requirement: Frontend Flutter Mobile Interface
O frontend Flutter MUST implementar telas de Login/Registro consumindo a API do backend, gerenciar a sessão localmente (JWT) de forma segura e prover uma interface de Chat que permita captura de imagens nativamente (câmera/galeria), convertendo-as para Base64 e enviando ao endpoint `/api/images/process`.

#### Scenario: Envio de imagem nativa no Flutter
- **WHEN** o usuário toca no botão de câmera e tira uma foto de uma bula
- **THEN** o app Flutter converte a imagem para base64 e a envia ao backend com o token JWT, aguardando o processamento multimodal e exibindo o texto de resposta simplificado
