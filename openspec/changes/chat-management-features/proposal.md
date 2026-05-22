## Why

Currently, users have no way to organize or manage their past conversations with the AI assistant. They cannot archive old or irrelevant chats, nor can they rename the automatically generated titles to something more meaningful. This change introduces conversation management features (archiving and renaming) to improve user experience and organization.

## What Changes

- Add the ability for users to archive existing chat sessions, hiding them from the active chat list.
- Add the ability for users to view archived chats and optionally unarchive them.
- Add the ability for users to manually rename the title of a chat session.

## Non-goals

- Deleting chats permanently is out of scope for this change (if not already supported).
- Searching specifically within archived chats is out of scope for this specific proposal.

## Capabilities

### New Capabilities
- `chat-archiving`: The ability to archive, unarchive, and view archived conversations.
- `chat-renaming`: The ability to manually update the title of a specific conversation.

### Modified Capabilities

## Impact

- **Database**: The chat session schema/model will need an `is_archived` status flag or similar. The title field must be updatable.
- **Backend (FastAPI)**: New REST endpoints or GraphQL mutations for archiving/unarchiving and renaming chats.
- **Frontend (Flutter & React)**: UI updates to the chat history sidebar/list (options for archiving/renaming), and a new view/section for "Archived Chats".
