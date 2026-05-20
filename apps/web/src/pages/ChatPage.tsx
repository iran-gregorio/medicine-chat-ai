import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { ConversationList } from '../features/chat/ConversationList';
import { ChatWindow } from '../features/chat/ChatWindow';

export default function ChatPage() {
  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    error,
    loadConversations,
    selectConversation,
    createConversation,
    sendMessage,
    clearError,
  } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <ConversationList
        conversations={conversations}
        activeId={activeConversationId}
        isLoading={isLoadingConversations}
        onSelect={selectConversation}
        onCreate={() => createConversation()}
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

