import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { ConversationList } from '../features/chat/ConversationList';
import { ChatWindow } from '../features/chat/ChatWindow';

export default function ChatPage() {
  const {
    conversations,
    archivedConversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    error,
    loadConversations,
    loadArchivedConversations,
    selectConversation,
    createConversation,
    updateConversationDetails,
    sendMessage,
    clearError,
  } = useChatStore();

  useEffect(() => {
    loadConversations();
    loadArchivedConversations();
  }, [loadConversations, loadArchivedConversations]);

  const activeConversation = 
    conversations.find((c) => c.id === activeConversationId) || 
    archivedConversations.find((c) => c.id === activeConversationId) || 
    null;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <ConversationList
        conversations={conversations}
        archivedConversations={archivedConversations}
        activeId={activeConversationId}
        isLoading={isLoadingConversations}
        onSelect={selectConversation}
        onCreate={() => createConversation()}
        onRename={(id, title) => updateConversationDetails(id, { title })}
        onArchive={(id) => updateConversationDetails(id, { is_archived: true })}
        onUnarchive={(id) => updateConversationDetails(id, { is_archived: false })}
      />
      <ChatWindow
        activeConversation={activeConversation}
        messages={messages}
        isLoading={isLoadingMessages}
        isSending={isSending}
        error={error}
        onSendMessage={sendMessage}
        onRefresh={() => activeConversationId && selectConversation(activeConversationId)}
        onClearError={clearError}
      />
    </div>
  );
}

