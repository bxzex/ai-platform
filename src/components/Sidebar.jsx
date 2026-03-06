import React from 'react';
import { Plus, MessageSquare, Trash2, Download, Settings, X, Github } from 'lucide-react';

const Sidebar = ({ 
  chats, 
  activeChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat, 
  onDownloadChat, 
  onOpenSettings,
  userProfile,
  isOpen,
  onClose
}) => {
  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="new-chat-btn" onClick={onNewChat} style={{ flex: 1, marginBottom: 0 }}>
          <Plus size={18} />
          New Chat
        </button>
        <button className="close-sidebar-mobile" onClick={onClose} style={{ marginLeft: '0.5rem' }}>
          <X size={20} />
        </button>
      </div>

      <div className="chat-history">
        {chats.map(chat => (
          <div 
            key={chat.id} 
            className={`history-item ${chat.id === activeChatId ? 'active' : ''}`}
            onClick={() => {
              onSelectChat(chat.id);
              onClose();
            }}
          >
            <MessageSquare size={16} />
            <span>{chat.title}</span>
            <div className="action-icons" style={{ display: 'flex', gap: '4px' }}>
              <Download 
                size={14} 
                className="action-icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadChat(chat.id);
                }} 
              />
              <Trash2 
                size={14} 
                className="action-icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }} 
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <div className="history-item" onClick={onOpenSettings}>
          <div className="avatar user" style={{ width: '24px', height: '24px', borderRadius: '4px' }}>
            <span style={{ fontSize: '10px' }}>{userProfile.name[0]}</span>
          </div>
          <span style={{ fontWeight: 500 }}>{userProfile.name}</span>
          <Settings size={16} className="action-icon" style={{ opacity: 1 }} />
        </div>
        
        <a 
          href="https://github.com/bxzex/ai-platform" 
          target="_blank" 
          rel="noopener noreferrer"
          className="history-item"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Github size={16} />
          <span>GitHub</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
