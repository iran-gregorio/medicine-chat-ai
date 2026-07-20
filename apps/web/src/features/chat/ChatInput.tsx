import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string, file?: File) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || disabled) return;
    onSend(input.trim(), selectedFile || undefined);
    setInput('');
    clearFile();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        alert('Por favor, selecione apenas arquivos de imagem.');
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        background: 'var(--color-dashboard-dark)',
        borderRadius: '24px',
        border: '1px solid var(--color-card-border)',
        padding: '6px 6px 6px 16px',
        transition: 'border-color 0.2s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-accent-blue)';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.25)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-card-border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {previewUrl && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <img 
            src={previewUrl} 
            alt="Preview" 
            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} 
          />
          <button
            type="button"
            onClick={clearFile}
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: 'none',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: '#94A3B8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Paperclip size={20} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
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
          color: '#F8FAFC',
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
          background: (!input.trim() && !selectedFile) || disabled
            ? 'rgba(255,255,255,0.05)'
            : 'var(--color-accent-blue)',
          border: 'none',
          cursor: (!input.trim() && !selectedFile) || disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: (!input.trim() && !selectedFile) || disabled ? 'none' : '0 4px 10px rgba(59,130,246,0.3)',
          transition: 'all 0.2s',
        }}
      >
        <Send size={16} color={(!input.trim() && !selectedFile) || disabled ? '#94A3B8' : 'white'} />
      </button>
    </form>
  );
};
