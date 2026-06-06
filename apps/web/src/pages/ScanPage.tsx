import { useRef, useState } from 'react';
import { Camera, HelpCircle, X, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';

export default function ScanPage() {
  const navigate = useNavigate();
  const { createConversation, sendMessage } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);
    
    try {
      const convId = await createConversation('Análise de Medicamento');
      if (convId) {
        // We do not await sendMessage here so the user can see the loading state in the chat window,
        // or we can await it if we want to stay on the scan page until the first chunk arrives.
        // Usually, navigating immediately is better.
        sendMessage('Por favor, analise as informações deste medicamento.', uploadedFile);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to start analysis', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return;
    setUploadedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreview(null);
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: 800, color: '#1E3A5F' }}>
          📷 Escanear Medicamento
        </h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
          Envie a foto de uma bula, receita ou caixa de medicamento para análise inteligente.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Drop zone */}
        <div>
          {!uploadedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#3B82F6' : '#CBD5E1'}`,
                borderRadius: '24px',
                background: dragOver ? '#EFF6FF' : 'white',
                padding: '60px 40px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: '360px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            >
              {/* Scan frame visual */}
              <div style={{ position: 'relative', marginBottom: '28px' }}>
                <div style={{
                  width: 160, height: 160,
                  border: '2px solid #E2E8F0',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#F8FAFC',
                  position: 'relative',
                }}>
                  <Camera size={48} color="#CBD5E1" />
                  {/* Corner decorations */}
                  {[
                    { top: -2, left: -2, borderTop: '4px solid #14B8A6', borderLeft: '4px solid #14B8A6', borderRadius: '4px 0 0 0' },
                    { top: -2, right: -2, borderTop: '4px solid #14B8A6', borderRight: '4px solid #14B8A6', borderRadius: '0 4px 0 0' },
                    { bottom: -2, left: -2, borderBottom: '4px solid #14B8A6', borderLeft: '4px solid #14B8A6', borderRadius: '0 0 0 4px' },
                    { bottom: -2, right: -2, borderBottom: '4px solid #14B8A6', borderRight: '4px solid #14B8A6', borderRadius: '0 0 4px 0' },
                  ].map((style, i) => (
                    <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...style }} />
                  ))}
                </div>
              </div>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '16px', color: '#0F172A' }}>
                Arraste ou clique para enviar
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
                Suporta imagens (JPG, PNG) e PDF<br />até 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            /* Preview */
            <div style={{
              borderRadius: '24px', overflow: 'hidden',
              background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
              position: 'relative',
            }}>
              <button
                onClick={clearFile}
                style={{
                  position: 'absolute', top: 12, right: 12, zIndex: 10,
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} color="white" />
              </button>
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 360, objectFit: 'contain' }} />
              ) : (
                <div style={{
                  height: 200, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#F8FAFC',
                }}>
                  <FileText size={48} color="#64748B" />
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{uploadedFile.name}</span>
                </div>
              )}
              <div style={{ padding: '20px 24px' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>
                  {uploadedFile.name}
                </p>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '12px' }}>
                  {(uploadedFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button
            disabled={!uploadedFile || isAnalyzing}
            onClick={handleAnalyze}
            style={{
              marginTop: '16px', width: '100%', padding: '16px',
              borderRadius: '16px', border: 'none',
              background: uploadedFile
                ? 'linear-gradient(135deg, #14B8A6, #0D9488)'
                : '#E2E8F0',
              color: uploadedFile ? 'white' : '#94A3B8',
              fontWeight: 700, fontSize: '16px', cursor: (uploadedFile && !isAnalyzing) ? 'pointer' : 'not-allowed',
              boxShadow: uploadedFile ? '0 6px 24px rgba(20,184,166,0.35)' : 'none',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Iniciando Análise...
              </>
            ) : (
              <>
                🔍 Analisar Documento
              </>
            )}
          </button>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Instructions */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '20px 22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
              💡 Dicas para melhor resultado
            </h3>
            {[
              { icon: '☀️', text: 'Use boa iluminação' },
              { icon: '📐', text: 'Mantenha o documento reto' },
              { icon: '🔍', text: 'Certifique-se que o texto está legível' },
              { icon: '📏', text: 'Capture toda a bula ou receita' },
            ].map((tip) => (
              <div key={tip.text} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 0',
                borderBottom: '1px solid #F1F5F9',
              }}>
                <span style={{ fontSize: '18px' }}>{tip.icon}</span>
                <span style={{ fontSize: '13px', color: '#64748B' }}>{tip.text}</span>
              </div>
            ))}
          </div>

          {/* Accepted formats */}
          <div style={{
            background: '#EFF6FF', borderRadius: '20px', padding: '18px 22px',
            border: '1px solid #BFDBFE',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#1E3A5F' }}>
              📁 Formatos aceitos
            </h3>
            {[
              { label: 'JPG / PNG', desc: 'Fotos da câmera' },
              { label: 'PDF', desc: 'Documentos digitais' },
              { label: 'WEBP / HEIC', desc: 'Imagens modernas' },
            ].map((fmt) => (
              <div key={fmt.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                <span style={{ fontWeight: 600, color: '#3B82F6' }}>{fmt.label}</span>
                <span style={{ color: '#64748B' }}>{fmt.desc}</span>
              </div>
            ))}
          </div>

          {/* Help */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '18px 22px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HelpCircle size={20} color="#64748B" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#0F172A' }}>Precisa de ajuda?</div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>Consulte a IA para dúvidas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
