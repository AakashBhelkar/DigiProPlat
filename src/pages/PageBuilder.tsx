import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, Smartphone, Monitor, Tablet, Plus, Trash2, Edit, Type, Palette, SlidersHorizontal, Layout, Info, MousePointerClick, Copy, RefreshCw } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../components/PageBuilder/SortableItem';
import { SectionEditor } from '../components/PageBuilder/SectionEditor';
import { usePageBuilderStore } from '../store/pageBuilderStore';
import toast from 'react-hot-toast';
import type { PageSection, PageSectionType, PageSectionContent, PricingContent, GalleryContent, VideoContent, CountdownContent, ContactContent, NewsletterContent, SocialContent, CustomContent } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";

// Define DEFAULT_GLOBAL_DESIGN at the top level
const DEFAULT_GLOBAL_DESIGN = {
  fontFamily: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
  fontSize: { heading: 32, body: 16 },
  fontWeight: { heading: 700, body: 400 },
  letterSpacing: { heading: 0, body: 0 },
  lineHeight: { heading: 1.2, body: 1.5 },
  colorPalette: {
    primary: '#6366f1',
    secondary: '#818cf8',
    accent: '#f59e42',
    background: '#ffffff',
    text: '#1f2937',
    success: '#22c55e',
    warning: '#facc15',
    error: '#ef4444',
  },
  buttonStyles: {
    shape: 'rounded',
    color: '#6366f1',
    hoverColor: '#4f46e5',
    font: 'Inter, sans-serif',
    shadow: true,
    borderRadius: 8,
    borderColor: '#6366f1',
    borderWidth: 1,
  },
  globalShadow: 'md',
  responsive: {
    containerWidth: 1200,
    sectionSpacing: 60,
    breakpoints: { desktop: 1200, tablet: 800, mobile: 400 },
    enableSpacing: { desktop: true, tablet: true, mobile: true },
  },
};

export const PageBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { globalDesign, setGlobalDesign } = usePageBuilderStore();
  const [showDesignSidebar, setShowDesignSidebar] = useState(false);
  const [aiPreviewSections, setAIPreviewSections] = useState<PageSection[] | null>(null);

  const { currentPage, createPage, updatePage, loadPage } = usePageBuilderStore();

  // Initialize sections based on current page or empty for new page
  const [sections, setSections] = useState<PageSection[]>([]);

  useEffect(() => {
    if (id && id !== 'new') {
      // Load existing page
      loadPage(id);
    } else {
      // New page - start with empty sections
      setSections([]);
    }
  }, [id, loadPage]);

  useEffect(() => {
    // Update sections when currentPage changes
    if (currentPage?.sections) {
      setSections(currentPage.sections.map(section => ({
        id: section.id,
        type: section.type as PageSection['type'],
        content: section.content,
        styles: section.styles
      })));
    }
  }, [currentPage]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setSections((items: PageSection[]) => {
        const oldIndex = items.findIndex((item: PageSection) => item.id === active.id);
        const newIndex = items.findIndex((item: PageSection) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addSection = (sectionType: PageSectionType) => {
    const newSection: PageSection = {
      id: Date.now().toString(),
      type: sectionType,
      content: getDefaultContent(sectionType),
      styles: getDefaultStyles(),
      order: sections.length
    };
    setSections((prev: PageSection[]) => [...prev, newSection]);
  };

  const deleteSection = (sectionId: string) => {
    setSections((prev: PageSection[]) => prev.filter(section => section.id !== sectionId));
    setSelectedSection(null);
  };

  const updateSection = (sectionId: string, updates: Partial<PageSection>) => {
    setSections((prev: PageSection[]) => prev.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  // Confirm insert generated sections
  const handleAIInsertSections = () => {
    if (aiPreviewSections) {
      setSections(aiPreviewSections);
      setAIPreviewSections(null);
      setShowAIModal(false);
      toast.success('Sections inserted!');
    }
  };

  const savePage = async () => {
    setIsSaving(true);
    try {
      const pageData = {
        title: currentPage?.title || 'New Landing Page',
        slug: currentPage?.slug || `page-${Date.now()}`,
        sections: sections.map(section => ({
          id: section.id,
          type: section.type,
          content: section.content,
          styles: section.styles,
          order_index: sections.indexOf(section)
        })),
        is_published: false
      };

      if (!id || id === 'new') {
        // Create new page
        const newPage = await createPage(pageData);
        if (newPage) {
          navigate(`/pages/builder/${newPage.id}`);
          toast.success('Page created successfully!');
        }
      } else {
        // Update existing page
        await updatePage(id, pageData);
        toast.success('Page saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      toast.error('Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  const previewPage = () => {
    if (currentPage?.slug) {
      window.open(`/preview/${currentPage.slug}`, '_blank');
    } else {
      toast.error('Please save the page first to preview');
    }
  };

  const sectionTypes = [
    { type: 'hero' as const, label: 'Hero', icon: '🎯' },
    { type: 'features' as const, label: 'Features', icon: '⭐' },
    { type: 'testimonials' as const, label: 'Reviews', icon: '💬' },
    { type: 'faq' as const, label: 'FAQ', icon: '❓' },
    { type: 'cta' as const, label: 'CTA', icon: '🚀' },
    { type: 'pricing' as const, label: 'Pricing', icon: '💲' },
    { type: 'gallery' as const, label: 'Gallery', icon: '🖼️' },
    { type: 'video' as const, label: 'Video', icon: '🎬' },
    { type: 'countdown' as const, label: 'Countdown', icon: '⏳' },
    { type: 'contact' as const, label: 'Contact', icon: '📞' },
    { type: 'newsletter' as const, label: 'Newsletter', icon: '📧' },
    { type: 'social' as const, label: 'Social Proof', icon: '👥' },
    { type: 'custom' as const, label: 'Custom HTML', icon: '🛠️' },
  ];

  // Add sectionTypeMeta for block badges
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

  // Preview device state and handlers for global design sidebar
  const [previewDevice, setPreviewDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const handleResetAll = () => {
    setGlobalDesign(DEFAULT_GLOBAL_DESIGN);
    toast.success('Global design reset to default!');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      {/* Builder Toolbar/Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg shadow-card p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-4 border-primary/30">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-2xl font-bold text-white">Landing Page Builder</h1>
          <p className="text-white text-sm">Design and preview your high-converting landing page</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={savePage}
            disabled={isSaving}
            size="sm"
            variant="primary"
            className="bg-primary-500 hover:bg-primary-500/90 text-white border border-primary-500"
          >
            <Save className="h-5 w-5 mr-2 text-white" />
            <span className="text-white">{isSaving ? 'Saving...' : 'Save'}</span>
          </Button>
          <Button
            onClick={previewPage}
            disabled={isSaving}
            size="sm"
            variant="outline"
            className="border-primary-500 text-primary-500 hover:bg-primary-50"
          >
            <Eye className="h-5 w-5 mr-2 text-primary-500" />
            Preview
          </Button>
        </div>
          </div>
          
      {/* Main layout: use flex, gap, and responsive spacing for sidebar and builder canvas */}
      <div className="flex w-full max-w-[1600px] mx-auto gap-8 items-start">
        {/* Sidebar */}
        <aside className="w-80 min-w-[320px] max-w-[340px] bg-background border-r border-border flex flex-col rounded-xl shadow-md">
          {/* Header */}
          <div className="p-6 border-b border-border">
            {/* Sidebar header: stack vertically, Design button below Generate with AI */}
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-lg font-semibold text-foreground">Page Builder</span>
              <Button variant="outline" onClick={() => setShowAIModal(true)} className="flex items-center gap-1 w-full">
                <span className="text-primary-500">✨</span> Generate with AI
              </Button>
              <Button onClick={() => setShowDesignSidebar(v => !v)} className="bg-muted text-foreground px-3 py-1 rounded-md text-sm hover:bg-muted/80 border border-border transition-colors w-full" aria-label="Open global design controls">
                Design
              </Button>
            </div>
          <div className="flex items-center space-x-2">
              <Button
              onClick={savePage}
              disabled={isSaving}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </Button>
              <Button
              onClick={previewPage}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted/80 transition-colors text-foreground"
            >
              <Eye className="h-4 w-4" />
              </Button>
          </div>
        </div>
        {/* Section List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Sections</h3>
            {sections.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <SortableItem
                        key={section.id}
                        id={section.id}
                        section={section}
                        isSelected={selectedSection === section.id}
                        onSelect={() => setSelectedSection(section.id)}
                        onDelete={() => deleteSection(section.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No sections yet</p>
                <p className="text-xs mt-1">Add sections below to get started</p>
              </div>
            )}
          </div>
          {/* Add Section */}
          <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Add Section</h3>
            <div className="grid grid-cols-2 gap-2">
                {sectionTypes.map(({ type, label, icon }) => (
                  <Button
                  key={type}
                  onClick={() => addSection(type)}
                    className="p-3 border border-border rounded-lg hover:bg-muted/80 transition-colors text-sm text-foreground bg-background"
                >
                    <span className="mr-2">{icon}</span>
                  {label}
                  </Button>
              ))}
            </div>
          </div>
        </div>
        </aside>
        {/* Builder Canvas */}
        <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
          <div className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Button
                onClick={() => navigate('/pages')}
                  className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Pages
                </Button>
                <div className="h-6 w-px bg-border" />
                <span className="text-sm text-muted-foreground">
                {!id || id === 'new' ? 'New Page' : `Editing: ${currentPage?.title || 'Page'}`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                  onClick={() => setViewMode('desktop')}
                  className={`p-2 rounded-md transition-colors ${
                      viewMode === 'desktop' ? 'bg-background shadow-sm' : 'hover:bg-muted/80'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                  onClick={() => setViewMode('tablet')}
                  className={`p-2 rounded-md transition-colors ${
                      viewMode === 'tablet' ? 'bg-background shadow-sm' : 'hover:bg-muted/80'
                  }`}
                >
                  <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                  onClick={() => setViewMode('mobile')}
                  className={`p-2 rounded-md transition-colors ${
                      viewMode === 'mobile' ? 'bg-background shadow-sm' : 'hover:bg-muted/80'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas */}
          <div className="flex-1 overflow-auto bg-background p-8">
            <div className="bg-secondary-50/20 px-6">
              <div
                className={`mx-auto shadow-2xl rounded-2xl border border-border transition-all duration-300 flex flex-col w-full ${
            viewMode === 'desktop' ? 'max-w-6xl' :
            viewMode === 'tablet' ? 'max-w-2xl' : 'max-w-sm'
                }`}
                role="main"
                aria-label="Landing page canvas"
                style={{
                  background: `linear-gradient(135deg, ${globalDesign.colorPalette.background} 60%, #f3f4f6 100%)`,
                  fontFamily: globalDesign.fontFamily.body,
                  maxWidth: viewMode === 'desktop'
                    ? globalDesign.responsive.breakpoints.desktop
                    : viewMode === 'tablet'
                    ? globalDesign.responsive.breakpoints.tablet
                    : globalDesign.responsive.breakpoints.mobile,
                  padding: globalDesign.responsive.sectionSpacing,
                }}
              >
            {sections.length > 0 ? (
                  sections.map((section) => {
                    const meta = sectionTypeMeta[section.type] || { color: 'indigo', icon: '⚡', label: section.type };
                    // Merge globalDesign as defaults, allow per-section overrides
                    const sectionFont = section.styles.fontFamily || globalDesign.fontFamily.body;
                    const sectionBg = section.styles.backgroundColor || globalDesign.colorPalette.background;
                    const sectionText = section.styles.textColor || globalDesign.colorPalette.text;
                    const sectionPadding = section.styles.padding || `${globalDesign.responsive.sectionSpacing}px 0`;
                    return (
                      <section
                  key={section.id}
                        tabIndex={0}
                        aria-label={`${meta.label} section`}
                        className={`relative group cursor-pointer transition-all duration-300 outline-none focus-visible:ring-4 focus-visible:ring-${meta.color}-300
                          bg-white dark:bg-gray-900 border border-secondary-100 dark:border-secondary-500/20 rounded-xl shadow-card mb-2`}
                  onClick={() => setSelectedSection(section.id)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedSection(section.id); }}
                        style={{
                          minHeight: 120,
                          margin: 0,
                          fontFamily: sectionFont,
                          background: sectionBg,
                          color: sectionText,
                          padding: sectionPadding,
                        }}
                      >
                        {/* Section Badge */}
                        <div className={`absolute -top-3 left-4 flex items-center gap-1 px-3 py-1 rounded-full shadow text-xs font-bold bg-${meta.color}-100 text-${meta.color}-700 border border-${meta.color}-200 z-20`}
                          style={{ transform: 'translateY(-50%)' }}
                          aria-label={`${meta.label} badge`}
                        >
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </div>
                        {/* Drag handle */}
                        <button
                          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-border rounded-full shadow p-1 flex items-center focus-visible:ring-2 focus-visible:ring-primary-400 h-6 w-6 cursor-move"
                          tabIndex={0}
                          aria-label={`Drag ${meta.label} section`}
                          onKeyDown={e => e.stopPropagation()}
                          type="button"
                        >
                          {/* 4x4 dot grid SVG */}
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            {[0,1,2,3].map(row =>
                              [0,1,2,3].map(col =>
                                <circle key={`${row}-${col}`} cx={6+col*4} cy={6+row*4} r="1" fill="currentColor" className="text-gray-400 group-hover:text-primary-500" />
                              )
                            )}
                          </svg>
                        </button>
                  <SectionRenderer section={section} />
                  {selectedSection === section.id && (
                          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white rounded-md shadow-sm border border-border p-1 z-20">
                            <Button
                              className="p-1 hover:bg-muted rounded focus-visible:ring-2 focus-visible:ring-primary-400"
                              aria-label={`Edit ${meta.label} section`}
                              tabIndex={0}
                            >
                        <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                              className="p-1 hover:bg-muted rounded text-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                              aria-label={`Delete ${meta.label} section`}
                              tabIndex={0}
                      >
                        <Trash2 className="h-3 w-3" />
                          </Button>
                    </div>
                  )}
                      </section>
                    );
                  })
            ) : (
                  <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Start Building Your Page</h3>
                  <p className="text-sm">Add sections from the sidebar to begin creating your landing page</p>
                </div>
              </div>
            )}
          </div>
        </div>
          </div>
        </main>
      </div>

      {/* Properties Panel */}
      {selectedSection && (
        <div className="w-80 bg-white border-l border-gray-200">
          <SectionEditor
            section={sections.find(s => s.id === selectedSection)!}
            onUpdate={(updates) => updateSection(selectedSection, updates)}
          />
        </div>
      )}

      {/* AI Modal */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="w-[520px] max-w-full p-6 space-y-6">
          {/* Modal content here */}
        </DialogContent>
      </Dialog>
      {/* AI Preview Modal */}
      {aiPreviewSections && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" tabIndex={-1}>
          <div className="bg-background rounded-xl shadow-2xl max-w-2xl w-full p-0 relative animate-fade-in flex flex-col focus:outline-none" tabIndex={0} aria-label="AI-Generated Sections Preview">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-primary/80 rounded-t-xl">
              <span className="text-2xl text-white" role="img" aria-label="sparkles">✨</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">AI-Generated Sections Preview</h3>
                <p className="text-xs text-white/80">Review the sections below. You can insert them into your page or go back to edit your prompt.</p>
              </div>
              <Button className="text-white hover:text-white/80 p-2 rounded focus:outline-none focus:ring-2 focus:ring-white" onClick={() => setAIPreviewSections(null)} aria-label="Close AI preview">✕</Button>
            </div>
            {/* Prompt Summary */}
            <div className="px-6 pt-3 pb-2 border-b border-border bg-background">
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Info className="h-4 w-4 text-primary-400" />
                <span className="font-semibold">Prompt:</span>
                <span className="truncate" title={aiPreviewSections[0]?.prompt || ''}>{aiPreviewSections[0]?.prompt ? aiPreviewSections[0].prompt : 'Custom prompt used.'}</span>
              </div>
            </div>
            {/* Section Previews */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-background">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiPreviewSections.map((section, idx) => {
                  const meta = sectionTypeMeta[section.type] || { color: 'indigo', icon: '⚡', label: section.type };
                  let excerpt = '';
                  if (section.content?.title) excerpt = section.content.title;
                  else if (section.content?.subtitle) excerpt = section.content.subtitle;
                  else if (section.content?.description) excerpt = section.content.description;
                  else if (section.content?.features?.[0]?.title) excerpt = section.content.features[0].title;
                  else if (section.content?.testimonials?.[0]?.quote) excerpt = section.content.testimonials[0].quote;
                  else if (section.content?.faqs?.[0]?.question) excerpt = section.content.faqs[0].question;
                  else if (section.content?.html) excerpt = section.content.html.replace(/<[^>]+>/g, '').slice(0, 60);
                  if (!excerpt) excerpt = 'Section content';
                  return (
                    <div key={idx} className={`relative rounded-lg border-2 border-${meta.color}-100 bg-${meta.color}-50/40 shadow-sm p-4 flex flex-col gap-2 focus-within:ring-2 focus-within:ring-${meta.color}-400 transition-all group`} tabIndex={0} aria-label={`${meta.label} section preview`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xl`} style={{ color: `var(--tw-${meta.color}-600, #6366f1)` }}>{meta.icon}</span>
                        <span className={`font-bold text-${meta.color}-700 text-sm`}>{meta.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground">#{idx + 1}</span>
                      </div>
                      <div className="font-semibold text-foreground truncate" title={excerpt}>{excerpt}</div>
                      <div className="text-xs text-muted-foreground truncate">{section.content?.subtitle || section.content?.description || ''}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 px-6 py-4 border-t border-border bg-background rounded-b-xl sticky bottom-0 z-10">
              <Button
                className="flex-1 px-4 py-2 rounded-lg font-bold shadow bg-muted text-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
                onClick={() => setAIPreviewSections(null)}
                aria-label="Edit prompt"
                tabIndex={0}
                title="Go back and edit your AI prompt"
              >Edit Prompt</Button>
              <Button
                className="flex-1 px-4 py-2 rounded-lg font-bold shadow bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors disabled:opacity-50"
                onClick={handleAIInsertSections}
                aria-label="Insert sections"
                tabIndex={0}
                title="Insert these sections into your page"
              >{aiPreviewSections.length > 0 ? 'Insert Sections' : 'No Sections to Insert'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Design Sidebar */}
      {showDesignSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-96 bg-white border-l border-gray-200 shadow-2xl flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-primary">Global Design</h3>
              <Button onClick={() => setShowDesignSidebar(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-md">
                <span className="sr-only">Close</span>✕
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)] p-6 space-y-8">
              {/* Drawer content */}
              {/* Enhanced Live Preview of Global Styles */}
              <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow flex flex-col gap-2 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg" style={{
                    fontFamily: globalDesign.fontFamily.heading,
                    fontSize: globalDesign.fontSize.heading,
                    fontWeight: globalDesign.fontWeight.heading,
                    letterSpacing: globalDesign.letterSpacing.heading,
                    lineHeight: globalDesign.lineHeight.heading,
                    color: globalDesign.colorPalette.primary,
                    transition: 'all 0.3s'
                  }}>Heading Preview</span>
                  <Info className="h-4 w-4 text-gray-400" title="This preview uses your global typography and color settings." />
                  {/* Preview device toggles */}
                  <div className="ml-auto flex gap-1" role="group" aria-label="Preview device toggles">
                    <Button aria-label="Desktop preview" className={`p-1 rounded ${previewDevice==='desktop'?'bg-primary/20':'hover:bg-gray-100'}`} onClick={()=>setPreviewDevice('desktop')}><Monitor className="h-4 w-4" /></Button>
                    <Button aria-label="Tablet preview" className={`p-1 rounded ${previewDevice==='tablet'?'bg-primary/20':'hover:bg-gray-100'}`} onClick={()=>setPreviewDevice('tablet')}><Tablet className="h-4 w-4" /></Button>
                    <Button aria-label="Mobile preview" className={`p-1 rounded ${previewDevice==='mobile'?'bg-primary/20':'hover:bg-gray-100'}`} onClick={()=>setPreviewDevice('mobile')}><Smartphone className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className={`rounded-xl border border-gray-100 shadow-md p-4 mb-2 bg-white transition-all duration-300 ${globalDesign.globalShadow !== 'none' ? `shadow-${globalDesign.globalShadow}` : ''}`}
                  style={{
                    maxWidth: previewDevice==='desktop'?globalDesign.responsive.breakpoints.desktop:previewDevice==='tablet'?globalDesign.responsive.breakpoints.tablet:globalDesign.responsive.breakpoints.mobile,
                    margin: '0 auto',
                    fontFamily: globalDesign.fontFamily.body,
                    fontSize: globalDesign.fontSize.body,
                    fontWeight: globalDesign.fontWeight.body,
                    letterSpacing: globalDesign.letterSpacing.body,
                    lineHeight: globalDesign.lineHeight.body,
                    color: globalDesign.colorPalette.text,
                    background: globalDesign.colorPalette.background,
                    transition: 'all 0.3s',
                    animation: globalDesign.previewAnimation ? `${globalDesign.previewAnimation} 0.8s` : undefined
                  }}
                  tabIndex={0}
                  aria-label="Global style preview card"
                >
                  <h2 className="font-bold text-xl mb-2" style={{color: globalDesign.colorPalette.primary}}>Sample Card Title</h2>
                  <p className="mb-4">This is a sample card using your global design settings. Adjust fonts, colors, and shadows to see changes live.</p>
                  <Button
                    className="px-4 py-2 text-sm font-semibold transition-all duration-200"
                    style={{
                      background: globalDesign.buttonStyles.color,
                      color: globalDesign.colorPalette.background,
                      borderRadius: globalDesign.buttonStyles.shape === 'pill' ? 999 : globalDesign.buttonStyles.borderRadius,
                      border: `${globalDesign.buttonStyles.borderWidth}px solid ${globalDesign.buttonStyles.borderColor}`,
                      fontFamily: globalDesign.buttonStyles.font,
                      boxShadow: globalDesign.buttonStyles.shadow ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                      transition: 'all 0.3s'
                    }}
                  >
                    Button Preview
                  </Button>
                </div>
              </div>
              {/* Fonts */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Type className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-gray-800">Fonts</h4>
                  <Info className="h-4 w-4 text-gray-400 ml-1" title="Set global font families, sizes, and weights. These settings affect all headings and body text by default. Use accessible font sizes and weights for readability." />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Heading Font</label>
                    <Input
                      type="text"
                      value={globalDesign.fontFamily.heading}
                      onChange={e => setGlobalDesign({ fontFamily: { heading: e.target.value } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      placeholder="e.g. Inter, sans-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Body Font</label>
                    <Input
                      type="text"
                      value={globalDesign.fontFamily.body}
                      onChange={e => setGlobalDesign({ fontFamily: { body: e.target.value } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      placeholder="e.g. Inter, sans-serif"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Heading Size</label>
                    <Input
                      type="number"
                      value={globalDesign.fontSize.heading}
                      onChange={e => setGlobalDesign({ fontSize: { heading: Number(e.target.value) } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      min={16} max={96}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Body Size</label>
                    <Input
                      type="number"
                      value={globalDesign.fontSize.body}
                      onChange={e => setGlobalDesign({ fontSize: { body: Number(e.target.value) } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      min={10} max={32}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Heading Weight</label>
                    <Input
                      type="number"
                      value={globalDesign.fontWeight.heading}
                      onChange={e => setGlobalDesign({ fontWeight: { heading: Number(e.target.value) } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      min={100} max={900} step={100}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Body Weight</label>
                    <Input
                      type="number"
                      value={globalDesign.fontWeight.body}
                      onChange={e => setGlobalDesign({ fontWeight: { body: Number(e.target.value) } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      min={100} max={900} step={100}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Letter Spacing (H)</label>
                    <Input
                      type="number"
                      value={globalDesign.letterSpacing.heading}
                      onChange={e => setGlobalDesign({ letterSpacing: { heading: Number(e.target.value) } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      min={-2} max={10} step={0.1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Letter Spacing (B)</label>
                    <Input
                      type="number"
                      value={globalDesign.letterSpacing.body}
                      onChange={e => setGlobalDesign({ letterSpacing: { body: Number(e.target.value) } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      min={-2} max={10} step={0.1}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Line Height (H)</label>
                    <Input
                      type="number"
                      value={globalDesign.lineHeight.heading}
                      onChange={e => setGlobalDesign({ lineHeight: { heading: Number(e.target.value) } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      min={1} max={2} step={0.05}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Line Height (B)</label>
                    <Input
                      type="number"
                      value={globalDesign.lineHeight.body}
                      onChange={e => setGlobalDesign({ lineHeight: { body: Number(e.target.value) } })}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      min={1} max={2} step={0.05}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">Tip: Use font controls to match your brand typography.</div>
              </div>
              <hr className="my-4 border-primary/20" />
              {/* Color Palette */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-5 w-5 text-pink-500" />
                  <h4 className="font-semibold text-gray-800">Color Palette</h4>
                  <Info className="h-4 w-4 text-gray-400 ml-1" title="Set global colors for your site. These colors are used for backgrounds, text, buttons, and accents. Use accessible color contrast for text and backgrounds." />
                </div>
                {/* Palette preview row */}
                <div className="flex gap-2 mb-2">
                  {Object.entries(globalDesign.colorPalette).map(([key, value]) => (
                    <div key={key} className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full border border-gray-200" style={{ background: value }} title={key} />
                      <span className="text-[10px] text-gray-500 mt-1 capitalize">{key}</span>
                    </div>
                  ))}
                </div>
                {Object.entries(globalDesign.colorPalette).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 mb-2">
                    <label className="w-24 capitalize text-xs">{key}</label>
                    <Input
                      type="color"
                      value={value}
                      onChange={e => setGlobalDesign({ colorPalette: { [key]: e.target.value } })}
                      className="w-8 h-6 border-0 bg-transparent cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={value}
                      onChange={e => setGlobalDesign({ colorPalette: { [key]: e.target.value } })}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded-md text-xs"
                    />
                  </div>
                ))}
                <div className="text-xs text-gray-400 mt-1">Tip: Use accessible color contrast for text and backgrounds.</div>
              </div>
              <hr className="my-4 border-pink-100" />
              {/* Button Styles */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="h-5 w-5 text-green-500" />
                  <h4 className="font-semibold text-gray-800">Button Styles</h4>
                  <Info className="h-4 w-4 text-gray-400 ml-1" title="Set global button appearance. These settings affect all buttons by default. Use the preview above to see changes live." />
                </div>
                <label className="block text-xs font-medium mb-1">Shape</label>
                <select
                  value={globalDesign.buttonStyles.shape}
                  onChange={e => setGlobalDesign({ buttonStyles: { shape: e.target.value as 'rounded' | 'pill' | 'square' } })}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-xs"
                >
                  <option value="rounded">Rounded</option>
                  <option value="pill">Pill</option>
                  <option value="square">Square</option>
                </select>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Button Color</label>
                    <Input
                      type="color"
                      value={globalDesign.buttonStyles.color}
                      onChange={e => setGlobalDesign({ buttonStyles: { color: e.target.value } })}
                      className="w-8 h-6 border-0 bg-transparent cursor-pointer mb-1"
                    />
                    <Input
                      type="text"
                      value={globalDesign.buttonStyles.color}
                      onChange={e => setGlobalDesign({ buttonStyles: { color: e.target.value } })}
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Hover Color</label>
                    <Input
                      type="color"
                      value={globalDesign.buttonStyles.hoverColor}
                      onChange={e => setGlobalDesign({ buttonStyles: { hoverColor: e.target.value } })}
                      className="w-8 h-6 border-0 bg-transparent cursor-pointer mb-1"
                    />
                    <Input
                      type="text"
                      value={globalDesign.buttonStyles.hoverColor}
                      onChange={e => setGlobalDesign({ buttonStyles: { hoverColor: e.target.value } })}
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs"
                    />
                  </div>
                </div>
                <label className="block text-xs font-medium mb-1">Button Font</label>
                <Input
                  type="text"
                  value={globalDesign.buttonStyles.font}
                  onChange={e => setGlobalDesign({ buttonStyles: { font: e.target.value } })}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-xs"
                  placeholder="e.g. Inter, sans-serif"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Border Radius</label>
                    <Input
                      type="range"
                      min={0}
                      max={32}
                      step={1}
                      value={globalDesign.buttonStyles.borderRadius}
                      onChange={e => setGlobalDesign({ buttonStyles: { borderRadius: Number(e.target.value) } })}
                      className="w-full"
                    />
                    <div className="text-[10px] text-gray-500 mt-1">{globalDesign.buttonStyles.borderRadius}px</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Border Color</label>
                    <Input
                      type="color"
                      value={globalDesign.buttonStyles.borderColor}
                      onChange={e => setGlobalDesign({ buttonStyles: { borderColor: e.target.value } })}
                      className="w-8 h-6 border-0 bg-transparent cursor-pointer mb-1"
                    />
                    <Input
                      type="text"
                      value={globalDesign.buttonStyles.borderColor}
                      onChange={e => setGlobalDesign({ buttonStyles: { borderColor: e.target.value } })}
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs"
                    />
                  </div>
                </div>
                <label className="block text-xs font-medium mb-1">Border Width</label>
                <Input
                  type="number"
                  min={0}
                  max={8}
                  value={globalDesign.buttonStyles.borderWidth}
                  onChange={e => setGlobalDesign({ buttonStyles: { borderWidth: Number(e.target.value) } })}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-xs"
                />
                <label className="block text-xs font-medium mb-1">Shadow</label>
                <input
                  type="checkbox"
                  checked={globalDesign.buttonStyles.shadow}
                  onChange={e => setGlobalDesign({ buttonStyles: { shadow: e.target.checked } })}
                  className="mr-2"
                />
                <span className="text-xs">Enable shadow</span>
              </div>
              <hr className="my-4 border-green-100" />
              {/* Global Shadow */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <SlidersHorizontal className="h-5 w-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-800">Global Shadow</h4>
                  <Info className="h-4 w-4 text-gray-400 ml-1" title="Set the default shadow for cards and sections. This affects the depth and layering of UI elements." />
                </div>
                <select
                  value={globalDesign.globalShadow}
                  onChange={e => setGlobalDesign({ globalShadow: e.target.value as 'none' | 'sm' | 'md' | 'lg' | 'xl' })}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-xs"
                >
                  <option value="none">None</option>
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>
              <hr className="my-4 border-gray-100" />
              {/* Responsive */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layout className="h-5 w-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-800">Responsive</h4>
                  <Info className="h-4 w-4 text-gray-400 ml-1" title="Set container width, section spacing, and breakpoints. Adjust these for a perfect responsive layout on all devices." />
                </div>
                <label className="block text-xs font-medium mb-1">Container Width (px)</label>
                <Input
                  type="number"
                  value={globalDesign.responsive.containerWidth}
                  onChange={e => setGlobalDesign({ responsive: { containerWidth: Number(e.target.value) } })}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-xs"
                  min={320}
                  max={1920}
                />
                <label className="block text-xs font-medium mb-1">Section Spacing (px)</label>
                <Input
                  type="number"
                  value={globalDesign.responsive.sectionSpacing}
                  onChange={e => setGlobalDesign({ responsive: { sectionSpacing: Number(e.target.value) } })}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-xs"
                  min={0}
                  max={128}
                />
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Desktop (px)</label>
                    <Input
                      type="number"
                      value={globalDesign.responsive.breakpoints.desktop}
                      onChange={e => setGlobalDesign({ responsive: { breakpoints: { desktop: Number(e.target.value) } } })}
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs"
                      min={900}
                      max={1920}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Tablet (px)</label>
                    <Input
                      type="number"
                      value={globalDesign.responsive.breakpoints.tablet}
                      onChange={e => setGlobalDesign({ responsive: { breakpoints: { tablet: Number(e.target.value) } } })}
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs"
                      min={600}
                      max={1200}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1">Mobile (px)</label>
                    <Input
                      type="number"
                      value={globalDesign.responsive.breakpoints.mobile}
                      onChange={e => setGlobalDesign({ responsive: { breakpoints: { mobile: Number(e.target.value) } } })}
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs"
                      min={320}
                      max={600}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Monitor className="h-4 w-4 text-gray-500" />
                    <label className="text-xs">Enable Spacing (Desktop)</label>
                    <input
                      type="checkbox"
                      checked={globalDesign.responsive.enableSpacing.desktop}
                      onChange={e => setGlobalDesign({ responsive: { enableSpacing: { desktop: e.target.checked } } })}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Tablet className="h-4 w-4 text-gray-500" />
                    <label className="text-xs">Tablet</label>
                    <input
                      type="checkbox"
                      checked={globalDesign.responsive.enableSpacing.tablet}
                      onChange={e => setGlobalDesign({ responsive: { enableSpacing: { tablet: e.target.checked } } })}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Smartphone className="h-4 w-4 text-gray-500" />
                    <label className="text-xs">Mobile</label>
                    <input
                      type="checkbox"
                      checked={globalDesign.responsive.enableSpacing.mobile}
                      onChange={e => setGlobalDesign({ responsive: { enableSpacing: { mobile: e.target.checked } } })}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">Tip: Adjust breakpoints and spacing for a perfect responsive layout.</div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white/90 z-10">
              <Button
                onClick={() => navigator.clipboard.writeText(generatedCss)}
                className="px-4 py-2 rounded-lg font-bold shadow bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
                aria-label="Copy CSS"
              >
                <Copy className="h-4 w-4" /> Copy CSS
              </Button>
              <Button
                onClick={handleResetAll}
                className="px-4 py-2 rounded-lg font-bold shadow bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
                aria-label="Reset all to default"
              >
                <RefreshCw className="h-4 w-4" /> Reset All
              </Button>
              <Button
                onClick={() => setShowDesignSidebar(false)}
                className="px-6 py-2 rounded-lg font-bold shadow bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                aria-label="Close design sidebar"
              >
                Done
              </Button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setShowDesignSidebar(false)} style={{ background: 'rgba(0,0,0,0.1)' }} />
        </div>
      )}
      <Dialog open={!!selectedSection} onOpenChange={() => setSelectedSection(null)}>
        {selectedSection && (
          <SectionEditor
            section={sections.find(s => s.id === selectedSection)!}
            onUpdate={updates => updateSection(selectedSection, updates)}
          />
        )}
      </Dialog>
    </div>
  );
};

// Helper functions
const getDefaultContent = (type: PageSectionType): PageSectionContent => {
  switch (type) {
    case 'hero':
      return {
        title: 'Welcome to Your Landing Page!',
        subtitle: 'This is your hero section. Edit this text to make it your own.',
        buttonText: 'Get Started',
        backgroundImage: ''
      };
    case 'features':
      return {
        title: 'Our Features',
        features: [
          { title: 'Fast', description: 'Lightning fast performance for your users.' },
          { title: 'Secure', description: 'Top-notch security for your data.' },
          { title: 'Customizable', description: 'Easily adapt to your needs.' }
        ]
      };
    case 'testimonials':
      return {
        title: 'What Our Users Say',
        testimonials: [
          { name: 'Alice', quote: 'This platform changed my business!', avatar: '', rating: 5 },
          { name: 'Bob', quote: 'Amazing experience and support.', avatar: '', rating: 4 }
        ]
      };
    case 'faq':
      return {
        title: 'Frequently Asked Questions',
        faqs: [
          { question: 'How does it work?', answer: 'Just add your content and publish!' },
          { question: 'Is there a free trial?', answer: 'Yes, you can start for free.' }
        ]
      };
    case 'cta':
      return {
        title: 'Ready to Get Started?',
        subtitle: 'Sign up now and launch your page in minutes.',
        buttonText: 'Sign Up Free'
      };
    case 'pricing':
      return {
        title: 'Our Pricing Plans',
        plans: [
          { name: 'Basic', price: '0', features: ['Feature 1', 'Feature 2'] },
          { name: 'Pro', price: '29', features: ['Everything in Basic', 'Pro Feature'] }
        ],
        currency: 'INR'
      };
    case 'gallery':
      return {
        title: 'Gallery',
        images: [
          'https://via.placeholder.com/300x200',
          'https://via.placeholder.com/300x200',
          'https://via.placeholder.com/300x200'
        ]
      };
    case 'video':
      return {
        title: 'Watch Our Video',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      };
    case 'countdown':
      return {
        title: 'Limited Time Offer!',
        endDate: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
      };
    case 'contact':
      return {
        title: 'Contact Us',
        fields: [
          { label: 'Name', type: 'text', required: true },
          { label: 'Email', type: 'email', required: true },
          { label: 'Message', type: 'textarea', required: true }
        ]
      };
    case 'newsletter':
      return {
        title: 'Subscribe to our Newsletter',
        description: 'Get the latest updates and offers.',
        placeholder: 'Enter your email'
      };
    case 'social':
      return {
        title: 'Trusted by',
        logos: [
          'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
          'https://upload.wikimedia.org/wikipedia/commons/4/47/React.svg'
        ]
      };
    case 'custom':
      return {
        html: '<h2>Custom HTML Section</h2><p>Edit this HTML as you like!</p>'
      };
    default:
      return {};
  }
};

const getDefaultStyles = () => {
  return {
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    padding: '60px 0'
  };
};

// Section Renderer Component
const SectionRenderer: React.FC<{ section: PageSection }> = ({ section }) => {
  const { content, styles } = section;

  switch (section.type) {
    case 'hero':
      return (
        <div
          className="relative min-h-[400px] flex items-center justify-center text-center rounded-xl border-2 border-border bg-background shadow-xl p-12"
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            padding: styles.padding,
            backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {content.backgroundImage && (
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl" />
          )}
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg text-foreground">{content.title}</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 text-muted-foreground">{content.subtitle}</p>
            <Button className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg">
              {content.buttonText}
            </Button>
          </div>
        </div>
      );
    case 'features':
      return (
        <div
          className="py-16 bg-background text-foreground"
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            padding: styles.padding
          }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">{content.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.features?.map((feature: { title: string; description: string }, index: number) => (
                <div key={index} className="text-center bg-muted rounded-lg p-6 border border-border">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                  <p className="opacity-80 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 'testimonials':
      return (
        <div
          className="py-16 bg-background text-foreground"
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            padding: styles.padding
          }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">{content.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.testimonials?.map((testimonial: { name: string; quote: string; avatar?: string; rating?: number }, index: number) => (
                <div key={index} className="bg-muted p-6 rounded-lg shadow-md border border-border">
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="ml-auto flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 'faq':
      return (
        <div
          className="py-16 bg-background text-foreground"
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            padding: styles.padding
          }}
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">{content.title}</h2>
            <div className="space-y-4">
              {content.faqs?.map((faq: { question: string; answer: string }, index: number) => (
                <div key={index} className="border border-border rounded-lg p-6 bg-muted">
                  <h3 className="font-semibold mb-2 text-foreground">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 'cta':
      return (
        <div
          className="py-16 text-center bg-background text-foreground"
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            padding: styles.padding
          }}
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-4 text-foreground">{content.title}</h2>
            <p className="text-xl mb-8 opacity-90 text-muted-foreground">{content.subtitle}</p>
            <Button className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors">
              {content.buttonText}
            </Button>
          </div>
        </div>
      );
    case 'pricing': {
      const content = section.content as PricingContent;
      const styles = section.styles || {};
      const currencySymbol = content.currency === 'USD' ? '$' : '₹';
      return (
        <section
          className="py-12 px-4 sm:px-8 rounded-lg bg-background text-foreground"
          style={{
            backgroundColor: styles.backgroundColor,
            color: styles.textColor,
            padding: styles.padding
          }}
        >
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold mb-2 text-foreground">{content.title || 'Our Pricing Plans'}</h2>
            <div className="mt-2 flex justify-center items-center gap-2">
              <span className="text-sm text-muted-foreground">Currency:</span>
              <span className="font-semibold text-primary-700">{content.currency}</span>
        </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(content.plans || []).map((plan, idx) => (
              <div
                key={idx}
                className="bg-muted rounded-xl shadow p-6 flex flex-col items-center border border-border"
              >
                <h3 className="text-xl font-semibold mb-2 text-primary-700">{plan.name || 'Plan'}</h3>
                <div className="text-3xl font-bold mb-4 text-primary-800">{currencySymbol}{plan.price || '0'}</div>
                <ul className="mb-6 space-y-2 text-left w-full">
                  {(plan.features || []).map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-primary-700">
                      <span className="mr-2">✔️</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-auto px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                  Choose {plan.name || 'Plan'}
                </Button>
              </div>
            ))}
          </div>
        </section>
      );
    }
    case 'gallery': {
      const content = section.content as GalleryContent;
      const styles = section.styles || {};
      return (
        <section className="py-12 px-4 sm:px-8 rounded-lg bg-background text-foreground" style={{ backgroundColor: styles.backgroundColor }}>
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary-900">{content.title || 'Gallery'}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(content.images || []).map((url, idx) => (
              <img key={idx} src={url} alt={`Gallery image ${idx + 1}`} className="rounded-lg object-cover w-full h-32 sm:h-40 border border-border" />
            ))}
          </div>
        </section>
      );
    }
    case 'video': {
      const content = section.content as VideoContent;
      const styles = section.styles || {};
      return (
        <section className="py-12 px-4 sm:px-8 rounded-lg flex flex-col items-center bg-background text-foreground" style={{ backgroundColor: styles.backgroundColor }}>
          <h2 className="text-2xl font-bold mb-4 text-primary-900">{content.title || 'Video'}</h2>
          {content.videoUrl ? (
            <div className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={content.videoUrl}
                title="Video"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="w-full max-w-2xl aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">No video URL</div>
          )}
        </section>
      );
    }
    case 'countdown': {
      const content = section.content as CountdownContent;
      const styles = section.styles || {};
      const endDate = content.endDate ? new Date(content.endDate) : null;
      return (
        <section className="py-12 px-4 sm:px-8 rounded-lg text-center bg-background text-foreground" style={{ backgroundColor: styles.backgroundColor }}>
          <h2 className="text-2xl font-bold mb-4 text-primary-900">{content.title || 'Countdown'}</h2>
          {endDate ? (
            <div className="text-3xl font-mono text-primary-700">
              {endDate.toLocaleString()}
            </div>
          ) : (
            <div className="text-primary-500">No end date set</div>
          )}
        </section>
      );
    }
    case 'contact': {
      const content = section.content as ContactContent;
      const styles = section.styles || {};
      return (
        <section className="py-12 px-4 sm:px-8 rounded-lg bg-background text-foreground" style={{ backgroundColor: styles.backgroundColor }}>
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-primary-900">{content.title || 'Contact Us'}</h2>
            <form className="space-y-4" onSubmit={e => {
              e.preventDefault();
              if (content.integrations?.googleSheets?.connected) {
                toast.success('Form data would be sent to Google Sheets!');
                console.log('Stub: Submitting to Google Sheets', content.integrations.googleSheets);
              } else {
                toast.success('Form submitted!');
              }
            }}>
              {(content.fields || []).map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {field.label} {field.required && <span className="text-primary-600">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea className="w-full px-3 py-2 border border-input rounded-md" required={field.required} />
                  ) : (
                    <input type={field.type} className="w-full px-3 py-2 border border-input rounded-md" required={field.required} />
                  )}
                </div>
              ))}
              <Button type="submit" className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">Send</Button>
            </form>
          </div>
        </section>
      );
    }
    case 'newsletter': {
      const content = section.content as NewsletterContent;
      const styles = section.styles || {};
      return (
        <section className="py-12 px-4 sm:px-8 rounded-lg text-center bg-background text-foreground" style={{ backgroundColor: styles.backgroundColor }}>
          <h2 className="text-2xl font-bold mb-2 text-primary-900">{content.title || 'Subscribe to our Newsletter'}</h2>
          <p className="mb-6 text-primary-700">{content.description || 'Get the latest updates and offers.'}</p>
          <form className="flex flex-col sm:flex-row justify-center gap-2 max-w-lg mx-auto" onSubmit={e => {
            e.preventDefault();
            if (content.integrations?.googleSheets?.connected) {
              toast.success('Newsletter signup would be sent to Google Sheets!');
              console.log('Stub: Submitting to Google Sheets', content.integrations.googleSheets);
            } else {
              toast.success('Subscribed!');
            }
          }}>
            <input type="email" placeholder={content.placeholder || 'Enter your email'} className="flex-1 px-4 py-2 border border-input rounded-md" />
            <Button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">Subscribe</Button>
          </form>
        </section>
      );
    }
    case 'social': {
      const content = section.content as SocialContent;
      const styles = section.styles || {};
      return (
        <section className="py-12 px-4 sm:px-8 rounded-lg text-center bg-background text-foreground" style={{ backgroundColor: styles.backgroundColor }}>
          <h2 className="text-2xl font-bold mb-4 text-foreground">{content.title || 'Trusted by'}</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {(content.logos || []).map((url, idx) => (
              <img key={idx} src={url} alt={`Logo ${idx + 1}`} className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition" />
            ))}
          </div>
        </section>
      );
    }
    case 'custom': {
      const content = section.content as CustomContent;
      const styles = section.styles || {};
      return (
        <section className="py-12 px-4 sm:px-8 rounded-lg bg-background text-foreground" style={{ backgroundColor: styles.backgroundColor }}>
          <div className="max-w-4xl mx-auto">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.html || '<div class="text-muted-foreground">No custom HTML</div>' }} />
          </div>
        </section>
      );
    }
    default:
      return <div className="p-8 text-center text-muted-foreground">Unknown section type</div>;
  }
};