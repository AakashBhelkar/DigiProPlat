import { create } from 'zustand';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { LandingPage, PageSection, Template } from '../types';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';
import type { Database } from '../types/database';

interface GlobalDesign {
  fontFamily: {
    heading: string;
    body: string;
  };
  fontSize: {
    heading: number;
    body: number;
  };
  fontWeight: {
    heading: number;
    body: number;
  };
  letterSpacing: {
    heading: number;
    body: number;
  };
  lineHeight: {
    heading: number;
    body: number;
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };
  buttonStyles: {
    shape: 'rounded' | 'pill' | 'square';
    color: string;
    hoverColor: string;
    font: string;
    shadow: boolean;
    borderRadius: number;
    borderColor: string;
    borderWidth: number;
  };
  globalShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive: {
    containerWidth: number;
    sectionSpacing: number;
    breakpoints: {
      desktop: number;
      tablet: number;
      mobile: number;
    };
    enableSpacing: {
      desktop: boolean;
      tablet: boolean;
      mobile: boolean;
    };
  };
}

interface PageBuilderState {
  pages: LandingPage[];
  currentPage: LandingPage | null;
  isEditing: boolean;
  selectedSection: PageSection | null;
  isLoading: boolean;
  fetchPages: () => Promise<void>;
  fetchPage: (id: string) => Promise<void>;
  createPage: (pageData: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'analytics'>) => Promise<string>;
  updatePage: (id: string, updates: Partial<LandingPage>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  setCurrentPage: (page: LandingPage | null) => void;
  setIsEditing: (editing: boolean) => void;
  setSelectedSection: (section: PageSection | null) => void;
  addSection: (section: Omit<PageSection, 'id'>) => Promise<void>;
  updateSection: (id: string, updates: Partial<PageSection>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  reorderSections: (fromIndex: number, toIndex: number) => Promise<void>;
  generatePageWithAI: (prompt: string) => Promise<void>;
  globalDesign: GlobalDesign;
  setGlobalDesign: (updates: Partial<GlobalDesign>) => void;
  // Template library
  templates: Template[];
  currentTemplate: Template | null;
  isLoadingTemplates: boolean;
  fetchTemplates: () => Promise<void>;
  createTemplate: (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  useTemplate: (template: Template) => void;
}

export const usePageBuilderStore = create<PageBuilderState>((set, get) => ({
  pages: [],
  currentPage: null,
  isEditing: false,
  selectedSection: null,
  isLoading: false,
  globalDesign: {
    fontFamily: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    fontSize: {
      heading: 36,
      body: 16,
    },
    fontWeight: {
      heading: 700,
      body: 400,
    },
    letterSpacing: {
      heading: 0,
      body: 0,
    },
    lineHeight: {
      heading: 1.2,
      body: 1.5,
    },
    colorPalette: {
      primary: '#14b8a6', // teal-500
      secondary: '#10b981', // emerald-500
      accent: '#f59e42', // orange-400
      background: '#f0fdfa', // teal-50
      text: '#134e4a', // teal-900
      success: '#10b981', // emerald-500
      warning: '#facc15', // yellow-400
      error: '#ef4444', // red-500
    },
    buttonStyles: {
      shape: 'rounded',
      color: '#14b8a6', // teal-500
      hoverColor: '#0d9488', // teal-600
      font: 'Inter, sans-serif',
      shadow: true,
      borderRadius: 8,
      borderColor: '#14b8a6', // teal-500
      borderWidth: 1,
    },
    globalShadow: 'md',
    responsive: {
      containerWidth: 1200,
      sectionSpacing: 32,
      breakpoints: {
        desktop: 1200,
        tablet: 768,
        mobile: 375,
      },
      enableSpacing: {
        desktop: true,
        tablet: true,
        mobile: true,
      },
    },
  },
  setGlobalDesign: (updates) => set(state => ({
    globalDesign: {
      ...state.globalDesign,
      ...updates,
      fontFamily: {
        ...state.globalDesign.fontFamily,
        ...updates.fontFamily,
      },
      colorPalette: {
        ...state.globalDesign.colorPalette,
        ...updates.colorPalette,
      },
      buttonStyles: {
        ...state.globalDesign.buttonStyles,
        ...updates.buttonStyles,
      },
      responsive: {
        ...state.globalDesign.responsive,
        ...updates.responsive,
        breakpoints: {
          ...state.globalDesign.responsive.breakpoints,
          ...(updates.responsive?.breakpoints || {}),
        },
      },
    },
  })),

  fetchPages: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select(`
          *,
          products (title),
          page_sections (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error);
        return;
      }

      const pages: LandingPage[] = (data as (Database['public']['Tables']['landing_pages']['Row'] & {
        products?: { title: string } | null;
        page_sections: Database['public']['Tables']['page_sections']['Row'][];
      })[]).map(page => ({
        id: page.id,
        title: page.title,
        slug: page.slug,
        productId: page.product_id,
        userId: page.user_id,
        sections: (page.page_sections || []).map((section) => ({
          id: section.id,
          type: section.type,
          content: section.content,
          styles: section.styles,
          order: section.order_index
        })),
        customDomain: page.custom_domain,
        isPublished: page.is_published,
        analytics: {
          views: page.views_count,
          uniqueVisitors: page.views_count, // Simplified for now
          conversions: page.conversions_count,
          conversionRate: page.views_count && page.views_count > 0 ? (page.conversions_count / page.views_count) * 100 : 0,
          revenue: 0 // Would need to calculate from transactions
        },
        createdAt: page.created_at,
        updatedAt: page.updated_at
      }));

      set({ pages });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to fetch pages');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPage: async (id) => {
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select(`
          *,
          page_sections (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        handleSupabaseError(error);
        return;
      }

      const pageData = data as (Database['public']['Tables']['landing_pages']['Row'] & {
        page_sections: Database['public']['Tables']['page_sections']['Row'][];
      });

      const page: LandingPage = {
        id: pageData.id,
        title: pageData.title,
        slug: pageData.slug,
        productId: pageData.product_id,
        userId: pageData.user_id,
        sections: (pageData.page_sections || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((section) => ({
            id: section.id,
            type: section.type,
            content: section.content,
            styles: section.styles,
            order: section.order_index
          })),
        customDomain: pageData.custom_domain,
        isPublished: pageData.is_published,
        analytics: {
          views: pageData.views_count,
          uniqueVisitors: pageData.views_count,
          conversions: pageData.conversions_count,
          conversionRate: pageData.views_count && pageData.views_count > 0 ? (pageData.conversions_count / pageData.views_count) * 100 : 0,
          revenue: 0
        },
        createdAt: pageData.created_at,
        updatedAt: pageData.updated_at
      };

      set({ currentPage: page });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to fetch page');
    }
  },

  createPage: async (pageData) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .insert({
          title: pageData.title,
          slug: pageData.slug,
          product_id: pageData.productId,
          user_id: user.id,
          custom_domain: pageData.customDomain,
          is_published: pageData.isPublished || false
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      // Create sections if any
      if (pageData.sections && pageData.sections.length > 0) {
        const sectionsToInsert = pageData.sections.map((section, index) => ({
          page_id: data.id,
          type: section.type,
          content: section.content,
          styles: section.styles,
          order_index: index
        }));

        const { error: sectionsError } = await supabase
          .from('page_sections')
          .insert(sectionsToInsert);

        if (sectionsError) {
          handleSupabaseError(sectionsError);
        }
      }

      await get().fetchPages();
      toast.success('Page created successfully!');
      return data.id;
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to create page');
      throw err;
    }
  },

  updatePage: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({
          title: updates.title,
          slug: updates.slug,
          custom_domain: updates.customDomain,
          is_published: updates.isPublished
        })
        .eq('id', id);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      await get().fetchPages();
      if (get().currentPage?.id === id) {
        await get().fetchPage(id);
      }
      toast.success('Page updated successfully!');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update page');
      throw err;
    }
  },

  deletePage: async (id) => {
    try {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      await get().fetchPages();
      if (get().currentPage?.id === id) {
        set({ currentPage: null });
      }
      toast.success('Page deleted successfully!');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to delete page');
      throw err;
    }
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  setIsEditing: (editing) => set({ isEditing: editing }),
  setSelectedSection: (section) => set({ selectedSection: section }),

  addSection: async (sectionData) => {
    const currentPage = get().currentPage;
    if (!currentPage) return;

    try {
      const { error } = await supabase
        .from('page_sections')
        .insert({
          page_id: currentPage.id,
          type: sectionData.type,
          content: sectionData.content,
          styles: sectionData.styles,
          order_index: sectionData.order
        });

      if (error) {
        handleSupabaseError(error);
        return;
      }

      await get().fetchPage(currentPage.id);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to add section');
    }
  },

  updateSection: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('page_sections')
        .update({
          type: updates.type,
          content: updates.content,
          styles: updates.styles,
          order_index: updates.order
        })
        .eq('id', id);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      const currentPage = get().currentPage;
      if (currentPage) {
        await get().fetchPage(currentPage.id);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update section');
    }
  },

  deleteSection: async (id) => {
    try {
      const { error } = await supabase
        .from('page_sections')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      const currentPage = get().currentPage;
      if (currentPage) {
        await get().fetchPage(currentPage.id);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to delete section');
    }
  },

  reorderSections: async (fromIndex, toIndex) => {
    const currentPage = get().currentPage;
    if (!currentPage) return;

    try {
      const sections = [...currentPage.sections];
      const [removed] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, removed);

      // Update order_index for all sections
      const updates = sections.map((section, index) => ({
        id: section.id,
        order_index: index
      }));

      for (const update of updates) {
        await supabase
          .from('page_sections')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      await get().fetchPage(currentPage.id);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to reorder sections');
    }
  },

  generatePageWithAI: async () => {
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const currentPage = get().currentPage;
    if (!currentPage) return;

    try {
      // Delete existing sections
      await supabase
        .from('page_sections')
        .delete()
        .eq('page_id', currentPage.id);

      // Create AI-generated sections
      const aiSections = [
        {
          page_id: currentPage.id,
          type: 'hero',
          order_index: 0,
          content: {
            title: 'AI-Generated Landing Page',
            subtitle: 'This content was created based on your prompt',
            buttonText: 'Get Started',
            backgroundImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
          },
          styles: {
            backgroundColor: '#4f46e5',
            textColor: '#ffffff'
          }
        },
        {
          page_id: currentPage.id,
          type: 'features',
          order_index: 1,
          content: {
            title: 'Key Features',
            features: [
              { title: 'Feature 1', description: 'AI-generated feature description' },
              { title: 'Feature 2', description: 'Another great feature' },
              { title: 'Feature 3', description: 'Third amazing feature' }
            ]
          },
          styles: {
            backgroundColor: '#ffffff',
            textColor: '#1f2937'
          }
        }
      ];

      const { error } = await supabase
        .from('page_sections')
        .insert(aiSections);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      await get().fetchPage(currentPage.id);
      toast.success('Page generated successfully!');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to generate page');
    }
  },

  // Template library
  templates: [],
  currentTemplate: null,
  isLoadingTemplates: false,
  fetchTemplates: async () => {
    set({ isLoadingTemplates: true });
    try {
      const { user } = useAuthStore.getState();
      // Fetch public templates and user's own templates
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .or(`is_public.eq.true,user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });
      if (error) {
        handleSupabaseError(error);
        set({ isLoadingTemplates: false });
        return;
      }
      const templates = (data || []).map((tpl: Database['public']['Tables']['templates']['Row']) => ({
        ...tpl,
        sections: Array.isArray(tpl.sections) ? tpl.sections : JSON.parse(tpl.sections as string),
      }));
      set({ templates, isLoadingTemplates: false });
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to fetch templates');
      set({ isLoadingTemplates: false });
    }
  },
  createTemplate: async (templateData) => {
    // Frontend validation
    if (!templateData.name || !templateData.sections || !Array.isArray(templateData.sections) || templateData.sections.length === 0 || !templateData.category || !templateData.previewImage) {
      toast.error('Please fill in all required template fields (name, preview, category, sections).');
      throw new Error('Missing required template fields');
    }
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          ...templateData,
          user_id: user.id,
          sections: JSON.stringify(templateData.sections),
        })
        .select()
        .single();
      if (error) {
        handleSupabaseError(error);
        throw error;
      }
      await get().fetchTemplates();
      toast.success('Template saved!');
      return data.id;
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to create template');
      throw err;
    }
  },
  updateTemplate: async (id, updates) => {
    // Frontend validation
    if (updates.name !== undefined && !updates.name) {
      toast.error('Template name is required.');
      throw new Error('Template name is required');
    }
    if (updates.sections !== undefined && (!Array.isArray(updates.sections) || updates.sections.length === 0)) {
      toast.error('At least one section is required.');
      throw new Error('At least one section is required');
    }
    if (updates.category !== undefined && !updates.category) {
      toast.error('Template category is required.');
      throw new Error('Template category is required');
    }
    if (updates.previewImage !== undefined && !updates.previewImage) {
      toast.error('Preview image is required.');
      throw new Error('Preview image is required');
    }
    try {
      const updateData = { ...updates };
      if (updateData.sections) {
        updateData.sections = JSON.stringify(updateData.sections);
      }
      const { error } = await supabase
        .from('templates')
        .update(updateData)
        .eq('id', id);
      if (error) {
        handleSupabaseError(error);
        throw error;
      }
      await get().fetchTemplates();
      toast.success('Template updated!');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to update template');
      throw err;
    }
  },
  deleteTemplate: async (id) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
      if (error) {
        handleSupabaseError(error);
        throw error;
      }
      await get().fetchTemplates();
      toast.success('Template deleted!');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to delete template');
      throw err;
    }
  },
  useTemplate: (template) => {
    set({ currentTemplate: template });
    // Optionally, load template.sections into the builder (handled in UI)
  }
}));