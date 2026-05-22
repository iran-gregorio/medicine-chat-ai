## Context

Users of the health platform generate multiple chat sessions with the multimodal AI assistant. Over time, the list of chats becomes cluttered. Users need a way to archive old conversations and rename automatically generated titles for better organization. The platform consists of a FastAPI backend, PostgreSQL database, a React web frontend, and a Flutter mobile app. All changes must comply with LGPD guidelines regarding sensitive data.

## Goals / Non-Goals

**Goals:**
- Provide backend endpoints to rename a chat session and to toggle its archived status.
- Update the database schema to support an `is_archived` boolean flag.
- Ensure the frontend applications (Web and Mobile) can display, hide, and manage these states.

**Non-Goals:**
- Permanent deletion of chats.
- Automatic AI-based renaming of chats (this design focuses on manual renaming by the user).
- Modifying the RAG architecture or data ingestion pipelines, as this feature strictly pertains to metadata management of chat sessions.

## Decisions

- **Database Changes**: Add an `is_archived` column (boolean, default `false`) to the `chat_sessions` table. The `title` column should already exist; if not, we add it. 
- **Backend Endpoints**: 
  - `PATCH /api/chats/{chat_id}`: Accepts a payload like `{"title": "New Title", "is_archived": true}`. This allows updating either or both fields in a single request.
  - `GET /api/chats`: Add a query parameter `?archived=false` (default) to filter active chats, and `?archived=true` to fetch archived chats.
- **RAG Architecture & Data Ingestion**: (Addressing project rules) This specific feature does not alter the existing RAG pipeline or Anvisa data ingestion strategy. It only affects the presentation and organization of the resulting chat sessions.
- **PII Anonymization**: (Addressing project rules) While processing medical prescriptions/images involves anonymizing PII, chat titles manually entered by users are considered user-generated content. However, we must ensure that any *auto-generated* titles do not inadvertently leak PII extracted from prescriptions before anonymization occurs.

## Risks / Trade-offs

- **Risk**: Users might accidentally archive a chat and struggle to find it.
  **Mitigation**: Provide a clear "Archived Chats" section in the UI and a toast notification with an "Undo" button immediately after archiving.
- **Risk**: Performance impact if the `chat_sessions` table is large and not indexed on `is_archived`.
  **Mitigation**: Add a database index on `(user_id, is_archived)` to ensure fast retrieval of active/archived chats per user.
