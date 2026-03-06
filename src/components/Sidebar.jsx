import React from 'react';
import { Plus, MessageSquare, Trash2, Download, Settings, X, Github, Linkedin } from 'lucide-react';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className="new-chat-btn" onClick={onNewChat} style={{ flex: 1, marginBottom: 0 }}>
          <Plus size={18} />
          New Chat
        </button>
        {isOpen && (
          <button className="close-sidebar-mobile" onClick={onClose} style={{ 
            background: 'none', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px',
            padding: '0.5rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <X size={18} />
          </button>
        )}
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
            <MessageSquare size={14} style={{ opacity: 0.7 }} />
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
        <div className="history-item" onClick={onOpenSettings} style={{ padding: '0.75rem' }}>
          <div className="avatar user" style={{ width: '28px', height: '28px', borderRadius: '6px', fontSize: '0.7rem' }}>
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="User" style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }} />
            ) : (
              userProfile.name[0]?.toUpperCase() || 'U'
            )}
          </div>
          <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{userProfile.name}</span>
          <Settings size={16} className="action-icon" style={{ opacity: 1 }} />
        </div>
        
        <a 
          href="https://github.com/bxzex" 
          target="_blank" 
          rel="noopener noreferrer"
          className="history-item"
          style={{ textDecoration: 'none', color: 'inherit', padding: '0.75rem' }}
        >
          <Github size={16} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: '0.9rem' }}>GitHub</span>
        </a>

        <a 
          href="https://www.linkedin.com/in/bxzex/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="history-item"
          style={{ textDecoration: 'none', color: 'inherit', padding: '0.75rem' }}
        >
          <Linkedin size={16} style={{ opacity: 0.7 }} />
          <span style={{ fontSize: '0.9rem' }}>LinkedIn</span>
        </a>

        <div style={{ padding: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', opacity: 0.5 }}>
          Developed by bxzex
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
