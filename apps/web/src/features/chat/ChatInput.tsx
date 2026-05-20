import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  // Focar o input quando habilitado
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#F8FAFC',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        padding: '6px 6px 6px 16px',
        transition: 'border-color 0.2s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#3B82F6';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.15)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder="Descreva seus sintomas ou dúvida..."
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontSize: '14px',
          color: '#1E293B',
          outline: 'none',
          fontFamily: 'inherit',
          padding: '8px 0',
        }}
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: !input.trim() || disabled
            ? '#E2E8F0'
            : 'linear-gradient(135deg, #60A5FA, #3B82F6)',
          border: 'none',
          cursor: !input.trim() || disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: !input.trim() || disabled ? 'none' : '0 4px 10px rgba(59,130,246,0.3)',
          transition: 'all 0.2s',
        }}
      >
        <Send size={16} color={!input.trim() || disabled ? '#94A3B8' : 'white'} />
      </button>
    </form>
  );
};
