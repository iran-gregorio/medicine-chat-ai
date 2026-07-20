## ADDED Requirements

### Requirement: Chat Dark Theme Consistency
The system SHALL display the chat interface using the new `dashboard-dark` visual language, matching the aesthetic quality of the new dashboard layout.

#### Scenario: User navigates to the chat
- **WHEN** the user initiates or resumes a chat session
- **THEN** the chat layout must inherit the modern dark theme layout seamlessly without visual breakage.

### Requirement: Secure Media and Text Handling UI
The system SHALL upload prescriptions or medication images securely to the backend, enabling the backend to perform PII sanitization.

#### Scenario: User uploads a prescription image
- **WHEN** the user uploads a prescription in the chat interface
- **THEN** the frontend must immediately transmit it to the backend via secure channels, avoiding persistent local caching of sensitive image data on the client side.
