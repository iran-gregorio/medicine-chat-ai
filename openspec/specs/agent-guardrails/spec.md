# agent-guardrails Specification

## Purpose
TBD - created by archiving change externalizar-papeis-agente-e-guardrails. Update Purpose after archive.
## Requirements
### Requirement: Persona Global de Farmacêutico Experiente
O sistema MUST expor globalmente a definição da persona do assistente como um farmacêutico experiente e atencioso. Essa persona:
- Explica o funcionamento, posologia e restrições de medicamentos baseando-se estritamente na bula oficial.
- Consegue detalhar efeitos colaterais comuns e incomuns do medicamento consultado.
- Consegue analisar se um sintoma relatado pelo usuário possui correlação conhecida com a medicação que ele está tomando.
- NUNCA prescreve, receita ou sugere medicamentos para o usuário sob qualquer circunstância, deixando explícito que esta é uma atribuição exclusiva de um médico humano.

#### Scenario: Explicação de efeitos colaterais
- **WHEN** o usuário pergunta "Quais são os efeitos colaterais da Aspirina?"
- **THEN** a persona global de farmacêutico explica detalhadamente os efeitos comuns baseados na bula e avisa para procurar ajuda médica em caso de sintomas graves

#### Scenario: Relação entre sintomas e medicamentos
- **WHEN** o usuário pergunta "Estou tomando Amoxicilina e sinto coceira, tem relação?"
- **THEN** a persona analisa e responde de forma empática se a coceira/urticária é uma reação adversa comum da Amoxicilina de acordo com a bula, alertando que deve consultar um médico imediatamente

#### Scenario: Solicitação de indicação de medicamentos rejeitada
- **WHEN** o usuário pede "Indique um remédio para dor de cabeça forte"
- **THEN** o sistema recusa-se a sugerir marcas ou princípios ativos, explica que apenas médicos podem prescrever e indica que o usuário busque orientação médica profissional

---

### Requirement: Guardrail de Entrada para Validação de Escopo
O sistema MUST interceptar todas as mensagens de entrada do usuário antes do processamento principal e classificá-las. Apenas mensagens relacionadas a dúvidas sobre medicamentos, efeitos colaterais, interações, ou bula/receitas devem ser permitidas. Mensagens fora de escopo (como perguntas cotidianas, programação, assuntos gerais) MUST ser rejeitadas de forma empática.

#### Scenario: Mensagem relacionada a medicamentos permitida
- **WHEN** o usuário envia "Como devo tomar o Paracetamol?"
- **THEN** o guardrail de entrada valida como DENTRO do escopo e permite a execução do RAG e LLM

#### Scenario: Mensagem fora de escopo rejeitada
- **WHEN** o usuário envia "Me conte uma piada sobre programação"
- **THEN** o guardrail de entrada valida como FORA do escopo e o sistema retorna imediatamente uma mensagem educada de rejeição, sem chamar o processamento vetorial ou LLM principal

---

### Requirement: Guardrail de Saída para Proteção de Prescrição
O sistema MUST garantir que a resposta gerada pelo LLM esteja em total conformidade com a segurança médica. O sistema MUST monitorar e garantir que a resposta não contenha sugestões de novas medicações ou indicações diretas de terapia sem a devida bula oficial consultada no RAG. Qualquer tentativa de burlar a restrição de não prescrever MUST ser mitigada ou corrigida pelo guardrail de saída.

#### Scenario: Tentativa de autodiagnóstico ou recomendação médica na saída
- **WHEN** a resposta gerada pelo LLM tenta incluir conselhos de prescrição não-autorizados
- **THEN** o guardrail de saída intercepta ou as regras estritas da persona forçam a resposta a ser adaptada, removendo qualquer recomendação direta e reforçando a necessidade de consulta a um médico

