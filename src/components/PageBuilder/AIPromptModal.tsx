import React, { useState, useRef } from 'react';

const PROMPT_TEMPLATES = [
  { label: 'Catchy Headline', value: 'Write a catchy headline for a landing page about {topic}.' },
  { label: 'Persuasive CTA', value: 'Write a persuasive call-to-action for {topic}.' },
  { label: 'Short FAQ Answer', value: 'Write a concise answer to the question: {question}.' },
  { label: 'Testimonial Quote', value: 'Write a short, authentic testimonial for {topic}.' },
  { label: 'Product Description', value: 'Write a compelling product description for {product}.' },
  { label: 'Newsletter Teaser', value: 'Write a newsletter signup teaser for {topic}.' },
];

const TONE_OPTIONS = [
  { label: 'Professional', value: 'professional' },
  { label: 'Friendly', value: 'friendly' },
  { label: 'Playful', value: 'playful' },
  { label: 'Bold', value: 'bold' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Excited', value: 'excited' },
  { label: 'Inspirational', value: 'inspirational' },
];

const STYLE_OPTIONS = [
  { label: 'Modern', value: 'modern' },
  { label: 'Classic', value: 'classic' },
  { label: 'Minimalist', value: 'minimalist' },
  { label: 'Colorful', value: 'colorful' },
  { label: 'Elegant', value: 'elegant' },
  { label: 'Tech', value: 'tech' },
  { label: 'Luxury', value: 'luxury' },
];

export interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, options?: { tone?: string; numSections?: number; style?: string; [key: string]: any }) => void;
  isGenerating: boolean;
  error?: string | null;
}

export const AIPromptModal: React.FC<AIPromptModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
  error
}) => {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [numSections, setNumSections] = useState(4);
  const [style, setStyle] = useState('modern');
  const [history, setHistory] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setTone('professional');
      setNumSections(4);
      setStyle('modern');
      setShowAdvanced(false);
      if (inputRef.current) inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setHistory((prev) => [prompt, ...prev.slice(0, 4)]);
    onGenerate(prompt, { tone, numSections, style });
  };

  const handleTemplate = (value: string) => {
    setPrompt(value);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleHistory = (value: string) => {
    setPrompt(value);
    if (inputRef.current) inputRef.current.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1 rounded" onClick={onClose} aria-label="Close AI modal">✕</button>
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><span role="img" aria-label="sparkles">✨</span> AI Content Generator</h3>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-1">Describe what you want to generate</label>
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Generate a hero section for a SaaS product..."
            aria-label="AI prompt"
            required
          />
          <div className="flex flex-wrap gap-2 mb-2">
            {PROMPT_TEMPLATES.map(t => (
              <button
                key={t.label}
                type="button"
                className="px-2 py-1 text-xs rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                onClick={() => handleTemplate(t.value)}
                tabIndex={0}
              >{t.label}</button>
            ))}
          </div>
          {history.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-gray-500 mr-2">Recent:</span>
              {history.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  className="px-2 py-1 text-xs rounded bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 mr-1"
                  onClick={() => handleHistory(h)}
                  tabIndex={0}
                >{h.length > 32 ? h.slice(0, 32) + '…' : h}</button>
              ))}
            </div>
          )}
          <button
            type="button"
            className="text-xs text-indigo-600 underline mb-2"
            onClick={() => setShowAdvanced(v => !v)}
            aria-expanded={showAdvanced}
          >{showAdvanced ? 'Hide' : 'Show'} advanced options</button>
          {showAdvanced && (
            <div className="mb-2 space-y-2">
              <div className="flex gap-2 items-center">
                <label className="text-xs font-medium w-24">Tone</label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs"
                  aria-label="Tone"
                >
                  {TONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-xs font-medium w-24"># Sections</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={numSections}
                  onChange={e => setNumSections(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-xs"
                  aria-label="Number of sections"
                />
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={numSections}
                  onChange={e => setNumSections(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                  aria-label="Number of sections slider"
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-xs font-medium w-24">Style</label>
                <select
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs"
                  aria-label="Style"
                >
                  {STYLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg font-bold shadow bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              disabled={isGenerating}
            >{isGenerating ? 'Generating…' : 'Generate'}</button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg font-bold shadow bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={onClose}
              disabled={isGenerating}
            >Cancel</button>
          </div>
          {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};