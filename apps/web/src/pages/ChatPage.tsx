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
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
        />
      )}
      
      <div style={{
        height: '100%',
        ...(isMobile ? {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          width: '280px'
        } : {})
      }}>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
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

