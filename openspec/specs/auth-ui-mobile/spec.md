# auth-ui-mobile Specification

## Purpose
TBD - created by archiving change auth-screens. Update Purpose after archive.
## Requirements
### Requirement: Interface de Autenticação Mobile
O sistema MUST prover telas de Login, Cadastro e Recuperação de Senha no app Flutter usando Riverpod e GoRouter.

#### Scenario: Login no Mobile
- **GIVEN** a tela de login aberta no app
- **WHEN** o usuário insere credenciais e clica em Entrar
- **THEN** o sistema autentica e navega para a Home usando o AuthNotifier

### Requirement: Segurança Mobile
O sistema MUST armazenar tokens JWT de forma segura usando flutter_secure_storage.

#### Scenario: Persistência de Sessão
- **GIVEN** um usuário logado com sucesso
- **WHEN** o app é reiniciado
- **THEN** o sistema lê o token do SecureStorage e mantém o usuário autenticado

### Requirement: Encerramento de Sessão (Logout)
O aplicativo móvel (Flutter) MUST fornecer um fluxo de encerramento de sessão (Logout) explícito a partir da Tela de Perfil. Ao ser acionada a ação, o sistema MUST:
1. Destruir os tokens JWT (Access e Refresh) armazenados no `flutter_secure_storage`.
2. Redefinir (reset) o estado dos Notifiers de autenticação, histórico de chat e mensagens em memória do Riverpod.
3. Redirecionar imediatamente a navegação (GoRouter) para a tela de login (`/login`), garantindo que o usuário não consiga retornar às páginas protegidas através do botão "voltar" do sistema.

#### Scenario: Usuário clica no botão de logout na UI
- **WHEN** o usuário autenticado clica no botão "Sair" na Tela de Perfil
- **THEN** o sistema limpa os tokens do Secure Storage, redefine o estado global do Riverpod, e navega para `/login` de forma irreversível por navegação histórica

### Requirement: Tela de Perfil do Usuário
O aplicativo móvel (Flutter) MUST fornecer uma tela de Perfil dedicada e protegida na rota `/profile`. Esta tela MUST ser acessível a partir do menu/navegação (BottomNavigationBar da home, ícone de perfil na AppBar da listagem de conversas e botão de avatar na home).
Esta tela MUST ser simples e exibir os seguintes dados do usuário logado:
1. Nome completo (Name) do usuário.
2. Endereço de e-mail (Email) do usuário.
Além disso, a tela de Perfil MUST conter a opção de redefinição de senha e o botão "Sair" (Logout) para encerramento de sessão.

#### Scenario: Acesso à tela de Perfil via Bottom Navigation
- **WHEN** o usuário autenticado clica na aba de Perfil (index 3) no BottomNavigationBar da home
- **THEN** o sistema redireciona o usuário para a tela de Perfil (/profile)

#### Scenario: Acesso à tela de Perfil via AppBar
- **WHEN** o usuário na listagem de conversas clica no ícone de perfil na AppBar
- **THEN** o sistema redireciona o usuário para a tela de Perfil (/profile)

#### Scenario: Exibição dos dados do usuário autenticado
- **WHEN** o usuário acessa a tela de Perfil (/profile)
- **THEN** o sistema recupera os dados do usuário autenticado a partir do estado global do `authProvider` do Riverpod e os exibe na interface de forma clara e acessível

### Requirement: Alteração de Senha no Perfil
A tela de Perfil MUST fornecer uma funcionalidade para alteração de senha do usuário.
Esta funcionalidade MUST exibir um formulário seguro que exige:
1. Senha atual do usuário.
2. Nova senha desejada.
3. Confirmação da nova senha.
O aplicativo MUST realizar validações locais (ex: campos vazios, novas senhas coincidentes) e enviar uma requisição segura para a API.
Durante o processamento, um feedback visual de carregamento (loading) MUST ser exibido. Em caso de sucesso, uma notificação de confirmação MUST ser exibida. Em caso de erro, a mensagem correspondente MUST ser apresentada de forma amigável ao usuário.

#### Scenario: Alteração de senha realizada com sucesso
- **WHEN** o usuário insere a senha atual correta, preenche uma nova senha válida, repete a mesma nova senha no campo de confirmação e clica em enviar
- **THEN** o sistema exibe o indicador de carregamento, envia a requisição de alteração de senha à API, retorna sucesso e exibe uma notificação de sucesso na UI

#### Scenario: Falha na validação de alteração de senha por senhas divergentes
- **WHEN** o usuário insere a nova senha e preenche uma senha diferente no campo de confirmação de senha
- **THEN** o sistema exibe um aviso informando que as senhas novas não coincidem e impede o envio da requisição à API

#### Scenario: Falha na alteração de senha por senha atual inválida
- **WHEN** o usuário insere a senha atual incorreta e preenche as novas senhas válidas e clica em enviar
- **THEN** o sistema envia a requisição, recebe a mensagem de erro do backend e apresenta uma mensagem de erro indicando que a senha atual está incorreta

