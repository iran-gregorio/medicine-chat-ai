import { useEffect, useState } from 'react';
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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadConversations();
    loadArchivedConversations();
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loadConversations, loadArchivedConversations]);

  const activeConversation = 
    conversations.find((c) => c.id === activeConversationId) || 
    archivedConversations.find((c) => c.id === activeConversationId) || 
    null;

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-black/40 z-40"
        />
      )}
      
      <div 
        className={`h-full ${isMobile ? 'absolute left-0 top-0 bottom-0 z-50 w-[280px] transition-transform duration-300' : ''}`}
        style={{
          transform: isMobile ? (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none'
        }}
      >
        <ConversationList
          conversations={conversations}
          archivedConversations={archivedConversations}
          activeId={activeConversationId}
          isLoading={isLoadingConversations}
          onSelect={(id) => {
            selectConversation(id);
            if (isMobile) setIsSidebarOpen(false);
          }}
          onCreate={() => {
            createConversation();
            if (isMobile) setIsSidebarOpen(false);
          }}
          onRename={(id, title) => updateConversationDetails(id, { title })}
          onArchive={(id) => updateConversationDetails(id, { is_archived: true })}
          onUnarchive={(id) => updateConversationDetails(id, { is_archived: false })}
        />
      </div>

      <div className="flex-1 flex flex-col w-full min-w-0">
        <ChatWindow
          activeConversation={activeConversation}
          messages={messages}
          isLoading={isLoadingMessages}
          isSending={isSending}
          error={error}
          onSendMessage={sendMessage}
          onRefresh={() => activeConversationId && selectConversation(activeConversationId)}
          onClearError={clearError}
          onToggleSidebar={isMobile ? () => setIsSidebarOpen(true) : undefined}
        />
      </div>
    </div>
  );
}

