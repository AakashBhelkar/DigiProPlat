import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, Upload, X, Loader2, Search, Sparkles } from 'lucide-react';
import { uploadFile, getFileUrl } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Cropper from 'react-easy-crop';
import { AIGenerateImageModal } from './AIGenerateImageModal';
import { generateImage } from '../../lib/openai';

interface MediaPickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  altText?: string;
  label?: string;
  unsplashAccessKey?: string; // Add Unsplash API key prop
  onSelectImage?: (url: string, alt?: string) => void; // For custom alt text
}

export const MediaPicker: React.FC<MediaPickerProps> = ({ value, onChange, multiple = true, altText, label, unsplashAccessKey, onSelectImage }) => {
  const [uploading, setUploading] = useState(false);
  const [_uploadProgress, _setUploadProgress] = useState<number | null>(null);
  const [showUnsplash, setShowUnsplash] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState<{ url: string; name: string }[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [altTexts, setAltTexts] = useState<string[]>(value.map(() => ''));
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [previewDetails, setPreviewDetails] = useState<{ size?: number; uploadedAt?: string } | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // AI Image Modal State
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);

  // Handler to open AI modal
  const handleAIGenerate = () => {
    setAIModalOpen(true);
    setAIError(null);
  };

  // Handler to receive AI image and update the field
  const handleAIGenerateImage = async (prompt: string, options: any) => {
    setIsAIGenerating(true);
    setAIError(null);
    try {
      // Call AI image generation utility (to be implemented)
      const imageUrl = await generateImage(prompt, options);
      if (multiple) {
        onChange([...(value || []), imageUrl]);
      } else {
        onChange([imageUrl]);
      }
      setAIModalOpen(false);
    } catch (err: unknown) {
      setAIError(err instanceof Error ? err.message : 'Failed to generate image.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // DnD-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  // Update altTexts when value changes
  React.useEffect(() => {
    setAltTexts((prev) => value.map((v, i) => prev[i] || ''));
  }, [value]);

  // Drag end handler for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((url) => url === active.id);
    const newIndex = value.findIndex((url) => url === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const newValue = arrayMove(value, oldIndex, newIndex);
      const newAltTexts = arrayMove(altTexts, oldIndex, newIndex);
      onChange(newValue);
      setAltTexts(newAltTexts);
    }
    setDragging(false);
  };

  // Enhanced onDrop with error handling
  const onDrop = async (acceptedFiles: File[], fileRejections: any[]) => {
    setFileError(null);
    if (fileRejections && fileRejections.length > 0) {
      setFileError('Some files were rejected. Please check file type and size.');
      return;
    }
    if (acceptedFiles.length > 0) {
      setCropImage(acceptedFiles[0]);
      setCropModalOpen(true);
    }
  };

  // Crop and upload logic
  const handleCropComplete = async () => {
    setCropping(true);
    try {
      // Crop image to blob
      const croppedBlob = await getCroppedImg(cropImage, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], cropImage.name, { type: cropImage.type });
      setUploading(true);
      const path = `media/${Date.now()}-${croppedFile.name}`;
      const url = await uploadFile('page-media', path, croppedFile);
      onChange(multiple ? [...value, url] : [url]);
      setAltTexts((prev) => [...prev, '']);
      toast.success('Image uploaded!');
      setCropModalOpen(false);
      setCropImage(null);
    } catch (_e) {
      setFileError('Crop/upload failed. Please try again.');
      toast.error('Crop/upload failed');
    } finally {
      setUploading(false);
      setCropping(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (_fileRejections) => {
      setFileError('Some files were rejected. Please check file type and size.');
    },
  });

  const removeImage = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
    setAltTexts((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateAltText = (idx: number, text: string) => {
    setAltTexts((prev) => {
      const next = [...prev];
      next[idx] = text;
      return next;
    });
  };

  // Select all handler
  const handleSelectAll = () => {
    if (selectedImages.length === value.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages([...value]);
    }
  };

  // Remove selected images
  const handleRemoveSelected = () => {
    const newValue = value.filter(url => !selectedImages.includes(url));
    onChange(newValue);
    setAltTexts((prev) => prev.filter((_, i) => !selectedImages.includes(value[i])));
    setSelectedImages([]);
  };

  // Unsplash modal logic (simplified, real implementation will use Unsplash API)
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState<any[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);

  const searchUnsplash = async () => {
    setUnsplashLoading(true);
    try {
      const key = unsplashAccessKey || 'YOUR_UNSPLASH_ACCESS_KEY';
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(unsplashQuery)}&client_id=${key}&per_page=12`);
      const data = await res.json();
      setUnsplashResults(data.results || []);
    } catch {
      toast.error('Unsplash search failed');
    } finally {
      setUnsplashLoading(false);
    }
  };

  // Prompt for alt text when selecting Unsplash image (optional, fallback to description)
  const selectUnsplash = (url: string, alt?: string) => {
    if (onSelectImage) {
      onSelectImage(url, alt);
    } else {
      onChange(multiple ? [...value, url] : [url]);
    }
    setShowUnsplash(false);
    setUnsplashResults([]);
    setUnsplashQuery('');
  };

  // Fetch images from Supabase Storage (page-media bucket)
  const fetchLibraryImages = async () => {
    setLibraryLoading(true);
    setLibraryError(null);
    try {
      // @ts-ignore: supabase global import
      const { data, error } = await window.supabase.storage.from('page-media').list('media', { limit: 100 });
      if (error) throw error;
      const files = (data || []).filter((f: any) => f.name && !f.name.endsWith('/'));
      setLibraryImages(files.map((f: any) => ({ url: getFileUrl('page-media', `media/${f.name}`), name: f.name })));
    } catch (e: any) {
      setLibraryError(e.message || 'Failed to load media library');
    } finally {
      setLibraryLoading(false);
    }
  };

  // Fetch image details (size, uploadedAt) from Supabase Storage if available
  const fetchImageDetails = async (img: { url: string; name: string }) => {
    try {
      // @ts-ignore: supabase global import
      const { data, error } = await window.supabase.storage.from('page-media').list('media', { limit: 100 });
      if (error) throw error;
      const file = (data || []).find((f: any) => f.name === img.name);
      if (file) {
        setPreviewDetails({ size: file.metadata?.size, uploadedAt: file.created_at });
      } else {
        setPreviewDetails(null);
      }
    } catch {
      setPreviewDetails(null);
    }
  };

  // Skeleton loader for images
  const [imageLoading, setImageLoading] = useState<boolean[]>(value.map(() => true));
  React.useEffect(() => {
    setImageLoading(value.map(() => true));
  }, [value]);

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 bg-white'}`}
        aria-label="Upload image(s)"
        tabIndex={0}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-gray-600">Uploading... {uploadProgress !== null ? `${uploadProgress}%` : ''}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-primary/60" />
            <span className="text-sm text-gray-600">Drag & drop or click to upload {multiple ? 'images' : 'an image'}</span>
          </div>
        )}
        {fileError && <div className="mt-2 text-xs text-red-500">{fileError}</div>}
      </div>
      {/* Drag-and-drop reordering for multi-image pickers */}
      {multiple && value.length > 1 ? (
        <>
          <div className="flex items-center gap-2 mt-2 mb-1">
            <input
              type="checkbox"
              checked={selectedImages.length === value.length && value.length > 0}
              onChange={handleSelectAll}
              aria-label="Select all images"
            />
            <span className="text-xs text-gray-600">Select All</span>
            {selectedImages.length > 0 && (
              <button
                type="button"
                className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                onClick={handleRemoveSelected}
                aria-label="Remove selected images"
              >
                Remove Selected
              </button>
            )}
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={() => setDragging(true)}>
            <SortableContext items={value} strategy={verticalListSortingStrategy}>
              <div className="flex gap-2 mt-1 flex-wrap">
                {value.map((url, idx) => (
                  <div key={url} id={url} className={`relative group w-24 h-32 rounded overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center justify-center ${dragging ? 'ring-2 ring-primary' : ''}`}
                    tabIndex={0}
                  >
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(url)}
                      onChange={e => {
                        setSelectedImages(sel => e.target.checked ? [...sel, url] : sel.filter(u => u !== url));
                      }}
                      className="absolute top-1 left-1 z-10"
                      aria-label={`Select image ${idx + 1}`}
                    />
                    {imageLoading[idx] && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                    <img src={url} alt={altTexts[idx] || altText || `Image ${idx + 1}`} className="object-cover w-full h-20" onLoad={() => setImageLoading(l => { const arr = [...l]; arr[idx] = false; return arr; })} style={{ display: imageLoading[idx] ? 'none' : 'block' }} />
                    <input
                      type="text"
                      value={altTexts[idx] || ''}
                      onChange={e => updateAltText(idx, e.target.value)}
                      placeholder="Alt text"
                      className="w-full px-2 py-1 text-xs border-t border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary"
                      aria-label="Edit alt text"
                    />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-gray-700 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      ) : (
        <div className="flex gap-2 mt-3 flex-wrap">
          {value.map((url, idx) => (
            <div key={url} className="relative group w-24 h-32 rounded overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
              {imageLoading[idx] && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
              <img src={url} alt={altTexts[idx] || altText || `Image ${idx + 1}`} className="object-cover w-full h-20" onLoad={() => setImageLoading(l => { const arr = [...l]; arr[idx] = false; return arr; })} style={{ display: imageLoading[idx] ? 'none' : 'block' }} />
              <input
                type="text"
                value={altTexts[idx] || ''}
                onChange={e => updateAltText(idx, e.target.value)}
                placeholder="Alt text"
                className="w-full px-2 py-1 text-xs border-t border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary"
                aria-label="Edit alt text"
              />
              <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-gray-700 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <button type="button" className="ml-1 p-1 rounded hover:bg-primary/20" title="AI Generate Image" onClick={handleAIGenerate}>
          <Sparkles className="h-4 w-4 text-primary" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button type="button" className="flex items-center gap-2 text-primary hover:underline text-sm" onClick={() => setShowUnsplash(true)}>
          <Search className="h-4 w-4" /> Insert from Unsplash
        </button>
        <button type="button" className="flex items-center gap-2 text-primary hover:underline text-sm" onClick={() => { setShowLibrary(true); fetchLibraryImages(); }}>
          <Image className="h-4 w-4" /> Media Library
        </button>
      </div>
      {/* Media Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative" role="dialog" aria-modal="true" aria-label="Media library">
            <button className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-700" onClick={() => setShowLibrary(false)} aria-label="Close media library"><X className="h-5 w-5" /></button>
            <h3 className="text-lg font-bold mb-2">Media Library</h3>
            {libraryLoading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : libraryError ? (
              <div className="text-center text-red-500 py-8">{libraryError}</div>
            ) : libraryImages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No images found in your media library.</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {libraryImages.map((img) => (
                  <button key={img.url} className="rounded overflow-hidden border border-gray-200 hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary" onClick={() => { setPreviewImage(img); fetchImageDetails(img); }} aria-label={img.name}>
                    <img src={img.url} alt={img.name} className="object-cover w-full h-24" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Preview Modal */}
          {previewImage && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-label="Image preview">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative flex flex-col items-center">
                <button className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-700" onClick={() => setPreviewImage(null)} aria-label="Close preview"><X className="h-5 w-5" /></button>
                <img src={previewImage.url} alt={previewImage.name} className="object-contain w-full max-h-80 mb-4 rounded" />
                <div className="w-full text-left mb-2">
                  <div className="font-semibold text-gray-800">{previewImage.name}</div>
                  {previewDetails && (
                    <div className="text-xs text-gray-500 mt-1">
                      {previewDetails.size && <span>Size: {(previewDetails.size / 1024).toFixed(1)} KB</span>}
                      {previewDetails.uploadedAt && <span className="ml-2">Uploaded: {new Date(previewDetails.uploadedAt).toLocaleString()}</span>}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <button className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm" onClick={() => { navigator.clipboard.writeText(previewImage.url); toast.success('URL copied!'); }}>Copy URL</button>
                  <a className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm text-center" href={previewImage.url} download target="_blank" rel="noopener noreferrer">Download</a>
                  <button className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm" onClick={async () => { /* @ts-ignore */ const { error } = await window.supabase.storage.from('page-media').remove([`media/${previewImage.name}`]); if (!error) { setLibraryImages(libraryImages.filter(i => i.name !== previewImage.name)); setPreviewImage(null); toast.success('Image deleted'); } else { toast.error('Delete failed'); } }}>Delete</button>
                </div>
                <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm w-full" onClick={() => { onChange(multiple ? [...value, previewImage.url] : [previewImage.url]); setShowLibrary(false); setPreviewImage(null); }}>Insert</button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Unsplash Modal */}
      {showUnsplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative" role="dialog" aria-modal="true" aria-label="Unsplash image search">
            <button className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-700" onClick={() => setShowUnsplash(false)} aria-label="Close Unsplash modal"><X className="h-5 w-5" /></button>
            <h3 className="text-lg font-bold mb-2">Search Unsplash</h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={unsplashQuery} onChange={e => setUnsplashQuery(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" placeholder="Search for images..." onKeyDown={e => e.key === 'Enter' && searchUnsplash()} aria-label="Unsplash search input" />
              <button onClick={searchUnsplash} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90" disabled={unsplashLoading}>{unsplashLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {unsplashResults.map((img: any) => (
                <button key={img.id} className="rounded overflow-hidden border border-gray-200 hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary" onClick={() => selectUnsplash(img.urls.small, img.alt_description)} aria-label={img.alt_description || 'Select image'}>
                  <img src={img.urls.small} alt={img.alt_description || 'Unsplash image'} className="object-cover w-full h-24" />
                </button>
              ))}
            </div>
            {unsplashResults.length === 0 && !unsplashLoading && <div className="text-gray-400 text-center mt-4">No results</div>}
          </div>
        </div>
      )}
      {/* Cropping Modal */}
      {cropModalOpen && cropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative" role="dialog" aria-modal="true" aria-label="Crop image">
            <button className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-700" onClick={() => setCropModalOpen(false)} aria-label="Close crop modal"><X className="h-5 w-5" /></button>
            <h3 className="text-lg font-bold mb-2">Crop Image</h3>
            <div className="relative w-full h-64 bg-gray-100 rounded">
              <Cropper
                image={URL.createObjectURL(cropImage)}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
              />
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button className="px-4 py-2 bg-gray-100 rounded" onClick={() => setCropModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded" onClick={handleCropComplete} disabled={cropping}>{cropping ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crop & Upload'}</button>
            </div>
          </div>
        </div>
      )}
      <AIGenerateImageModal
        isOpen={aiModalOpen}
        onClose={() => setAIModalOpen(false)}
        onGenerate={handleAIGenerateImage}
        isGenerating={isAIGenerating}
        error={aiError}
      />
    </div>
  );
}; 