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
    <div className="p-10 md:p-12 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-extrabold text-white">
          📷 Escanear Medicamento
        </h1>
        <p className="text-sm text-slate-400 m-0">
          Envie a foto de uma bula, receita ou caixa de medicamento para análise inteligente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Drop zone */}
        <div>
          {!uploadedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[360px] ${
                dragOver 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-white/20 bg-card-bg hover:border-white/30 hover:bg-white/5'
              }`}
            >
              {/* Scan frame visual */}
              <div className="relative mb-7">
                <div className="w-40 h-40 border-2 border-white/10 rounded-lg flex items-center justify-center bg-white/5 relative">
                  <Camera size={48} className="text-slate-500" />
                  {/* Corner decorations */}
                  {[
                    { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderRadius: '4px 0 0 0' },
                    { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderRadius: '0 4px 0 0' },
                    { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderRadius: '0 0 0 4px' },
                    { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderRadius: '0 0 4px 0' },
                  ].map((style, i) => (
                    <div key={i} className="absolute w-6 h-6 border-teal-500" style={style} />
                  ))}
                </div>
              </div>
              <p className="m-0 mb-1.5 font-bold text-base text-white">
                Arraste ou clique para enviar
              </p>
              <p className="m-0 text-[13px] text-slate-400 text-center">
                Suporta imagens (JPG, PNG) e PDF<br />até 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            /* Preview */
            <div className="rounded-[24px] overflow-hidden bg-card-bg relative border border-white/10">
              <button
                onClick={clearFile}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 border-none cursor-pointer flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
              {preview ? (
                <img src={preview} alt="Preview" className="w-full max-h-[360px] object-contain bg-black/20" />
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center gap-3 bg-white/5">
                  <FileText size={48} className="text-slate-500" />
                  <span className="font-semibold text-white">{uploadedFile.name}</span>
                </div>
              )}
              <div className="p-5 px-6 border-t border-white/10">
                <p className="m-0 mb-1 font-semibold text-white text-sm">
                  {uploadedFile.name}
                </p>
                <p className="m-0 text-slate-400 text-xs">
                  {(uploadedFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button
            disabled={!uploadedFile || isAnalyzing}
            onClick={handleAnalyze}
            className={`mt-4 w-full p-4 rounded-2xl border-none font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
              uploadedFile
                ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white cursor-pointer hover:shadow-[0_6px_24px_rgba(20,184,166,0.35)]'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
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
        <div className="flex flex-col gap-4">
          {/* Instructions */}
          <div className="bg-card-bg rounded-2xl p-5 px-6 border border-white/10">
            <h3 className="m-0 mb-3.5 text-[15px] font-bold text-white">
              💡 Dicas para melhor resultado
            </h3>
            {[
              { icon: '☀️', text: 'Use boa iluminação' },
              { icon: '📐', text: 'Mantenha o documento reto' },
              { icon: '🔍', text: 'Certifique-se que o texto está legível' },
              { icon: '📏', text: 'Capture toda a bula ou receita' },
            ].map((tip) => (
              <div key={tip.text} className="flex items-center gap-2.5 py-2 border-b border-white/5 last:border-0">
                <span className="text-lg">{tip.icon}</span>
                <span className="text-[13px] text-slate-400">{tip.text}</span>
              </div>
            ))}
          </div>

          {/* Accepted formats */}
          <div className="bg-blue-500/10 rounded-2xl p-4 px-6 border border-blue-500/20">
            <h3 className="m-0 mb-3 text-sm font-bold text-blue-400">
              📁 Formatos aceitos
            </h3>
            {[
              { label: 'JPG / PNG', desc: 'Fotos da câmera' },
              { label: 'PDF', desc: 'Documentos digitais' },
              { label: 'WEBP / HEIC', desc: 'Imagens modernas' },
            ].map((fmt) => (
              <div key={fmt.label} className="flex justify-between py-1.5 text-[13px]">
                <span className="font-semibold text-blue-400">{fmt.label}</span>
                <span className="text-slate-400">{fmt.desc}</span>
              </div>
            ))}
          </div>

          {/* Help */}
          <div className="bg-card-bg rounded-2xl p-4 px-6 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <HelpCircle size={20} className="text-slate-400" />
            </div>
            <div>
              <div className="font-semibold text-[13px] text-white">Precisa de ajuda?</div>
              <div className="text-xs text-slate-400">Consulte a IA para dúvidas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
