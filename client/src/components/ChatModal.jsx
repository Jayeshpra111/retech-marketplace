import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldAlert, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import '../styles/components.css';

export default function ChatModal() {
  const { activeChatListing, setActiveChatListing, user } = useApp();
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize conversation and socket room
  useEffect(() => {
    if (!activeChatListing || !user) return;

    let isMounted = true;
    setIsLoading(true);

    const sellerId = activeChatListing.seller?._id || activeChatListing.seller?.id;
    const listingId = activeChatListing._id || activeChatListing.id;

    // Find or create conversation
    api.chat
      .createConversation(sellerId, listingId)
      .then((res) => {
        if (!isMounted) return;
        const conv = res?.data;
        setConversation(conv);

        if (conv?._id) {
          // Join socket room
          const socket = getSocket();
          if (socket) {
            socket.emit('joinConversation', conv._id);
          }

          // Fetch message history
          return api.chat.getMessages(conv._id);
        }
      })
      .then((msgRes) => {
        if (!isMounted) return;
        if (msgRes?.data) {
          setChatMessages(msgRes.data);
        }
      })
      .catch((err) => {
        console.warn('Chat loading error:', err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      const socket = getSocket();
      if (socket && conversation?._id) {
        socket.emit('leaveConversation', conversation._id);
      }
    };
  }, [activeChatListing, user]);

  // Listen for incoming messages on socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversation?._id) return;

    const handleNewMessage = (msg) => {
      if (msg.conversation === conversation._id || msg.conversation?._id === conversation._id) {
        setChatMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [conversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!activeChatListing) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');

    if (conversation?._id) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('sendMessage', { conversationId: conversation._id, text }, (res) => {
          if (res?.message) {
            setChatMessages((prev) => [...prev, res.message]);
          }
        });
      } else {
        // Fallback to REST API
        try {
          const res = await api.chat.sendMessage(conversation._id, text);
          if (res?.data) {
            setChatMessages((prev) => [...prev, res.data]);
          }
        } catch (err) {
          console.error('Failed to send message:', err);
        }
      }
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const sellerAvatar =
    activeChatListing.seller?.avatar?.url ||
    (typeof activeChatListing.seller?.avatar === 'string'
      ? activeChatListing.seller.avatar
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
  const sellerName = activeChatListing.seller?.name || 'Verified Seller';
  const sellerRating = activeChatListing.seller?.ratingAvg || activeChatListing.seller?.rating || 4.9;

  const listingImage =
    activeChatListing.images?.[0]?.url ||
    (typeof activeChatListing.images?.[0] === 'string'
      ? activeChatListing.images[0]
      : 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600');

  return (
    <div className="chat-overlay">
      <div className="chat-dialog">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header__seller">
            <div className="chat-header__avatar-wrap">
              <img src={sellerAvatar} alt={sellerName} className="chat-header__avatar" />
              <span className="chat-header__online"></span>
            </div>
            <div>
              <h3 className="chat-header__seller-name">
                <span>{sellerName}</span>
                <span className="chat-header__rating">★ {sellerRating}</span>
              </h3>
              <p className="chat-header__response">Replies within 15 mins</p>
            </div>
          </div>
          <button onClick={() => setActiveChatListing(null)} className="chat-header__close">
            <X className="chat-icon chat-icon--medium" />
          </button>
        </div>

        {/* Pinned Listing Preview Bar */}
        <div className="chat-listing-preview">
          <div className="chat-listing-preview__item">
            <img src={listingImage} alt={activeChatListing.title} className="chat-listing-preview__image" />
            <div className="chat-listing-preview__copy">
              <p className="chat-listing-preview__title">{activeChatListing.title}</p>
              <p className="chat-listing-preview__price">{formatPrice(activeChatListing.price)}</p>
            </div>
          </div>
          <Link
            to={`/checkout/${activeChatListing._id || activeChatListing.id}`}
            onClick={() => setActiveChatListing(null)}
            className="chat-buy-button"
          >
            Buy with Escrow
          </Link>
        </div>

        {/* Mandatory Safety Alert Banner */}
        <div className="chat-safety-alert">
          <ShieldAlert className="chat-icon chat-icon--small chat-safety-alert__icon" />
          <span>
            <strong>Safety Warning:</strong> Never share UPI PINs or make deposits outside ReTech. Only platform
            purchases qualify for 100% escrow buyer protection.
          </span>
        </div>

        {/* Message Thread */}
        <div className="chat-thread">
          <div className="chat-thread__day">
            <span className="chat-thread__day-label">Direct Seller Inquiry</span>
          </div>

          {isLoading && (
            <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>Loading conversation...</p>
          )}

          {chatMessages.map((msg, i) => {
            const senderId = msg.sender?._id || msg.sender;
            const currentUserId = user?._id || user?.id;
            const isMe = senderId === currentUserId || msg.sender === 'buyer';
            const msgTime = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : msg.time || '';

            return (
              <div key={msg._id || msg.id || i} className={`chat-message-row ${isMe ? 'is-mine' : 'is-theirs'}`}>
                <div className={`chat-message ${isMe ? 'is-mine' : 'is-theirs'}`}>
                  <p className="chat-message__text">{msg.text}</p>
                  <div className={`chat-message__meta ${isMe ? 'is-mine' : 'is-theirs'}`}>
                    <span>{msgTime}</span>
                    {isMe && <CheckCheck className="chat-icon chat-icon--tiny chat-message__read" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="chat-composer">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about warranty, condition, or pick-up..."
            className="chat-composer__input"
          />
          <button type="submit" className="chat-composer__send">
            <Send className="chat-icon chat-icon--small" />
          </button>
        </form>
      </div>
    </div>
  );
}
