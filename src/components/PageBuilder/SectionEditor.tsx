import React, { useState } from 'react';
// import { Settings } from 'lucide-react';
import type { PageSection, PricingContent, GalleryContent, CountdownContent, ContactContent, NewsletterContent, SocialContent, CustomContent } from '../../types';
import type { PricingPlan } from '../../types';
import { usePageBuilderStore } from '../../store/pageBuilderStore';
import { Info } from 'lucide-react';
import { MediaPicker } from './MediaPicker';
import { Sparkles } from 'lucide-react';
import { AIPromptModal } from './AIPromptModal';
import { generateText } from '../../lib/openai';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SectionEditorProps {
  section: PageSection;
  onUpdate: (updates: Partial<PageSection>) => void;
}

// Section type meta and type-safe handling for all section types
const sectionTypeMeta = {
  hero:    { color: 'indigo', icon: '🎯', label: 'Hero' },
  features:{ color: 'blue', icon: '⭐', label: 'Features' },
  testimonials: { color: 'violet', icon: '💬', label: 'Testimonials' },
  faq:     { color: 'amber', icon: '❓', label: 'FAQ' },
  cta:     { color: 'purple', icon: '🚀', label: 'CTA' },
  pricing: { color: 'green', icon: '💰', label: 'Pricing' },
  gallery: { color: 'sky', icon: '🖼️', label: 'Gallery' },
  video:   { color: 'fuchsia', icon: '🎬', label: 'Video' },
  countdown: { color: 'yellow', icon: '⏳', label: 'Countdown' },
  contact: { color: 'pink', icon: '📞', label: 'Contact' },
  newsletter: { color: 'indigo', icon: '📧', label: 'Newsletter' },
  social:  { color: 'gray', icon: '👥', label: 'Social Proof' },
  custom:  { color: 'orange', icon: '🛠️', label: 'Custom HTML' },
};

export const SectionEditor: React.FC<SectionEditorProps> = ({ section, onUpdate }) => {
  // Collapsible state
  const [contentOpen, setContentOpen] = useState(true);
  const [designOpen, setDesignOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // AI Suggestion Modal State
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [aiTargetField, setAITargetField] = useState<string | null>(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const { globalDesign } = usePageBuilderStore();

  // Wrap onUpdate to track changes
  const handleUpdate = (updates: Partial<PageSection>) => {
    setHasChanges(true);
    onUpdate(updates);
  };

  const updateContent = (key: keyof PageSection["content"], value: unknown) => {
    handleUpdate({
      content: {
        ...section.content,
        [key]: value
      }
    });
  };

  const updateStyles = (key: keyof PageSection["styles"], value: unknown) => {
    handleUpdate({
      styles: {
        ...section.styles,
        [key]: value
      }
    });
  };

  const meta = sectionTypeMeta[section.type] || { color: 'indigo', icon: '⚡', label: section.type };

  // Live mini-preview (reuse SectionRenderer if possible, or a minimal preview)
  // For simplicity, just show the section title and icon for now

  // Live preview of global styles
  const GlobalPreview = () => (
    <div className="mb-4 p-4 rounded-lg border border-border bg-background shadow flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg" style={{ fontFamily: globalDesign.fontFamily.heading, fontSize: globalDesign.fontSize.heading, fontWeight: globalDesign.fontWeight.heading, letterSpacing: globalDesign.letterSpacing.heading, lineHeight: globalDesign.lineHeight.heading, color: globalDesign.colorPalette.primary }}>Heading Preview</span>
        <Info className="h-4 w-4 text-muted-foreground" title="This preview uses your global typography and color settings." />
      </div>
      <p className="text-sm" style={{ fontFamily: globalDesign.fontFamily.body, fontSize: globalDesign.fontSize.body, fontWeight: globalDesign.fontWeight.body, letterSpacing: globalDesign.letterSpacing.body, lineHeight: globalDesign.lineHeight.body, color: globalDesign.colorPalette.text }}>This is a sample paragraph using your global body font and color.</p>
      <Button
        className="px-4 py-2 text-sm font-semibold"
        style={{
          background: globalDesign.buttonStyles.color,
          color: globalDesign.colorPalette.background,
          borderRadius: globalDesign.buttonStyles.shape === 'pill' ? 999 : globalDesign.buttonStyles.borderRadius,
          border: `${globalDesign.buttonStyles.borderWidth}px solid ${globalDesign.buttonStyles.borderColor}`,
          fontFamily: globalDesign.buttonStyles.font,
          boxShadow: globalDesign.buttonStyles.shadow ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
        }}
      >
        Button Preview
      </Button>
    </div>
  );

  // Handler to open AI modal for a field
  const handleAISuggest = (field: string) => {
    setAITargetField(field);
    setAIModalOpen(true);
  };

  // Handler to receive AI suggestion and update the field
  const handleAIGenerate = async (prompt: string) => {
    setIsAIGenerating(true);
    try {
      // Use OpenAI API for real suggestions
      const suggestion = await generateText(prompt, { maxTokens: 80 });
      if (aiTargetField) {
        if (aiTargetField === 'title' || aiTargetField === 'subtitle' || aiTargetField === 'buttonText' || aiTargetField === 'description' || aiTargetField === 'placeholder' || aiTargetField === 'html') {
          updateContent(aiTargetField as keyof typeof section.content, suggestion);
        } else if (aiTargetField.startsWith('feature-title-')) {
          const idx = Number(aiTargetField.split('-').pop());
          const features = [...(section.content.features || [])];
          features[idx] = { ...features[idx], title: suggestion };
          updateContent('features', features);
        } else if (aiTargetField.startsWith('feature-desc-')) {
          const idx = Number(aiTargetField.split('-').pop());
          const features = [...(section.content.features || [])];
          features[idx] = { ...features[idx], description: suggestion };
          updateContent('features', features);
        } else if (aiTargetField.startsWith('testimonial-quote-')) {
          const idx = Number(aiTargetField.split('-').pop());
          const testimonials = [...(section.content.testimonials || [])];
          testimonials[idx] = { ...testimonials[idx], quote: suggestion };
          updateContent('testimonials', testimonials);
        } else if (aiTargetField.startsWith('faq-question-')) {
          const idx = Number(aiTargetField.split('-').pop());
          const faqs = [...(section.content.faqs || [])];
          faqs[idx] = { ...faqs[idx], question: suggestion };
          updateContent('faqs', faqs);
        } else if (aiTargetField.startsWith('faq-answer-')) {
          const idx = Number(aiTargetField.split('-').pop());
          const faqs = [...(section.content.faqs || [])];
          faqs[idx] = { ...faqs[idx], answer: suggestion };
          updateContent('faqs', faqs);
        } else if (aiTargetField === 'pricing-title') {
          updateContent('title', suggestion);
        } else if (aiTargetField.startsWith('newsletter-desc')) {
          updateContent('description', suggestion);
        } else if (aiTargetField.startsWith('newsletter-placeholder')) {
          updateContent('placeholder', suggestion);
        } else if (aiTargetField.startsWith('gallery-title')) {
          updateContent('title', suggestion);
        } else if (aiTargetField.startsWith('video-title')) {
          updateContent('title', suggestion);
        } else if (aiTargetField.startsWith('countdown-title')) {
          updateContent('title', suggestion);
        } else if (aiTargetField.startsWith('contact-title')) {
          updateContent('title', suggestion);
        } else if (aiTargetField.startsWith('custom-html')) {
          updateContent('html', suggestion);
        }
      }
      setAIModalOpen(false);
      setAITargetField(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate suggestion.';
      alert(message);
    } finally {
      setIsAIGenerating(false);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br from-background to-${meta.color}-50 rounded-l-2xl shadow-2xl border-l border-${meta.color}-200`}>
      {/* Accent Bar & Section Type */}
      <div className={`sticky top-0 z-10 p-6 border-b border-${meta.color}-200 bg-background/80 backdrop-blur flex items-center space-x-3 rounded-tl-2xl`}>
        <span className={`text-2xl`} style={{ color: `var(--tw-${meta.color}-600, #6366f1)` }}>{meta.icon}</span>
        <h3 className={`text-lg font-extrabold text-${meta.color}-700 capitalize tracking-wide`}>{meta.label} Settings</h3>
        </div>
      {/* Global Styles Preview */}
      <div className="px-6 pt-4"><GlobalPreview /></div>
      {/* Live Mini-Preview */}
      <div className="flex items-center gap-3 px-6 py-3 bg-background/80 border-b border-border">
        <span className={`text-xl`} style={{ color: `var(--tw-${meta.color}-600, #6366f1)` }}>{meta.icon}</span>
        <span className="font-semibold text-foreground truncate">{section.content.title || meta.label}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Collapsible Content Panel */}
        <div className="rounded-lg shadow border border-border bg-background/90">
          <Button
            className={`w-full flex items-center justify-between px-4 py-3 font-bold text-${meta.color}-700 focus:outline-none`}
            onClick={() => setContentOpen(v => !v)}
            aria-expanded={contentOpen}
            aria-controls="content-panel"
          >
            <span>Content</span>
            <svg className={`h-5 w-5 transform transition-transform ${contentOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path fill="currentColor" d="M7 7l3-3 3 3m0 6l-3 3-3-3"/></svg>
          </Button>
          <div id="content-panel" className={`transition-all duration-300 overflow-hidden ${contentOpen ? 'max-h-[1000px] p-4' : 'max-h-0 p-0'}`}
            aria-hidden={!contentOpen}
          >
        {/* Content Settings */}
        <div>
              <h4 className={`text-base font-bold text-${meta.color}-700 mb-3`}>Content</h4>
              <div className="space-y-6">
            {section.type === 'hero' && (
              <>
                <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    Title
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="ml-1 p-1 rounded hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500"
                      title="AI Suggest Title"
                      onClick={() => handleAISuggest('title')}
                    >
                      <Sparkles className="h-4 w-4 text-primary-500" />
                    </Button>
                  </label>
                  <Input
                    type="text"
                    value={section.content.title || ''}
                    onChange={e => updateContent('title', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500"
                  />
                </div>
                <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    Subtitle
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="ml-1 p-1 rounded hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500"
                      title="AI Suggest Subtitle"
                      onClick={() => handleAISuggest('subtitle')}
                    >
                      <Sparkles className="h-4 w-4 text-primary-500" />
                    </Button>
                  </label>
                  <Input
                    as="textarea"
                    value={section.content.subtitle || ''}
                    onChange={e => updateContent('subtitle', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500"
                  />
                </div>
                <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    Button Text
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="ml-1 p-1 rounded hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500"
                      title="AI Suggest Button Text"
                      onClick={() => handleAISuggest('buttonText')}
                    >
                      <Sparkles className="h-4 w-4 text-primary-500" />
                    </Button>
                  </label>
                  <Input
                    type="text"
                    value={section.content.buttonText || ''}
                    onChange={e => updateContent('buttonText', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500"
                  />
                </div>
                <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                  <MediaPicker
                    label="Background Image"
                    value={section.content.backgroundImage ? [section.content.backgroundImage] : []}
                    onChange={urls => updateContent('backgroundImage', urls[0] || '')}
                    multiple={false}
                    altText={section.content.title || 'Hero background'}
                  />
                </div>
              </>
            )}

            {section.type === 'features' && (
              <>
                <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    Section Title
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="ml-1 p-1 rounded hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500"
                      title="AI Suggest Title"
                      onClick={() => handleAISuggest('title')}
                    >
                      <Sparkles className="h-4 w-4 text-primary-500" />
                    </Button>
                  </label>
                  <Input
                    type="text"
                    value={section.content.title || ''}
                    onChange={e => updateContent('title', e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500"
                  />
                </div>
                <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Features
                  </label>
                  {(section.content.features || []).map((feature: { title: string; description: string; icon?: string }, index: number) => (
                    <div key={index} className="space-y-2 p-3 border border-border rounded-md mb-2">
                      <div className="flex gap-2 items-center">
                      <Input
                        type="text"
                        value={feature.title || ''}
                        onChange={e => {
                          const newFeatures = [...(section.content.features || [])];
                          newFeatures[index] = { ...feature, title: e.target.value };
                          updateContent('features', newFeatures);
                        }}
                        placeholder="Feature title"
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500"
                      />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="ml-1 p-1 rounded hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500"
                          title="AI Suggest Feature Title"
                          onClick={() => handleAISuggest(`feature-title-${index}`)}
                        >
                          <Sparkles className="h-4 w-4 text-primary-500" />
                        </Button>
                      </div>
                      <div className="flex gap-2 items-center">
                      <Input
                        as="textarea"
                        value={feature.description || ''}
                        onChange={e => {
                          const newFeatures = [...(section.content.features || [])];
                          newFeatures[index] = { ...feature, description: e.target.value };
                          updateContent('features', newFeatures);
                        }}
                        placeholder="Feature description"
                        rows={2}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="ml-1 p-1 rounded hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500"
                          title="AI Suggest Feature Description"
                          onClick={() => handleAISuggest(`feature-desc-${index}`)}
                        >
                          <Sparkles className="h-4 w-4 text-primary-500" />
                        </Button>
                      </div>
                      <MediaPicker
                        label="Feature Icon (optional)"
                        value={feature.icon ? [feature.icon] : []}
                        onChange={urls => {
                          const newFeatures = [...(section.content.features || [])];
                          newFeatures[index] = { ...feature, icon: urls[0] || '' };
                          updateContent('features', newFeatures);
                        }}
                        multiple={false}
                        altText={feature.title || 'Feature icon'}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

                {section.type === 'pricing' && (
                  <>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        Section Title
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="ml-1 p-1 rounded hover:bg-green-100 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500"
                          title="AI Suggest Pricing Title"
                          onClick={() => handleAISuggest('pricing-title')}
                        >
                          <Sparkles className="h-4 w-4 text-primary-500" />
                        </Button>
                      </label>
                      <Input
                        type="text"
                        value={(section.content as PricingContent).title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500"
                      />
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <div className="mt-4 flex items-center gap-4">
                        <label className="block text-sm font-medium text-foreground">Currency</label>
                        <select
                          value={(section.content as PricingContent).currency}
                          onChange={e => updateContent('currency', e.target.value)}
                          className="px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                        </select>
          </div>
        </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Pricing Plans
                      </label>
          <div className="space-y-4">
                        {((section.content as PricingContent).plans || []).map((plan: PricingPlan, idx: number) => (
                          <div key={idx} className="p-4 border border-green-200 rounded-md bg-green-50">
                            <div className="flex gap-2 mb-2">
                              <Input
                                type="text"
                                value={plan.name || ''}
                                onChange={e => {
                                  const newPlans = [...((section.content as PricingContent).plans)];
                                  newPlans[idx] = { ...plan, name: e.target.value };
                                  updateContent('plans', newPlans);
                                }}
                                placeholder="Plan name"
                                className="flex-1 px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500"
                              />
                              <Input
                                type="text"
                                value={plan.price || ''}
                                onChange={e => {
                                  const newPlans = [...((section.content as PricingContent).plans)];
                                  newPlans[idx] = { ...plan, price: e.target.value };
                                  updateContent('plans', newPlans);
                                }}
                                placeholder="Price"
                                className="w-24 px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  const newPlans = [...((section.content as PricingContent).plans)];
                                  newPlans.splice(idx, 1);
                                  updateContent('plans', newPlans);
                                }}
                                className="ml-2 px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                              >
                                Remove
                              </Button>
                            </div>
            <div>
                              <label className="block text-xs font-medium text-foreground mb-1">Features</label>
                              <div className="space-y-1">
                                {(Array.isArray(plan.features) ? plan.features : []).map((feature, fIdx) => (
                                  <div key={fIdx} className="flex gap-2 items-center">
                                    <Input
                                      type="text"
                                      value={feature}
                                      onChange={e => {
                                        const newPlans = [...((section.content as PricingContent).plans)];
                                        const newFeatures = [...(plan.features || [])];
                                        newFeatures[fIdx] = e.target.value;
                                        newPlans[idx] = { ...plan, features: newFeatures };
                                        updateContent('plans', newPlans);
                                      }}
                                      placeholder="Feature"
                                      className="flex-1 px-2 py-1 border border-input rounded"
                                    />
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        const newPlans = [...((section.content as PricingContent).plans)];
                                        const newFeatures = [...(plan.features || [])];
                                        newFeatures.splice(fIdx, 1);
                                        newPlans[idx] = { ...plan, features: newFeatures };
                                        updateContent('plans', newPlans);
                                      }}
                                      className="text-xs text-red-500 border border-red-200 rounded px-1 hover:bg-red-50"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button
                                type="button"
                                onClick={() => {
                                  const newPlans = [...((section.content as PricingContent).plans)];
                                  const newFeatures = [...(plan.features || []), ''];
                                  newPlans[idx] = { ...plan, features: newFeatures };
                                  updateContent('plans', newPlans);
                                }}
                                className="mt-2 px-2 py-1 text-xs text-green-700 border border-green-200 rounded hover:bg-green-100"
                              >
                                Add Feature
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          const newPlans = [...(((section.content as PricingContent).plans) || []), { name: '', price: '', features: [] }];
                          updateContent('plans', newPlans);
                        }}
                        className="mt-4 px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                      >
                        Add Plan
                      </Button>
                    </div>
                  </>
                )}
                {section.type === 'testimonials' && (
                  <>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        Section Title
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="ml-1 p-1 rounded hover:bg-violet-100 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500"
                          title="AI Suggest Title"
                          onClick={() => handleAISuggest('title')}
                        >
                          <Sparkles className="h-4 w-4 text-primary-500" />
                        </Button>
                      </label>
                      <Input
                        type="text"
                        value={section.content.title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500"
                      />
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Testimonials
                      </label>
                      {(section.content.testimonials || []).map((testimonial: { name: string; quote: string; avatar?: string; rating?: number }, index: number) => (
                        <div key={index} className="space-y-2 p-3 border border-border rounded-md mb-2">
                          <Input
                            type="text"
                            value={testimonial.name || ''}
                            onChange={e => {
                              const newTestimonials = [...(section.content.testimonials || [])];
                              newTestimonials[index] = { ...testimonial, name: e.target.value };
                              updateContent('testimonials', newTestimonials);
                            }}
                            placeholder="Name"
                            className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500"
                          />
                          <div className="flex gap-2 items-center">
                            <Input
                              as="textarea"
                              value={testimonial.quote || ''}
                              onChange={e => {
                                const newTestimonials = [...(section.content.testimonials || [])];
                                newTestimonials[index] = { ...testimonial, quote: e.target.value };
                                updateContent('testimonials', newTestimonials);
                              }}
                              placeholder="Testimonial quote"
                              rows={2}
                              className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="ml-1 p-1 rounded hover:bg-violet-100 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500"
                              title="AI Suggest Testimonial Quote"
                              onClick={() => handleAISuggest(`testimonial-quote-${index}`)}
                            >
                              <Sparkles className="h-4 w-4 text-primary-500" />
                            </Button>
                          </div>
                          <MediaPicker
                            label="Avatar (optional)"
                            value={testimonial.avatar ? [testimonial.avatar] : []}
                            onChange={urls => {
                              const newTestimonials = [...(section.content.testimonials || [])];
                              newTestimonials[index] = { ...testimonial, avatar: urls[0] || '' };
                              updateContent('testimonials', newTestimonials);
                            }}
                            multiple={false}
                            altText={testimonial.name || 'Testimonial avatar'}
                          />
                          <label className="block text-xs font-medium text-muted-foreground mt-1">Rating</label>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            value={testimonial.rating || 5}
                            onChange={e => {
                              const newTestimonials = [...(section.content.testimonials || [])];
                              newTestimonials[index] = { ...testimonial, rating: Number(e.target.value) };
                              updateContent('testimonials', newTestimonials);
                            }}
                            className="w-20 px-2 py-1 border border-input rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {section.type === 'gallery' && (
                  <>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Section Title
                      </label>
                      <Input
                        type="text"
                        value={(section.content as GalleryContent).title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <MediaPicker
                        label="Gallery Images"
                        value={(section.content as GalleryContent).images || []}
                        onChange={urls => updateContent('images', urls)}
                        multiple={true}
                        altText={section.content.title || 'Gallery image'}
                      />
                    </div>
                  </>
                )}
                {section.type === 'video' && (
                  <>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Section Title
                      </label>
                      <Input
                        type="text"
                        value={section.content.title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      />
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Video Provider
                      </label>
                      <select
                        value={section.content.provider || 'youtube'}
                        onChange={e => updateContent('provider', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500 mb-2"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="custom">Custom Embed</option>
                      </select>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Video URL (YouTube, Vimeo, or custom embed)
                      </label>
                      <Input
                        type="url"
                        value={section.content.videoUrl || ''}
                        onChange={e => updateContent('videoUrl', e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      />
                      <MediaPicker
                        label="Video Thumbnail (optional)"
                        value={section.content.thumbnail ? [section.content.thumbnail] : []}
                        onChange={urls => updateContent('thumbnail', urls[0] || '')}
                        multiple={false}
                        altText={section.content.title || 'Video thumbnail'}
                      />
                    </div>
                  </>
                )}
                {section.type === 'countdown' && (
                  <>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Section Title
                      </label>
                      <Input
                        type="text"
                        value={(section.content as CountdownContent).title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:border-yellow-500"
                      />
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
              <label className="block text-sm font-medium text-foreground mb-2">
                        End Date & Time
              </label>
              <Input
                        type="datetime-local"
                        value={(section.content as CountdownContent).endDate || ''}
                        onChange={e => updateContent('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:border-yellow-500"
              />
            </div>
                  </>
                )}
                {section.type === 'contact' && (
                  <>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
              <label className="block text-sm font-medium text-foreground mb-2">
                        Section Title
              </label>
              <Input
                        type="text"
                        value={(section.content as ContactContent).title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:border-pink-500"
              />
            </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
              <label className="block text-sm font-medium text-foreground mb-2">
                        Form Fields
              </label>
                      <div className="space-y-2">
                        {(Array.isArray((section.content as ContactContent).fields) ? (section.content as ContactContent).fields : []).map((field, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Input
                              type="text"
                              value={field.label}
                              onChange={e => {
                                const newFields = [...((section.content as ContactContent).fields)];
                                newFields[idx] = { ...field, label: e.target.value };
                                updateContent('fields', newFields);
                              }}
                              placeholder="Field label"
                              className="flex-1 px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:border-pink-500"
                            />
              <select
                              value={field.type}
                              onChange={e => {
                                const newFields = [...((section.content as ContactContent).fields)];
                                newFields[idx] = { ...field, type: e.target.value };
                                updateContent('fields', newFields);
                              }}
                              className="px-2 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:border-pink-500"
                            >
                              <option value="text">Text</option>
                              <option value="email">Email</option>
                              <option value="tel">Phone</option>
                              <option value="textarea">Textarea</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={e => {
                                  const newFields = [...((section.content as ContactContent).fields)];
                                  newFields[idx] = { ...field, required: e.target.checked };
                                  updateContent('fields', newFields);
                                }}
                              />
                              Required
                            </label>
                            <Button
                              type="button"
                              onClick={() => {
                                const newFields = [...((section.content as ContactContent).fields)];
                                newFields.splice(idx, 1);
                                updateContent('fields', newFields);
                              }}
                              className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          const newFields = [...(((section.content as ContactContent).fields) || []), { label: '', type: 'text', required: false }];
                          updateContent('fields', newFields);
                        }}
                        className="mt-2 px-4 py-2 text-sm text-white bg-pink-600 rounded hover:bg-pink-700"
                      >
                        Add Field
                      </Button>
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border mt-4">
                      <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                        Integrations <Info className="h-4 w-4 text-muted-foreground" title="Connect your form to Google Sheets." />
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={!!section.content.integrations?.googleSheets}
                          onChange={e => {
                            updateContent('integrations', {
                              ...section.content.integrations,
                              googleSheets: e.target.checked
                                ? { connected: false, sheetName: '', sheetId: '' }
                                : undefined
                            });
                          }}
                          id="googleSheets-integration"
                        />
                        <label htmlFor="googleSheets-integration" className="text-sm">Enable Google Sheets</label>
                      </div>
                      {section.content.integrations?.googleSheets && (
                        <div className="space-y-2">
                          {!section.content.integrations.googleSheets.connected ? (
                            <Button
                              type="button"
                              className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                              onClick={() => {
                                // Simulate OAuth and sheet selection
                                updateContent('integrations', {
                                  ...section.content.integrations,
                                  googleSheets: {
                                    connected: true,
                                    sheetName: 'Demo Sheet',
                                    sheetId: 'sheet123'
                                  }
                                });
                              }}
                            >Connect Google Sheets</Button>
                          ) : (
                            <div className="text-xs text-green-700 flex items-center gap-2">
                              <span>Connected to:</span>
                              <span className="font-bold">{section.content.integrations.googleSheets.sheetName}</span>
                              <Button
                                type="button"
                                className="ml-2 px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                                onClick={() => {
                                  updateContent('integrations', {
                                    ...section.content.integrations,
                                    googleSheets: undefined
                                  });
                                }}
                              >Disconnect</Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {section.type === 'newsletter' && (
                  <>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Section Title
                      </label>
                      <Input
                        type="text"
                        value={(section.content as NewsletterContent).title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                      />
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <Input
                        as="textarea"
                        value={(section.content as NewsletterContent).description || ''}
                        onChange={e => updateContent('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                      />
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Input Placeholder
                      </label>
                      <Input
                        type="text"
                        value={(section.content as NewsletterContent).placeholder || ''}
                        onChange={e => updateContent('placeholder', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                      />
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border mt-4">
                      <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                        Integrations <Info className="h-4 w-4 text-muted-foreground" title="Connect your form to Google Sheets." />
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={!!section.content.integrations?.googleSheets}
                          onChange={e => {
                            updateContent('integrations', {
                              ...section.content.integrations,
                              googleSheets: e.target.checked
                                ? { connected: false, sheetName: '', sheetId: '' }
                                : undefined
                            });
                          }}
                          id="googleSheets-integration-newsletter"
                        />
                        <label htmlFor="googleSheets-integration-newsletter" className="text-sm">Enable Google Sheets</label>
                      </div>
                      {section.content.integrations?.googleSheets && (
                        <div className="space-y-2">
                          {!section.content.integrations.googleSheets.connected ? (
                            <Button
                              type="button"
                              className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                              onClick={() => {
                                // Simulate OAuth and sheet selection
                                updateContent('integrations', {
                                  ...section.content.integrations,
                                  googleSheets: {
                                    connected: true,
                                    sheetName: 'Demo Sheet',
                                    sheetId: 'sheet123'
                                  }
                                });
                              }}
                            >Connect Google Sheets</Button>
                          ) : (
                            <div className="text-xs text-green-700 flex items-center gap-2">
                              <span>Connected to:</span>
                              <span className="font-bold">{section.content.integrations.googleSheets.sheetName}</span>
                              <Button
                                type="button"
                                className="ml-2 px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                                onClick={() => {
                                  updateContent('integrations', {
                                    ...section.content.integrations,
                                    googleSheets: undefined
                                  });
                                }}
                              >Disconnect</Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {section.type === 'social' && (
                  <>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Section Title
                      </label>
                      <Input
                        type="text"
                        value={(section.content as SocialContent).title || ''}
                        onChange={e => updateContent('title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:border-gray-500"
                      />
                    </div>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <MediaPicker
                        label="Logo/Image URLs"
                        value={(section.content as SocialContent).logos || []}
                        onChange={urls => updateContent('logos', urls)}
                        multiple={true}
                        altText={section.content.title || 'Social logo'}
                      />
                    </div>
                  </>
                )}
                {section.type === 'custom' && (
                  <>
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Custom HTML
                      </label>
                      <Input
                        as="textarea"
                        value={(section.content as CustomContent).html || ''}
                        onChange={e => updateContent('html', e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 font-mono text-xs"
                        placeholder="<div>Custom HTML here</div>"
                      />
                      <p className="mt-2 text-xs text-muted-foreground">You can enter any valid HTML. Use with caution.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <hr className={`my-2 border-border`} />
            {/* Collapsible Design Panel */}
            <div className="rounded-lg shadow border border-border bg-background/90">
              <Button
                className={`w-full flex items-center justify-between px-4 py-3 font-bold text-${meta.color}-700 focus:outline-none`}
                onClick={() => setDesignOpen(v => !v)}
                aria-expanded={designOpen}
                aria-controls="design-panel"
              >
                <span>Design</span>
                <svg className={`h-5 w-5 transform transition-transform ${designOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path fill="currentColor" d="M7 7l3-3 3 3m0 6l-3 3-3-3"/></svg>
              </Button>
              <div id="design-panel" className={`transition-all duration-300 overflow-hidden ${designOpen ? 'max-h-[1000px] p-4' : 'max-h-0 p-0'}`}
                aria-hidden={!designOpen}
              >
                {/* Design Settings */}
                <div>
                  <h4 className={`text-base font-bold text-${meta.color}-700 mb-3`}>Design</h4>
                  <div className="space-y-4">
                    {/* Background Color with Reset */}
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border flex items-center gap-2">
                      <label className="block text-sm font-medium mb-2 flex-1" style={{ color: `var(--tw-${meta.color}-700, #6366f1)` }}>Background Color</label>
                      <input
                        type="color"
                        value={section.styles.backgroundColor || globalDesign.colorPalette.background}
                        onChange={e => updateStyles('backgroundColor', e.target.value)}
                        className="w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
                        style={{ outlineColor: `var(--tw-${meta.color}-500, #6366f1)` }}
                      />
                      <Button
                        className="ml-2 text-xs text-muted-foreground underline hover:text-indigo-600"
                        title="Reset to global background color"
                        onClick={() => updateStyles('backgroundColor', undefined)}
                      >Reset</Button>
                    </div>
                    {/* Text Color with Reset */}
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border flex items-center gap-2">
                      <label className="block text-sm font-medium mb-2 flex-1" style={{ color: `var(--tw-${meta.color}-700, #6366f1)` }}>Text Color</label>
                      <input
                        type="color"
                        value={section.styles.textColor || globalDesign.colorPalette.text}
                        onChange={e => updateStyles('textColor', e.target.value)}
                        className="w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
                        style={{ outlineColor: `var(--tw-${meta.color}-500, #6366f1)` }}
                      />
                      <Button
                        className="ml-2 text-xs text-muted-foreground underline hover:text-indigo-600"
                        title="Reset to global text color"
                        onClick={() => updateStyles('textColor', undefined)}
                      >Reset</Button>
                    </div>
                    {/* Padding with Reset */}
                    <div className="bg-background/90 rounded-lg shadow p-3 border border-border flex items-center gap-2">
                      <label className="block text-sm font-medium mb-2 flex-1" style={{ color: `var(--tw-${meta.color}-700, #6366f1)` }}>Padding</label>
                      <input
                        type="range"
                        min={0}
                        max={120}
                        step={4}
                        value={parseInt((section.styles.padding || globalDesign.responsive.sectionSpacing || '60').toString())}
                        onChange={e => updateStyles('padding', `${e.target.value}px 0`)}
                        className={`w-full accent-${meta.color}-500`}
                      />
                      <Button
                        className="ml-2 text-xs text-muted-foreground underline hover:text-indigo-600"
                        title="Reset to global section spacing"
                        onClick={() => updateStyles('padding', undefined)}
                      >Reset</Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Info className="h-3 w-3" />Tip: Use the color pickers to match your brand. Use 'Reset' to revert to global defaults.</div>
                </div>
              </div>
            </div>
            <hr className={`my-2 border-border`} />
            {/* Collapsible Advanced Panel */}
            <div className="rounded-lg shadow border border-border bg-background/90">
              <Button
                className={`w-full flex items-center justify-between px-4 py-3 font-bold text-${meta.color}-700 focus:outline-none`}
                onClick={() => setAdvancedOpen(v => !v)}
                aria-expanded={advancedOpen}
                aria-controls="advanced-panel"
              >
                <span>Advanced <span className="ml-2 text-xs text-muted-foreground">(Animation, Responsive, Custom)</span></span>
                <svg className={`h-5 w-5 transform transition-transform ${advancedOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20"><path fill="currentColor" d="M7 7l3-3 3 3m0 6l-3 3-3-3"/></svg>
              </Button>
              <div id="advanced-panel" className={`transition-all duration-300 overflow-hidden ${advancedOpen ? 'max-h-[1000px] p-4' : 'max-h-0 p-0'}`}
                aria-hidden={!advancedOpen}
              >
                <div className="space-y-4">
                  {/* Animation Controls with tooltips */}
                  <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                    <label className="block text-sm font-medium mb-2" htmlFor="animationType">Animation Type
                      <Info className="ml-1 h-4 w-4 text-muted-foreground inline" title="Choose how this section animates into view." />
                    </label>
                    <select
                      id="animationType"
                      value={section.styles.animationType || ''}
                      onChange={e => updateStyles('animationType', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                      aria-describedby="animationType-desc"
                    >
                      <option value="">None</option>
                      <option value="fade">Fade In</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="slide-left">Slide Left</option>
                      <option value="slide-right">Slide Right</option>
                      <option value="zoom">Zoom In</option>
                    </select>
                    <div id="animationType-desc" className="text-xs text-muted-foreground mt-1">Section entrance animation.</div>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <label className="block text-xs font-medium mb-1" htmlFor="animationDelay">Delay (ms)</label>
                        <input
                          id="animationDelay"
                          type="number"
                          min={0}
                          max={5000}
                          step={100}
                          value={section.styles.animationDelay || 0}
                          onChange={e => updateStyles('animationDelay', Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                          aria-describedby="animationDelay-desc"
                        />
                        <div id="animationDelay-desc" className="text-xs text-muted-foreground">Delay before animation starts.</div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" htmlFor="animationDuration">Duration (ms)</label>
                        <input
                          id="animationDuration"
                          type="number"
                          min={100}
                          max={5000}
                          step={100}
                          value={section.styles.animationDuration || 600}
                          onChange={e => updateStyles('animationDuration', Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                          aria-describedby="animationDuration-desc"
                        />
                        <div id="animationDuration-desc" className="text-xs text-muted-foreground">How long the animation lasts.</div>
                      </div>
                    </div>
                  </div>
                  {/* Responsive Controls with help text */}
                  <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                    <label className="block text-sm font-medium mb-2">Responsive Visibility
                      <Info className="ml-1 h-4 w-4 text-muted-foreground inline" title="Show or hide this section on different devices." />
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={section.styles.showOnDesktop !== false}
                          onChange={e => updateStyles('showOnDesktop', e.target.checked)}
                        />
                        Desktop
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={section.styles.showOnTablet !== false}
                          onChange={e => updateStyles('showOnTablet', e.target.checked)}
                        />
                        Tablet
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={section.styles.showOnMobile !== false}
                          onChange={e => updateStyles('showOnMobile', e.target.checked)}
                        />
                        Mobile
                      </label>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Info className="h-3 w-3" />Uncheck to hide this section on that device.</div>
                  </div>
                  {/* Border Radius & Box Shadow with tooltips */}
                  <div className="bg-background/90 rounded-lg shadow p-3 border border-border flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">Border Radius
                        <Info className="ml-1 h-4 w-4 text-muted-foreground inline" title="Round the corners of this section." />
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={48}
                        step={2}
                        value={parseInt((section.styles.borderRadius || '16').toString())}
                        onChange={e => updateStyles('borderRadius', `${e.target.value}px`)}
                        className={`w-full accent-${meta.color}-500`}
                      />
                      <div className="text-xs text-muted-foreground mt-1">{section.styles.borderRadius || '16px'}</div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">Box Shadow
                        <Info className="ml-1 h-4 w-4 text-muted-foreground inline" title="Add shadow for depth." />
                      </label>
                      <select
                        value={section.styles.boxShadow || 'md'}
                        onChange={e => updateStyles('boxShadow', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                      >
                        <option value="none">None</option>
                        <option value="sm">Small</option>
                        <option value="md">Medium</option>
                        <option value="lg">Large</option>
                        <option value="xl">Extra Large</option>
              </select>
                      <div className="text-xs text-muted-foreground mt-1">Visual depth for the section.</div>
                    </div>
                  </div>
                  {/* Custom CSS/ClassName with help text */}
                  <div className="bg-background/90 rounded-lg shadow p-3 border border-border">
                    <label className="block text-sm font-medium mb-2">Custom CSS Class
                      <Info className="ml-1 h-4 w-4 text-muted-foreground inline" title="Add a custom class for advanced styling." />
                    </label>
                    <Input
                      type="text"
                      value={section.styles.className || ''}
                      onChange={e => updateStyles('className', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 font-mono"
                      placeholder="e.g. my-custom-section"
                      aria-describedby="className-desc"
                    />
                    <div id="className-desc" className="text-xs text-muted-foreground mt-1">For power users: add a custom class to this section.</div>
                    <label className="block text-sm font-medium mt-4 mb-2">Custom Inline CSS
                      <Info className="ml-1 h-4 w-4 text-muted-foreground inline" title="Add custom CSS styles directly." />
                    </label>
                    <Input
                      as="textarea"
                      value={section.styles.customCSS || ''}
                      onChange={e => updateStyles('customCSS', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 font-mono text-xs"
                      rows={3}
                      placeholder="e.g. background: linear-gradient(...);"
                      aria-describedby="customCSS-desc"
                    />
                    <div id="customCSS-desc" className="text-xs text-muted-foreground mt-1">Inline CSS for this section (use with caution).</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* AI Prompt Modal for text suggestions */}
        <AIPromptModal
          isOpen={aiModalOpen}
          onClose={() => { setAIModalOpen(false); setAITargetField(null); }}
          onGenerate={handleAIGenerate}
          isGenerating={isAIGenerating}
        />
        {/* Floating Save/Apply Button */}
        <div className={`sticky bottom-0 z-20 p-4 bg-background/90 flex justify-end rounded-bl-2xl`}>
          <Button
            className={`px-6 py-2 rounded-lg font-bold shadow bg-${meta.color}-600 text-white hover:bg-${meta.color}-700 transition-colors disabled:opacity-50`}
            disabled={!hasChanges}
            onClick={() => { setShowSuccess(true); setHasChanges(false); setTimeout(() => setShowSuccess(false), 1200); }}
          >
            {showSuccess ? 'Saved!' : 'Apply'}
          </Button>
        </div>
      </div>
    </div>
  );
};