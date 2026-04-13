import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { askEventAssistant } from '../services/gemini';
import './ChatPage.css';

const QUICK_QUESTIONS = [
  'What time does registration open?',
  'Where is lunch served?',
  'What\'s the WiFi password?',
  'What sessions are about AI?',
  'Is there a networking dinner?',
  'Where is the Auditorium?',
];

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm **EventMind AI**, your personal TechSummit 2026 assistant. 👋\n\nI can help you with:\n• Session schedules and locations\n• Venue navigation and rooms\n• WiFi, food, and logistics\n• Speaker and track information\n\nWhat would you like to know?",
  timestamp: new Date(),
};

const formatMessage = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/•/g, '<span aria-hidden="true">•</span>')
    .replace(/\n/g, '<br/>');
};

const ChatPage = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const userContext = profile
        ? `Attendee: ${profile.name}, Role: ${profile.role}, Interests: ${profile.interests?.join(', ')}`
        : '';

      const reply = await askEventAssistant(userText, userContext, history);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply, timestamp: new Date() },
      ]);
    } catch (err) {
      const isRateLimit = err.message && err.message.includes('429');
      const errorMessage = isRateLimit 
        ? "Whoa there! 🚦 We've temporarily hit our Gemini API free-tier rate limit (too many fast requests). Please allow a 30-second cooldown and try asking again!" 
        : "I'm having trouble connecting right now. Please try again in a moment.";

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat__header animate-fade-in-up">
        <div className="chat__ai-info">
          <div className="ai__avatar" aria-hidden="true">✨</div>
          <div>
            <h1 className="ai__name">EventMind AI</h1>
            <div className="ai__status">
              <span className="status__dot" aria-hidden="true" />
              <span>Powered by Gemini · TechSummit 2026</span>
            </div>
          </div>
        </div>
        <button
          className="chat__clear"
          onClick={clearChat}
          aria-label="Clear conversation"
        >
          Clear chat
        </button>
      </header>

      {/* Quick questions */}
      <div
        className="quick__questions animate-fade-in-up delay-100"
        role="group"
        aria-label="Quick question suggestions"
      >
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            className="quick__pill"
            onClick={() => sendMessage(q)}
            disabled={loading}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        className="chat__messages"
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message message--${msg.role} ${msg.isError ? 'message--error' : ''} animate-fade-in-up`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {msg.role === 'assistant' && (
              <div className="message__avatar" aria-hidden="true">✨</div>
            )}
            <div className="message__bubble">
              <div
                className="message__content"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              <time className="message__time" dateTime={msg.timestamp.toISOString()}>
                {formatTime(msg.timestamp)}
              </time>
            </div>
            {msg.role === 'user' && (
              <div className="message__user-avatar" aria-hidden="true">
                {user?.photoURL
                  ? <img src={user.photoURL} alt="" />
                  : user?.displayName?.[0]}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="message message--assistant" aria-label="EventMind AI is typing">
            <div className="message__avatar" aria-hidden="true">✨</div>
            <div className="message__bubble">
              <div className="typing__indicator" aria-hidden="true">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        className="chat__input-area animate-fade-in-up delay-200"
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        aria-label="Send a message"
      >
        <textarea
          ref={inputRef}
          className="chat__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about TechSummit 2026…"
          rows={1}
          disabled={loading}
          aria-label="Message input"
          aria-multiline="true"
        />
        <button
          type="submit"
          className="chat__send"
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          <span aria-hidden="true">↑</span>
        </button>
      </form>

      <p className="chat__note">
        AI responses are based on TechSummit 2026 event data. For urgent help, visit the Registration Desk.
      </p>
    </div>
  );
};

export default ChatPage;
