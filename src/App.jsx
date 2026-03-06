import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Zap, Shield, Cpu, Share2, X, Github, User, Download, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { useEngine } from './hooks/useEngine';
import './App.css';

const getInitialChats = () => {
  const saved = localStorage.getItem('ai_platform_chats');
  return saved ? JSON.parse(saved) : [{ id: '1', title: 'New Chat', messages: [] }];
};

const getInitialUser = () => {
  const saved = localStorage.getItem('ai_platform_user');
  return saved ? JSON.parse(saved) : { name: 'Local User', avatar: null };
};

function App() {
  const [chats, setChats] = useState(getInitialChats);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('Llama-3.2-3B-Instruct-q4f32_1-MLC');
  const DEFAULT_MODEL = 'Llama-3.2-3B-Instruct-q4f32_1-MLC';
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState(getInitialUser);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const [readyModels, setReadyModels] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_platform_ready_models');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('ai_platform_ready_models', JSON.stringify(readyModels));
  }, [readyModels]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { processQuery, loading, progress, loadCore } = useEngine();

  useEffect(() => {
    localStorage.setItem('ai_platform_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('ai_platform_user', JSON.stringify(userProfile));
  }, [userProfile]);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeChat.messages.length > 0) {
      scrollToBottom();
    }
  }, [activeChat.messages]);

  const handleAction = async (isSetup = false) => {
    if ((!input.trim() && !isSetup) || loading) return;

    if (isSetup) {
      if (loading || isInitializing) return;
      if (readyModels[DEFAULT_MODEL]) {
        alert('AI model is ready.');
        return;
      }

      setIsInitializing(true);
      try {
        await loadCore(DEFAULT_MODEL);
        setReadyModels(prev => ({ ...prev, [DEFAULT_MODEL]: true }));
        alert('Setup complete. You can now chat offline.');
        return;
      } catch (e) {
        alert(e.message);
        return;
      } finally {
        setIsInitializing(false);
      }
    }

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...activeChat.messages, userMessage];

    setChats(prev => prev.map(c =>
      c.id === activeChatId
        ? { ...c, messages: updatedMessages, title: input.slice(0, 30) + (input.length > 30 ? '...' : '') }
        : c
    ));
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const aiPlaceholder = { role: 'assistant', content: '' };
      setChats(prev => prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...updatedMessages, aiPlaceholder] }
          : c
      ));

      await processQuery(updatedMessages, 'local', DEFAULT_MODEL, (content) => {
        if (!readyModels[DEFAULT_MODEL]) {
          setReadyModels(prev => ({ ...prev, [DEFAULT_MODEL]: true }));
        }
        setChats(prev => prev.map(c =>
          c.id === activeChatId
            ? {
              ...c,
              messages: [
                ...updatedMessages,
                { role: 'assistant', content }
              ]
            }
            : c
        ));
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: []
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = (id) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        return [{ id: Date.now().toString(), title: 'New Chat', messages: [] }];
      }
      return filtered;
    });
    if (activeChatId === id) {
      setActiveChatId(chats[0].id);
    }
  };

  const handleExport = (id) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    const content = chat.messages.map(m => `${m.role.toUpperCase()}: ${m.content}\n`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="app-container">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onSelectChat={setActiveChatId}
        onDeleteChat={handleDeleteChat}
        onDownloadChat={handleExport}
        onOpenSettings={() => setShowSettings(true)}
        userProfile={userProfile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="chat-main">
        <header className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <select
              className="model-selector"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value={DEFAULT_MODEL}>Llama 3.2 (Local)</option>
            </select>
          </div>

          <div className="status-container">
            {!readyModels[DEFAULT_MODEL] || isInitializing ? (
              <button
                className="share-btn"
                onClick={() => handleAction(true)}
                disabled={loading || isInitializing}
              >
                {isInitializing ? `Loading ${progress?.percent || 0}%` : 'Initialize Model'}
              </button>
            ) : (
              <div className="ready-badge">
                <Zap size={14} fill="currentColor" />
                <span>Ready</span>
              </div>
            )}
          </div>
        </header>

        <div className="messages-container">
          {activeChat.messages.length === 0 ? (
            <div className="welcome-screen">
              <h1 className="brand-logo">Private AI Chat</h1>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>Secure & Private</h3>
                  <p>Messages never leave your device. All processing happens locally.</p>
                </div>
                <div className="feature-card">
                  <h3>Offline Access</h3>
                  <p>Once loaded, chat anywhere without an internet connection.</p>
                </div>
                <div className="feature-card">
                  <h3>Open Source</h3>
                  <p>Built with transparent, high-performance local AI technology.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="messages-stream">
              {activeChat.messages.map((m, i) => (
                <div key={i} className={`message-wrapper ${m.role === 'assistant' ? 'ai-message' : 'user-message'}`}>
                  <div className="message-content-inner">
                    <div className={`avatar ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                      {m.role === 'assistant' ? <Cpu size={16} /> : <User size={16} />}
                    </div>
                    <div className="message-content">
                      <ChatMessage message={m} />
                    </div>
                  </div>
                </div>
              ))}
              {loading && !activeChat.messages[activeChat.messages.length - 1]?.content && (
                <div className="message-wrapper ai-message">
                  <div className="message-content-inner">
                    <div className="avatar ai"><Cpu size={16} /></div>
                    <div className="message-content">
                      <div className="shimmer-bg" style={{ height: '20px', width: '60%', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="input-area">
          <div className="input-container">
            <textarea
              ref={textareaRef}
              placeholder="Message AI..."
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAction();
                }
              }}
            />
            <button
              className="send-btn"
              onClick={handleAction}
              disabled={loading || !input.trim()}
            >
              <Send size={16} />
            </button>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            AI can make mistakes. Check important info.
          </p>
        </footer>
      </main>

      <AnimatePresence>
        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content" 
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Settings</h2>
                <X size={20} className="action-icon" onClick={() => setShowSettings(false)} />
              </div>

              <div className="setting-item">
                <label>Display Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input"
                />
              </div>

              <button className="send-btn" style={{ width: '100%', height: '40px', background: '#ececec' }} onClick={() => setShowSettings(false)}>Save Changes</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
