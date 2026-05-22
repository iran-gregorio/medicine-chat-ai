## ADDED Requirements

### Requirement: Archive a chat session
The system SHALL allow users to archive an active chat session.

#### Scenario: User archives a chat
- **WHEN** user selects the "Archive" action on an active chat session
- **THEN** the chat session's `is_archived` status is set to true and it is removed from the active chats list

### Requirement: View archived chats
The system SHALL provide a view or section for users to see all their archived chat sessions.

#### Scenario: User views archived chats
- **WHEN** user navigates to the "Archived Chats" section
- **THEN** the system displays a list of all chat sessions where `is_archived` is true

### Requirement: Unarchive a chat session
The system SHALL allow users to unarchive a previously archived chat session.

#### Scenario: User unarchives a chat
- **WHEN** user selects the "Unarchive" action on an archived chat session
- **THEN** the chat session's `is_archived` status is set to false and it is restored to the active chats list
