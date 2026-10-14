import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const ImageUploadField = ({
  currentImageUrl,
  onFileSelect,
  label = 'Upload Image',
  required = false,
  maxSizeMb = 5,
  aspectRatio = '4/5', // '4/5' or '1/1' or '16/9'
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setError('');
    if (!file) return;

    // Check MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Check size limit
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image size exceeds the ${maxSizeMb}MB limit.`);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {displayUrl && (
          <span className="text-xs text-neutral-500">
            {previewUrl ? 'New image selected' : 'Current active image'}
          </span>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200 flex flex-col items-center justify-center p-4 min-h-[180px] bg-neutral-50/50 hover:bg-neutral-50 ${
          isDragging ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-300'
        } ${displayUrl ? 'border-solid' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {displayUrl ? (
          <div className="relative w-full flex flex-col items-center">
            <div className="relative max-h-56 w-auto rounded-lg overflow-hidden border border-neutral-200 shadow-sm bg-white">
              <img
                src={displayUrl}
                alt="Upload preview"
                className="max-h-56 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleClear}
                title="Remove image"
                className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-full transition-colors backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-neutral-500 font-medium">
              Click or drag to replace this image
            </p>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center mx-auto mb-3 text-neutral-500">
              <Upload className="w-5 h-5 stroke-[1.5]" />
            </div>
            <p className="text-sm font-medium text-neutral-800">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Supports JPEG, PNG, or WebP (up to {maxSizeMb}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
