# chat-ui-mobile Specification

## Purpose
TBD - created by archiving change ai-chat-with-memory. Update Purpose after archive.
## Requirements
### Requirement: Tela de listagem de conversas no Flutter
O app Flutter MUST exibir uma lista de conversas do usuário autenticado, ordenadas pela mais recente, com o `title` gerado automaticamente. A tela MUST ser acessível apenas quando o usuário estiver autenticado.

#### Scenario: Usuário acessa a lista de conversas
- **WHEN** o usuário navega para a tela de Chat no app
- **THEN** o app exibe a lista de conversas do usuário com title e data da última mensagem

#### Scenario: Nenhuma conversa existente
- **WHEN** o usuário ainda não tem conversas
- **THEN** o app exibe um estado vazio com botão "Nova Conversa"

### Requirement: Tela de chat com envio de mensagens no Flutter
O app Flutter MUST exibir uma tela de conversa com histórico de mensagens (bolhas de usuário e IA) e campo de entrada para envio. O envio MUST exibir indicador de carregamento enquanto aguarda a resposta da IA.

#### Scenario: Envio de mensagem no Flutter
- **WHEN** o usuário digita uma mensagem e pressiona enviar
- **THEN** a mensagem é exibida imediatamente como bolha do usuário, um indicador de carregamento aparece e, ao receber a resposta, a bolha da IA é exibida

#### Scenario: Erro de rede no envio
- **WHEN** o envio falha por erro de rede ou servidor
- **THEN** o app exibe uma mensagem de erro com opção de tentar novamente

### Requirement: Retomada de conversa existente no Flutter
O app Flutter MUST permitir que o usuário selecione uma conversa da lista e retome o histórico do ponto onde parou, carregando as mensagens persistidas no banco.

#### Scenario: Usuário retoma conversa
- **WHEN** o usuário toca em uma conversa existente na lista
- **THEN** o app navega para a tela de chat com o histórico da conversa carregado do backend

### Requirement: Cobertura e Validação por Testes
O sistema MUST garantir que os widgets e fluxos da UI de chat no Flutter sejam cobertos por testes de widget e integração.

#### Scenario: Testes de widget do chat Flutter
- **WHEN** os testes de widget são executados
- **THEN** os cenários de listagem, envio, loading e erro são validados

