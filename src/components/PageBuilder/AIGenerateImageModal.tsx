import React, { useState, useRef } from 'react';

interface AIGenerateImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, options: any) => void;
  isGenerating: boolean;
  error?: string | null;
}

const PROMPT_TEMPLATES = [
  { label: 'Product Shot', value: 'A high-quality product photo of {product} on a white background.' },
  { label: 'Hero Banner', value: 'A modern, colorful hero banner for a SaaS landing page.' },
  { label: 'Team Avatar', value: 'A friendly, professional avatar for a team member.' },
  { label: 'Testimonial Portrait', value: 'A smiling customer portrait for a testimonial section.' },
  { label: 'Feature Icon', value: 'A flat, minimal icon representing {feature}.' },
  { label: 'Background Pattern', value: 'A subtle, abstract background pattern for a website.' },
];

const DEFAULT_MODEL = 'dall-e-3';
const DEFAULT_SIZE = '1024x1024';
const DEFAULT_STYLE = 'vivid';

export const AIGenerateImageModal: React.FC<AIGenerateImageModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  error
}) => {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const inputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPrompt('');
      if (inputRef.current) inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setHistory(prev => [prompt, ...prev.filter(p => p !== prompt)].slice(0, 5));
    onGenerate(prompt, { model, size, style });
  };

  const handleTemplate = (value: string) => {
    setPrompt(value);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleHistory = (value: string) => {
    setPrompt(value);
    if (inputRef.current) inputRef.current.focus();
  };

  const charCount = prompt.length;

  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1 rounded"
          onClick={onClose}
          aria-label="Close AI image modal"
        >✕</button>
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <span role="img" aria-label="sparkles">✨</span> AI Image Generation
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm font-medium mb-1">Prompt</label>
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Describe the image you want (e.g. A modern SaaS hero banner...)"
            aria-label="AI image prompt input"
            disabled={isGenerating}
          />
          <div className="flex flex-wrap gap-2 mb-1">
            {PROMPT_TEMPLATES.map(tpl => (
              <button
                key={tpl.label}
                type="button"
                className="px-2 py-1 text-xs rounded bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary"
                onClick={() => handleTemplate(tpl.value)}
                tabIndex={0}
              >{tpl.label}</button>
            ))}
          </div>
          {history.length > 0 && (
            <div className="mb-1">
              <span className="text-xs text-gray-500 mr-2">Recent:</span>
              {history.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  className="px-2 py-1 text-xs rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 mr-1"
                  onClick={() => handleHistory(h)}
                  tabIndex={0}
                >{h.length > 32 ? h.slice(0, 32) + '…' : h}</button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{charCount} chars</span>
            <span>Size: {size}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <label className="text-xs">Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="px-2 py-1 border border-gray-200 rounded text-xs"
              disabled={isGenerating}
            >
              <option value="dall-e-3">DALL·E 3</option>
              <option value="dall-e-2">DALL·E 2</option>
            </select>
            <label className="text-xs ml-2">Size</label>
            <select
              value={size}
              onChange={e => setSize(e.target.value)}
              className="px-2 py-1 border border-gray-200 rounded text-xs"
              disabled={isGenerating}
            >
              <option value="1024x1024">1024x1024</option>
              <option value="1024x1792">1024x1792</option>
              <option value="1792x1024">1792x1024</option>
              <option value="512x512">512x512</option>
            </select>
            <label className="text-xs ml-2">Style</label>
            <select
              value={style}
              onChange={e => setStyle(e.target.value)}
              className="px-2 py-1 border border-gray-200 rounded text-xs"
              disabled={isGenerating}
            >
              <option value="vivid">Vivid</option>
              <option value="natural">Natural</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
          <button
            type="submit"
            className="w-full mt-2 px-4 py-2 rounded-lg font-bold shadow bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isGenerating}
            aria-busy={isGenerating}
          >
            {isGenerating && <span className="loader border-white border-2 border-t-primary mr-2" style={{ width: 16, height: 16, borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />}
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>
        </form>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  ) : null;
}; 