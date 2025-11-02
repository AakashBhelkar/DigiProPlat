import { create } from 'zustand';
import { supabase, handleSupabaseError, uploadFile } from '../lib/supabase';
import { Product, ProductFile } from '../types';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  selectedProduct: Product | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sales' | 'revenue' | 'userId'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  uploadProductFile: (productId: string, file: File) => Promise<ProductFile>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  selectedProduct: null,

  fetchProducts: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_files (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error);
        return;
      }

      const products: Product[] = data.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        tags: product.tags,
        price: product.price,
        files: product.product_files.map((file: any) => ({
          id: file.id,
          name: file.name,
          size: file.file_size,
          type: file.file_type,
          url: file.storage_path,
          downloadCount: file.download_count
        })),
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        userId: product.user_id,
        isPublic: product.is_public,
        sales: product.sales_count,
        revenue: product.total_revenue
      }));

      set({ products });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch products');
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (productData) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: productData.title,
          description: productData.description,
          category: productData.category,
          tags: productData.tags,
          price: productData.price,
          user_id: user.id,
          is_public: productData.isPublic || false
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
        return;
      }

      // Upload files if any
      if (productData.files && productData.files.length > 0) {
        for (const file of productData.files) {
          await get().uploadProductFile(data.id, file as any);
        }
      }

      await get().fetchProducts();
      toast.success('Product created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          tags: updates.tags,
          price: updates.price,
          is_public: updates.isPublic
        })
        .eq('id', id);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      await get().fetchProducts();
      toast.success('Product updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error);
        return;
      }

      await get().fetchProducts();
      toast.success('Product deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
      throw error;
    }
  },

  setSelectedProduct: (product) => {
    set({ selectedProduct: product });
  },

  uploadProductFile: async (productId, file) => {
    try {
      // Upload file to Supabase Storage
      const filePath = `products/${productId}/${Date.now()}-${file.name}`;
      const fileUrl = await uploadFile('product-files', filePath, file);

      // Save file metadata to database
      const { data, error } = await supabase
        .from('product_files')
        .insert({
          product_id: productId,
          name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: fileUrl
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      const productFile: ProductFile = {
        id: data.id,
        name: data.name,
        size: data.file_size,
        type: data.file_type,
        url: data.storage_path,
        downloadCount: data.download_count
      };

      return productFile;
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
      throw error;
    }
  }
}));