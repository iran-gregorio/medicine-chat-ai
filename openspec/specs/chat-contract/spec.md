# chat-contract Specification

## Purpose
TBD - created by archiving change chat-contract-and-web-cleanup. Update Purpose after archive.
## Requirements
### Requirement: Envio correto de mensagens no chat
O sistema SHALL transmitir mensagens do chat utilizando o campo `content` na requisição JSON enviada à API do backend.

#### Scenario: Envio de mensagem com sucesso
- **WHEN** o usuário digita uma mensagem e clica em enviar no aplicativo mobile ou web
- **THEN** a requisição HTTP POST para `/chat/conversations/{id}/messages` SHALL enviar o JSON no formato `{"content": "<mensagem>"}` e a mensagem deve ser processada sem erros 422

### Requirement: Exibição de conversas recentes na Home Page
A tela inicial web SHALL exibir o histórico de conversas recentes do usuário em substituição às atividades de medicamentos estáticas.

#### Scenario: Carregamento de conversas recentes na Home Page
- **WHEN** o usuário autenticado acessa a tela inicial web
- **THEN** o sistema SHALL carregar do backend as últimas conversas ordenadas por atualização e renderizar até 3 delas com opção de navegação

### Requirement: Travar idioma padrão em Português
A aplicação web SHALL manter a internacionalização padrão travada em português brasileiro (`pt-BR`) e remover a opção de alteração de idioma do menu lateral.

#### Scenario: Acesso à aplicação web sem seletor de idiomas
- **WHEN** o usuário navega pelo menu lateral da aplicação web
- **THEN** o botão seletor de idiomas SHALL estar invisível/removido e todos os textos da UI SHALL ser apresentados em português

