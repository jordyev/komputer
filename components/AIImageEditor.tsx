import React, { useState } from 'react';
import { Sparkles, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { editImageWithGemini } from '../services/geminiService';

interface AIImageEditorProps {
  currentImage: string;
  onSave: (newImage: string) => void;
  onCancel: () => void;
}

const AIImageEditor: React.FC<AIImageEditorProps> = ({ currentImage, onSave, onCancel }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // We need to ensure we have a base64 string to send to the API. 
  // If the currentImage is a URL (like picsum), we might need to convert it, 
  // but for this demo, we assume the user has either uploaded a file (base64) 
  // or we are operating on an existing valid image source.
  // Note: Gemini cannot download public URLs directly in this specific API call structure cleanly without tools,
  // so we'll rely on the assumption that if it's a URL, we fetch and convert it first, or prompt user to upload.
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      let imageToSend = currentImage;

      // Quick fetch to convert URL to base64 if needed
      if (currentImage.startsWith('http')) {
        const response = await fetch(currentImage);
        const blob = await response.blob();
        imageToSend = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const result = await editImageWithGemini(imageToSend, prompt);
      setGeneratedImage(result);
    } catch (err) {
        setError('Error al generar la imagen. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-lg p-4 gap-4 border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Estudio de Imagen IA
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-[300px]">
        {/* Original */}
        <div className="flex-1 flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Original</span>
            <div className="relative flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center border border-slate-300 dark:border-slate-700">
                <img src={currentImage} alt="Original" className="max-w-full max-h-64 object-contain" />
            </div>
        </div>

        {/* Generated */}
        <div className="flex-1 flex flex-col gap-2">
             <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vista Previa</span>
            <div className="relative flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center border border-slate-300 dark:border-slate-700 group">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-3 animate-pulse text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-medium">Procesando con Gemini 2.5...</span>
                    </div>
                ) : generatedImage ? (
                    <img src={generatedImage} alt="Generada" className="max-w-full max-h-64 object-contain" />
                ) : (
                    <div className="text-slate-400 dark:text-slate-500 text-sm text-center px-4">
                        Ingresa una instrucción para comenzar a editar
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}
        
        <div className="flex gap-2">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Añadir brillo neón, estilo dibujo, quitar fondo..."
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white dark:placeholder-slate-500"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generar
            </button>
        </div>

        {generatedImage && (
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                <button
                    onClick={() => setGeneratedImage(null)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                    Descartar
                </button>
                <button
                    onClick={() => onSave(generatedImage)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 shadow-sm"
                >
                    <Check className="w-4 h-4" />
                    Aplicar Cambios
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AIImageEditor;