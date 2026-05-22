## ADDED Requirements

### Requirement: Rename a chat session
The system SHALL allow users to manually edit the title of a chat session.

#### Scenario: User renames a chat
- **WHEN** user selects the "Rename" action on a chat session and inputs a new title
- **THEN** the chat session's title is updated and displayed with the new name in the chat list

#### Scenario: Auto-generated title constraints
- **WHEN** the system automatically generates a title for a new chat
- **THEN** the title MUST NOT contain any sensitive Personal Identifiable Information (PII) extracted from prescriptions or user input
