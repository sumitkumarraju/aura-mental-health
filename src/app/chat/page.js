'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAuraResponse, getInitialMessage } from '@/lib/aura-responses';
import { getChatHistory, saveChatMessage, clearChatHistory } from '@/lib/storage';
import { PaperPlaneRight, Trash, ArrowCounterClockwise } from '@phosphor-icons/react';

function TypingIndicator() {
  return (
    <div className="chat-bubble chat-bubble--aura">
      <div className="chat-bubble__label">AURA</div>
      <div className="typing-indicator" style={{ gap: '4px', display: 'flex', alignItems: 'center', height: '24px' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)' }}
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)' }}
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)' }}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [actions, setActions] = useState([]);
  const [mode, setMode] = useState('default');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const history = getChatHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      const initial = getInitialMessage();
      const msg = { role: 'aura', text: initial.text, id: 'initial' };
      setMessages([msg]);
      setActions(initial.actions);
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'listen') {
        setMode('listen');
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', text: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveChatMessage(userMessage);
    setInput('');
    setIsTyping(true);
    setActions([]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), mode }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.response && !data.useDemoMode) {
          const auraMessage = {
            role: 'aura',
            text: data.response,
            isSafetyAlert: data.isSafetyAlert || false,
          };
          setMessages((prev) => [...prev, auraMessage]);
          saveChatMessage(auraMessage);
          setIsTyping(false);
          setActions(data.actions || []);
          return;
        }
      }
    } catch (err) {
      console.warn('API chat route unavailable, using local engine:', err);
    }

    const delay = 800 + Math.random() * 1000;
    setTimeout(() => {
      const userMessageCount = newMessages.filter((m) => m.role === 'user').length;
      const response = getAuraResponse(text, userMessageCount, mode);

      const auraMessage = { role: 'aura', text: response.text };
      setMessages((prev) => [...prev, auraMessage]);
      saveChatMessage(auraMessage);
      setIsTyping(false);
      setActions(response.actions || []);
    }, delay);
  };

  const handleAction = (action) => {
    switch (action.action) {
      case 'calm': window.location.href = '/calm'; break;
      case 'understand': window.location.href = '/discover'; break;
      case 'action': window.location.href = '/support'; break;
      case 'crisis_help':
      case 'emergency': window.location.href = '/help'; break;
      case 'listen': setMode('listen'); sendMessage("I just need someone to listen right now."); break;
      case 'change': sendMessage("Can we talk about something else?"); break;
      case 'break': window.location.href = '/calm'; break;
      default: sendMessage(action.label);
    }
  };

  return (
    <div className="page-container" style={{ padding: '0 var(--space-6)', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Cinematic Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-6) 0 var(--space-4) 0',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'linear-gradient(180deg, var(--bg-deep) 0%, transparent 100%)',
          zIndex: 10,
        }}
      >
        <div>
          <h1 className="display-text" style={{ fontSize: 'var(--text-3xl)' }}>
            {mode === 'listen' ? 'Listening Mode' : 'Conversation'}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 300, marginTop: 'var(--space-1)' }}>
            {mode === 'listen' ? "I'm here. No advice, no judgment." : 'End-to-end encrypted on your device.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {mode === 'listen' && (
            <button className="btn btn--glass btn--sm" onClick={() => setMode('default')} title="Switch to conversation mode">
              <ArrowCounterClockwise size={16} /> Talk
            </button>
          )}
          <button className="btn btn--glass btn--sm" onClick={() => { clearChatHistory(); window.location.reload(); }} title="Start fresh">
            <Trash size={16} weight="light" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages" style={{ flex: 1, padding: 'var(--space-6) 0' }}>
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={`${msg.role}-${i}`}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
            >
              <div
                className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--aura'} glass-panel`}
                style={{ 
                  padding: 'var(--space-3) var(--space-5)', 
                  maxWidth: '70%',
                  background: msg.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                  borderColor: msg.role === 'user' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                }}
              >
                {msg.role === 'aura' && <div className="chat-bubble__label" style={{ marginBottom: 'var(--space-2)' }}>AURA</div>}
                <div style={{ fontWeight: 300, fontSize: 'var(--text-base)', lineHeight: 1.6 }}>{msg.text}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <TypingIndicator />
          </motion.div>
        )}
        <div ref={messagesEndRef} style={{ height: 40 }} />
      </div>

      {/* Input Area */}
      <div style={{ paddingBottom: 'var(--space-6)', paddingTop: 'var(--space-4)', background: 'linear-gradient(0deg, var(--bg-deep) 80%, transparent 100%)' }}>
        {actions.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}
          >
            {actions.map((action) => (
              <button
                key={action.label}
                className="btn btn--glass"
                onClick={() => handleAction(action)}
                style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }}
              >
                {action.label}
              </button>
            ))}
          </motion.div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input
            type="text"
            className="input-glass"
            placeholder={mode === 'listen' ? "Say whatever you need to..." : "What's on your mind?"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            style={{ borderRadius: 'var(--radius-full)' }}
          />
          <button
            type="submit"
            className="btn btn--primary btn--icon"
            disabled={!input.trim() || isTyping}
            style={{ width: 56, height: 56, flexShrink: 0 }}
          >
            <PaperPlaneRight size={20} weight="fill" />
          </button>
        </form>
      </div>
    </div>
  );
}
