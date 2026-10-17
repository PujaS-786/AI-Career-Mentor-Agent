import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AIMentorDrawer({ isOpen, onClose, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      const res = await api.mentor.getHistory();
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages.map((m) => ({ sender: m.sender, text: m.message_text })));
      } else {
        setMessages([
          {
            sender: 'ai',
            text: `Hello ${user?.full_name || 'there'}! I am your AI Career Mentor. Ask me anything about what to learn next, interview prep strategies, or your career roadmap.`,
          },
        ]);
      }
    } catch {
      setMessages([
        {
          sender: 'ai',
          text: `Hello ${user?.full_name || 'there'}! I am your AI Career Mentor. Ask me anything about what to learn next, interview prep strategies, or your career roadmap.`,
        },
      ]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.mentor.chat(userMsg);
      setMessages((prev) => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mentor-drawer">
      <div className="mentor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🤖</span>
          <span>AI Career Mentor</span>
        </div>
        <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="mentor-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`mentor-msg ${m.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="mentor-msg msg-ai">Thinking...</div>}
      </div>

      <form onSubmit={handleSend} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
        <input
          className="form-input"
          style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
          placeholder="Ask AI Mentor..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn-primary" type="submit" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          Send
        </button>
      </form>
    </div>
  );
}
