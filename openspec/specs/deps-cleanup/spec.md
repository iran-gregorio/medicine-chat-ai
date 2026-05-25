## ADDED Requirements

### Requirement: Limpeza de Bibliotecas Obsoletas
O sistema DEVE conter apenas dependências em `requirements.txt` que sejam de fato utilizadas pelo código do backend.

#### Scenario: Instalação do contêiner
- **WHEN** a imagem Docker é construída usando o `requirements.txt`
- **THEN** bibliotecas não referenciadas não devem ser baixadas e empacotadas
