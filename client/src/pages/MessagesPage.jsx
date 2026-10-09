import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  Search, 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink, 
  CheckCheck,
  Package,
  User as UserIcon,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import '../styles/pages.css';

export default function MessagesPage() {
  const { user } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvIdFromUrl = searchParams.get('conv');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await api.chat.getConversations();
      const list = res?.data || [];
      setConversations(list);

      // Auto-select conversation
      if (activeConvIdFromUrl) {
        const found = list.find((c) => c._id === activeConvIdFromUrl);
        if (found) setActiveConversation(found);
        else if (list.length > 0) setActiveConversation(list[0]);
      } else if (list.length > 0 && !activeConversation) {
        setActiveConversation(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      toast.error('Could not load chat conversations.');
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Load messages when activeConversation changes
  useEffect(() => {
    if (!activeConversation?._id) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setLoadingMessages(true);

    // Join socket room
    const socket = getSocket();
    if (socket) {
      socket.emit('joinConversation', activeConversation._id);
    }

    api.chat
      .getMessages(activeConversation._id)
      .then((res) => {
        if (isMounted) {
          setMessages(res?.data || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load messages:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingMessages(false);
      });

    return () => {
      isMounted = false;
      if (socket) {
        socket.emit('leaveConversation', activeConversation._id);
      }
    };
  }, [activeConversation?._id]);

  // Listen for socket messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const convId = msg.conversation?._id || msg.conversation;
      if (activeConversation && convId === activeConversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      // Update conversation lastMessage preview
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === convId) {
            return {
              ...c,
              lastMessage: msg,
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    };

    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [activeConversation]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeConversation?._id || isSending) return;

    setIsSending(true);
    setInputText('');

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('sendMessage', { conversationId: activeConversation._id, text }, (res) => {
        setIsSending(false);
        if (res?.message) {
          setMessages((prev) => [...prev, res.message]);
        }
      });
    } else {
      try {
        const res = await api.chat.sendMessage(activeConversation._id, text);
        if (res?.data) {
          setMessages((prev) => [...prev, res.data]);
        }
      } catch (err) {
        toast.error('Failed to send message.');
      } finally {
        setIsSending(false);
      }
    }
  };

  const getPartner = (conv) => {
    if (!conv?.participants || !user) return null;
    return conv.participants.find((p) => p._id !== user._id && p._id !== user.id) || conv.participants[0];
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const partner = getPartner(c);
    const q = searchQuery.toLowerCase();
    const nameMatch = partner?.name?.toLowerCase().includes(q);
    const listingMatch = c.listing?.title?.toLowerCase().includes(q);
    return nameMatch || listingMatch;
  });

  const partner = getPartner(activeConversation);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="messages-page-wrapper">
      <div className="messages-container">
        
        {/* Left Sidebar: Conversations List */}
        <aside className={`messages-sidebar ${activeConversation ? 'has-active' : ''}`}>
          <div className="messages-sidebar-header">
            <div className="messages-title-wrap">
              <MessageSquare className="messages-icon" />
              <h2>Messages</h2>
            </div>
            <div className="messages-search-bar">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="messages-thread-list">
            {loadingConversations ? (
              <div className="messages-loading">
                <div className="spinner-sm" />
                <span>Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="messages-empty-list">
                <MessageSquare size={32} className="muted-icon" />
                <p>No conversations found</p>
                <span className="subtext">Browse items to message sellers directly.</span>
                <Link to="/browse" className="btn-browse-link">Explore Listings</Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const itemPartner = getPartner(conv);
                const isActive = activeConversation?._id === conv._id;
                const lastMsg = conv.lastMessage;

                return (
                  <div
                    key={conv._id}
                    className={`conversation-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      setActiveConversation(conv);
                      setSearchParams({ conv: conv._id });
                    }}
                  >
                    <div className="conv-avatar-wrap">
                      <img
                        src={itemPartner?.avatar?.url || itemPartner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                        alt={itemPartner?.name || 'User'}
                        className="conv-avatar"
                      />
                      {itemPartner?.isEmailVerified && (
                        <ShieldCheck className="verified-badge-mini" size={14} />
                      )}
                    </div>
                    
                    <div className="conv-info">
                      <div className="conv-top-row">
                        <span className="conv-name">{itemPartner?.name || 'Anonymous User'}</span>
                        <span className="conv-time">{formatTime(conv.updatedAt || conv.createdAt)}</span>
                      </div>
                      
                      {conv.listing && (
                        <div className="conv-listing-tag">
                          <Package size={12} />
                          <span>{conv.listing.title}</span>
                        </div>
                      )}

                      <p className="conv-preview">
                        {lastMsg?.text || (lastMsg?.sender === user?._id ? 'You started a conversation' : 'Conversation started')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Main Panel: Active Chat Thread */}
        <main className={`messages-main ${!activeConversation ? 'no-active' : ''}`}>
          {activeConversation ? (
            <div className="chat-window">
              
              {/* Chat Window Header */}
              <div className="chat-window-header">
                <button
                  type="button"
                  className="btn-back-to-list"
                  onClick={() => setActiveConversation(null)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="chat-partner-details">
                  <div className="chat-header-avatar-wrap">
                    <img
                      src={partner?.avatar?.url || partner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                      alt={partner?.name}
                      className="chat-header-avatar"
                    />
                  </div>
                  <div>
                    <div className="chat-header-name-row">
                      <h3>{partner?.name || 'Marketplace Member'}</h3>
                      {partner?.isEmailVerified && (
                        <span className="badge-verified-pill">
                          <ShieldCheck size={12} /> Verified
                        </span>
                      )}
                    </div>
                    {partner?._id && (
                      <Link to={`/seller/${partner._id}`} className="view-seller-profile-link">
                        View Seller Profile
                      </Link>
                    )}
                  </div>
                </div>

                {/* Listing info card in header */}
                {activeConversation.listing && (
                  <div className="chat-attached-listing">
                    {activeConversation.listing.images?.[0] && (
                      <img
                        src={
                          typeof activeConversation.listing.images[0] === 'string'
                            ? activeConversation.listing.images[0]
                            : activeConversation.listing.images[0].url
                        }
                        alt={activeConversation.listing.title}
                        className="attached-listing-thumb"
                      />
                    )}
                    <div className="attached-listing-meta">
                      <span className="attached-listing-title">{activeConversation.listing.title}</span>
                      <span className="attached-listing-price">
                        ₹{(activeConversation.listing.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Link
                      to={`/listings/${activeConversation.listing._id || activeConversation.listing.id}`}
                      className="btn-view-item"
                      title="Open listing detail"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Chat Message Scroll Area */}
              <div className="chat-messages-body">
                <div className="chat-security-disclaimer">
                  <ShieldCheck size={16} />
                  <span>
                    Keep payments & communications on ReTech Market to remain protected by Escrow Guarantee.
                  </span>
                </div>

                {loadingMessages ? (
                  <div className="messages-loading">
                    <div className="spinner-sm" />
                    <span>Loading message history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-thread-empty">
                    <Clock size={36} className="muted-icon" />
                    <p>No messages yet in this conversation.</p>
                    <span>Say hello or ask about item condition, testing, or availability!</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = (msg.sender?._id || msg.sender) === (user?._id || user?.id);
                    return (
                      <div key={msg._id} className={`message-bubble-row ${isMe ? 'is-me' : 'is-them'}`}>
                        {!isMe && (
                          <img
                            src={msg.sender?.avatar?.url || msg.sender?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                            alt=""
                            className="bubble-avatar"
                          />
                        )}
                        <div className={`message-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                          <p className="bubble-text">{msg.text}</p>
                          <div className="bubble-meta">
                            <span className="bubble-time">{formatTime(msg.createdAt)}</span>
                            {isMe && <CheckCheck size={13} className="bubble-check" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="chat-input-bar">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="chat-input"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="btn-send-message"
                >
                  <Send size={18} />
                </button>
              </form>

            </div>
          ) : (
            <div className="chat-none-selected">
              <div className="none-selected-card">
                <div className="none-selected-icon-ring">
                  <MessageSquare size={42} />
                </div>
                <h3>Your ReTech Messages</h3>
                <p>
                  Communicate with buyers and sellers with real-time socket updates.
                  Select a conversation from the left to start chatting.
                </p>
                <Link to="/browse" className="btn-explore-cta">
                  Explore ReTech Catalog
                </Link>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
