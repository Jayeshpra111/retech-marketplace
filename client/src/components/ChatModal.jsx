import React, { useState } from 'react';
import { X, Send, ShieldAlert, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/components.css';

export default function ChatModal() {
  const { activeChatListing, setActiveChatListing, messages, sendMessage } = useApp();
  const [inputText, setInputText] = useState('');

  if (!activeChatListing) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="chat-overlay">
      <div className="chat-dialog">
        
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header__seller">
            <div className="chat-header__avatar-wrap">
              <img
                src={activeChatListing.seller.avatar}
                alt={activeChatListing.seller.name}
                className="chat-header__avatar"
              />
              <span className="chat-header__online"></span>
            </div>
            <div>
              <h3 className="chat-header__seller-name">
                <span>{activeChatListing.seller.name}</span>
                <span className="chat-header__rating">
                  ★ {activeChatListing.seller.rating}
                </span>
              </h3>
              <p className="chat-header__response">Replies {activeChatListing.seller.responseTime}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveChatListing(null)}
            className="chat-header__close"
          >
            <X className="chat-icon chat-icon--medium" />
          </button>
        </div>

        {/* Pinned Listing Preview Bar */}
        <div className="chat-listing-preview">
          <div className="chat-listing-preview__item">
            <img
              src={activeChatListing.images[0]}
              alt={activeChatListing.title}
              className="chat-listing-preview__image"
            />
            <div className="chat-listing-preview__copy">
              <p className="chat-listing-preview__title">
                {activeChatListing.title}
              </p>
              <p className="chat-listing-preview__price">
                {formatPrice(activeChatListing.price)}
              </p>
            </div>
          </div>
          <Link
            to={`/checkout/${activeChatListing.id}`}
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
            <strong>Safety Warning:</strong> Never share UPI PINs or make deposits outside ReTech. Only platform purchases qualify for escrow return protection.
          </span>
        </div>

        {/* Message Thread */}
        <div className="chat-thread">
          <div className="chat-thread__day">
            <span className="chat-thread__day-label">
              Today • Inquiry started
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === 'buyer';
            return (
              <div
                key={msg.id}
                className={`chat-message-row ${isMe ? 'is-mine' : 'is-theirs'}`}
              >
                <div
                  className={`chat-message ${isMe ? 'is-mine' : 'is-theirs'}`}
                >
                  <p className="chat-message__text">{msg.text}</p>
                  <div
                    className={`chat-message__meta ${isMe ? 'is-mine' : 'is-theirs'}`}
                  >
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="chat-icon chat-icon--tiny chat-message__read" />}
                  </div>
                </div>
              </div>
            );
          })}
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
          <button
            type="submit"
            className="chat-composer__send"
          >
            <Send className="chat-icon chat-icon--small" />
          </button>
        </form>

      </div>
    </div>
  );
}
