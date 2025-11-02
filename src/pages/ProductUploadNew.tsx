import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Stack,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  LinearProgress,
  Alert,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CloudUpload,
  Delete,
  Check,
  Info,
  AttachMoney,
  Description,
  Category as CategoryIcon,
  Image as ImageIcon,
  InsertDriveFile,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import { uploadMultipleFiles } from '../lib/supabase';
import toast from 'react-hot-toast';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  tags: string[];
  files: File[];
}

const steps = ['Basic Info', 'Pricing & Details', 'Upload Files', 'Review & Publish'];

const categories = [
  { value: 'templates', label: 'Templates', icon: '📄' },
  { value: 'ebooks', label: 'E-books', icon: '📚' },
  { value: 'graphics', label: 'Graphics', icon: '🎨' },
  { value: 'software', label: 'Software', icon: '💻' },
  { value: 'audio', label: 'Audio', icon: '🎵' },
  { value: 'video', label: 'Video', icon: '🎬' },
  { value: 'courses', label: 'Online Courses', icon: '🎓' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const ProductUploadNew: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { addProduct } = useProductStore();
  const { user } = useAuthStore();

  const [activeStep, setActiveStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    category: '',
    price: '',
    tags: [],
    files: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  // Dropzone for file upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...acceptedFiles]
      }));
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    switch (step) {
      case 0: // Basic Info
        if (!formData.title.trim()) {
          newErrors.title = 'Product title is required';
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required';
        }
        if (!formData.category) {
          newErrors.category = 'Please select a category';
        }
        break;

      case 1: // Pricing & Details
        if (!formData.price || parseFloat(formData.price) < 0) {
          newErrors.price = 'Please enter a valid price';
        }
        if (formData.tags.length === 0) {
          newErrors.tags = 'Add at least one tag';
        }
        break;

      case 2: // Upload Files
        if (formData.files.length === 0) {
          newErrors.files = 'Please upload at least one file';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon />;
    }
    return <InsertDriveFile />;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsUploading(true);
    setUploadProgress({});

    try {
      // Upload files to Supabase Storage
      toast.loading('Uploading files to cloud storage...', { id: 'upload' });

      const fileUrls = await uploadMultipleFiles(
        'product-files',
        `products/${user!.id}`,
        formData.files,
        (fileIndex, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileIndex]: progress
          }));
        }
      );

      toast.success('Files uploaded successfully!', { id: 'upload' });

      // Create product with uploaded file URLs
      const productFiles = formData.files.map((file, index) => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrls[index],
        downloadCount: 0
      }));

      await addProduct({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        tags: formData.tags,
        files: productFiles,
        userId: user!.id,
        isPublic: true
      });

      toast.success('Product published successfully!');
      navigate('/products');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload product');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Stack spacing={4}>
              <Alert severity="info" icon={<Info />}>
                Provide basic information about your digital product. This will be shown to potential buyers.
              </Alert>

              <TextField
                fullWidth
                label="Product Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title || 'Choose a clear, descriptive title'}
                placeholder="e.g., Premium WordPress Theme Bundle"
              />

              <TextField
                fullWidth
                label="Description"
                required
                multiline
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={!!errors.description}
                helperText={errors.description || 'Describe what buyers will get and why it\'s valuable'}
                placeholder="Provide a detailed description of your product..."
              />

              <FormControl fullWidth required error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </MotionBox>
        );

      case 1:
        return (
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Stack spacing={4}>
              <Alert severity="info" icon={<AttachMoney />}>
                Set your pricing and add relevant tags to help buyers find your product.
              </Alert>

              <TextField
                fullWidth
                label="Price"
                required
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                error={!!errors.price}
                helperText={errors.price || 'Set a competitive price in USD'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{
                  min: 0,
                  step: 0.01,
                }}
                placeholder="29.99"
              />

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Tags {formData.tags.length > 0 && `(${formData.tags.length})`}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add tags to help buyers discover your product. Press Enter or click Add.
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="e.g., wordpress, theme, responsive"
                    error={!!errors.tags && formData.tags.length === 0}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </Stack>

                {errors.tags && formData.tags.length === 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {errors.tags}
                  </Typography>
                )}

                {formData.tags.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleDeleteTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Suggested: design, template, premium, modern, business, creative
                </Typography>
              </Box>
            </Stack>
          </MotionBox>
        );

      case 2:
        return (
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Stack spacing={4}>
              <Alert severity="info" icon={<CloudUpload />}>
                Upload your digital files. Buyers will receive these files after purchase.
              </Alert>

              <Paper
                {...getRootProps()}
                sx={{
                  p: 6,
                  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                  bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  or click to browse your computer
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports: PDF, ZIP, RAR, Images, Documents (Max 100MB per file)
                </Typography>
              </Paper>

              {errors.files && formData.files.length === 0 && (
                <Alert severity="error">{errors.files}</Alert>
              )}

              {formData.files.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Uploaded Files ({formData.files.length})
                  </Typography>
                  <List sx={{ bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                    {formData.files.map((file, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          borderBottom: index < formData.files.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                        }}
                      >
                        <ListItemIcon>
                          {getFileIcon(file)}
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={formatFileSize(file.size)}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveFile(index)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Stack>
          </MotionBox>
        );

      case 3:
        return (
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Stack spacing={4}>
              <Alert severity="success" icon={<Check />}>
                Review your product details before publishing. You can edit them later.
              </Alert>

              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="overline" color="text.secondary">
                        Product Title
                      </Typography>
                      <Typography variant="h6">{formData.title}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="overline" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">{formData.description}</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="overline" color="text.secondary">
                        Category
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">
                          {categories.find(c => c.value === formData.category)?.icon}
                        </Typography>
                        <Typography variant="body1">
                          {categories.find(c => c.value === formData.category)?.label}
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="overline" color="text.secondary">
                        Price
                      </Typography>
                      <Typography variant="h5" color="primary.main" fontWeight={700}>
                        ${parseFloat(formData.price).toFixed(2)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="overline" color="text.secondary">
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {formData.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" color="primary" />
                        ))}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="overline" color="text.secondary">
                        Files ({formData.files.length})
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {formData.files.map((file, index) => (
                          <Stack key={index} direction="row" spacing={1} alignItems="center">
                            {getFileIcon(file)}
                            <Typography variant="body2">
                              {file.name} ({formatFileSize(file.size)})
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </MotionBox>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <MotionPaper
        elevation={0}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          p: { xs: 3, md: 5 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
            sx={{ mb: 2 }}
          >
            Back to Products
          </Button>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Upload New Product
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Share your digital creations with thousands of buyers
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Progress Bar */}
        {isUploading && <LinearProgress sx={{ mb: 3 }} />}

        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          <AnimatePresence mode="wait">
            {renderStepContent(activeStep)}
          </AnimatePresence>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Navigation Buttons */}
        <Stack direction="row" justifyContent="space-between">
          <Button
            disabled={activeStep === 0 || isUploading}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            size="large"
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            endIcon={activeStep === steps.length - 1 ? <Check /> : <ArrowForward />}
            disabled={isUploading}
            size="large"
          >
            {isUploading
              ? 'Uploading...'
              : activeStep === steps.length - 1
              ? 'Publish Product'
              : 'Next'}
          </Button>
        </Stack>
      </MotionPaper>
    </Container>
  );
};

export default ProductUploadNew;
