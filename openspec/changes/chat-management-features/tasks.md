## 1. Database & Backend Changes

- [x] 1.1 Add `is_archived` column (boolean, default false) to `chat_sessions` table via Alembic migration
- [x] 1.2 Add an index on `(user_id, is_archived)` in the database
- [x] 1.3 Update the `ChatSession` SQLAlchemy model to include `is_archived`
- [x] 1.4 Update the backend GET `/api/chats` endpoint to accept an `archived` query parameter and filter appropriately
- [x] 1.5 Add a PATCH `/api/chats/{chat_id}` endpoint to handle updating `title` and/or `is_archived`

## 2. Web Frontend (React)

- [x] 2.1 Update the chat service API client to support `archived` parameter in fetching chats and the new PATCH method
- [x] 2.2 Add an "Archived Chats" section or toggle in the UI (e.g., sidebar)
- [x] 2.3 Add a "Rename" button/menu item in the active chats list that opens an input to edit the chat title
- [x] 2.4 Add an "Archive" button/menu item in the active chats list to hide the chat
- [x] 2.5 Add an "Unarchive" button in the Archived Chats section to restore a chat

## 3. Mobile Frontend (Flutter)

- [ ] 3.1 Update the API repository layer in Flutter to support the new `archived` query param and the PATCH endpoint
- [ ] 3.2 Add an "Archived Chats" view to the mobile app (e.g., via a drawer menu or tab)
- [ ] 3.3 Add swipe-to-archive or a context menu option to archive a chat from the active chat list
- [ ] 3.4 Add an option to rename a chat in the chat list context menu or details view
- [ ] 3.5 Allow unarchiving a chat from the Archived Chats view
