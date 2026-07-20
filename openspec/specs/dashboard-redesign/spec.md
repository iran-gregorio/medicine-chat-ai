## ADDED Requirements

### Requirement: Dark Mode Theme Support
The system SHALL apply the new `dashboard-dark` theme globally to the dashboard, including specific sidebar background (`dashboard-sidebar`) and radial background gradient (`bg-main-gradient`).

#### Scenario: User opens the dashboard
- **WHEN** user loads the application and lands on the dashboard
- **THEN** the background must render a radial gradient originating from the center and transitioning to `#0b1120`.

### Requirement: Interactive Glowing Action Cards
The system SHALL present interactive action cards ("Novo Chat com IA", "Escanear Medicamento") that display a glowing effect upon user interaction.

#### Scenario: User hovers over an action card
- **WHEN** the user hovers over an action card
- **THEN** a glowing outline must appear behind the card using pseudo-elements with `filter: blur`.

### Requirement: PII Display Safety in History
The system SHALL ensure the dashboard's "Conversas Recentes" lists only abstract conversation titles and never caches or displays PII data in raw text.

#### Scenario: Loading recent conversations
- **WHEN** the recent conversations list is populated
- **THEN** it must only display high-level summaries (e.g., "Receita de Janeiro") without exposing patient names or sensitive diagnostic info.
