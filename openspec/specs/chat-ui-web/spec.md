# chat-ui-web Specification

## Purpose
TBD - created by archiving change ai-chat-with-memory. Update Purpose after archive.
## Requirements
### Requirement: Página de listagem de conversas na Web
A aplicação React MUST exibir uma sidebar ou página com a lista de conversas do usuário autenticado, ordenadas pela mais recente, com `title` e data da última mensagem. A página MUST ser acessível apenas quando o usuário estiver autenticado (rota protegida).

#### Scenario: Usuário autenticado acessa o chat na web
- **WHEN** o usuário navega para `/chat`
- **THEN** a página exibe a lista de conversas na sidebar e, se não houver conversas, um estado vazio com botão "Nova Conversa"

#### Scenario: Usuário não autenticado acessa `/chat`
- **WHEN** um usuário não autenticado tenta acessar `/chat`
- **THEN** é redirecionado para `/login`

### Requirement: Interface de chat com envio de mensagens na Web
A aplicação React MUST exibir um painel de chat com histórico de mensagens em formato de bolhas (usuário e IA), campo de texto e botão de envio. O envio MUST desabilitar o input e exibir loading enquanto aguarda resposta.

#### Scenario: Envio de mensagem na web
- **WHEN** o usuário digita e pressiona Enter ou clica em Enviar
- **THEN** a mensagem aparece imediatamente como bolha do usuário, input é desabilitado, e após resposta da IA a bolha da IA é exibida e o input é reabilitado

#### Scenario: Criação de nova conversa na web
- **WHEN** o usuário clica em "Nova Conversa"
- **THEN** uma nova conversa é criada via API, o painel de chat é limpo e o foco vai para o campo de entrada

### Requirement: Cobertura e Validação por Testes
O sistema MUST garantir que os componentes React de chat sejam cobertos por testes unitários (Vitest/Testing Library) e de integração.

#### Scenario: Testes de componentes React de chat
- **WHEN** os testes são executados
- **THEN** os cenários de listagem, envio, loading, erro e rota protegida são validados

