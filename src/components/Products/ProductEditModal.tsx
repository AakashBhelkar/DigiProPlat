import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { X, Upload, Trash2 } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { Product } from '../../types';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface ProductEditModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  open,
  onClose,
  product,
}) => {
  const { updateProduct, uploadProductFile, fetchProducts } = useProductStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    tags: [] as string[],
    isPublic: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState<Product['files']>([]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const categories = ['templates', 'ebooks', 'graphics', 'software', 'audio', 'video'];

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        tags: product.tags || [],
        isPublic: product.isPublic || false,
      });
      setFiles(product.files || []);
    }
  }, [product]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleChange('tags', formData.tags.filter(t => t !== tag));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToUpload(file);
    }
  };

  const handleUploadFile = async () => {
    if (!product || !fileToUpload) return;

    setIsUploadingFile(true);
    try {
      const newFile = await uploadProductFile(product.id, fileToUpload);
      setFiles(prev => [...prev, newFile]);
      setFileToUpload(null);
      toast.success('File uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    if (!product) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from('product_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File removed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove file');
    }
  };

  const handleSave = async () => {
    if (!product) return;

    // Validate
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (formData.price < 0) {
      toast.error('Price must be positive');
      return;
    }

    setIsSaving(true);
    try {
      await updateProduct(product.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: formData.price,
        tags: formData.tags,
        isPublic: formData.isPublic,
      });
      await fetchProducts();
      toast.success('Product updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>
            Edit Product
          </Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Product Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            error={!formData.title.trim()}
            helperText={!formData.title.trim() ? 'Title is required' : ''}
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={4}
            required
            error={!formData.description.trim()}
            helperText={!formData.description.trim() ? 'Description is required' : ''}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleChange('category', e.target.value)}
                error={!formData.category}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              required
              error={formData.price < 0}
              helperText={formData.price < 0 ? 'Price must be positive' : ''}
            />
          </Stack>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="outlined" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Product Files
            </Typography>
            {files.length > 0 && (
              <Stack spacing={1} sx={{ mb: 2 }}>
                {files.map((file) => (
                  <Stack
                    key={file.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}

            <Stack direction="row" spacing={2} alignItems="center">
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload size={16} />}
                  disabled={isUploadingFile}
                >
                  Select File
                </Button>
              </label>
              {fileToUpload && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {fileToUpload.name}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleUploadFile}
                    disabled={isUploadingFile}
                    startIcon={isUploadingFile ? <CircularProgress size={16} /> : <Upload size={16} />}
                  >
                    {isUploadingFile ? 'Uploading...' : 'Upload'}
                  </Button>
                </>
              )}
            </Stack>
          </Box>

          <FormControl>
            <Stack direction="row" alignItems="center" spacing={1}>
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
              />
              <label htmlFor="isPublic">
                <Typography variant="body2">Make product public (visible in marketplace)</Typography>
              </label>
            </Stack>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={16} /> : null}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

