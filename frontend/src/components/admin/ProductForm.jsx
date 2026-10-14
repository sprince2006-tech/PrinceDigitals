import React, { useState } from 'react';
import { ImageUploadField } from '../common/ImageUploadField';
import { AlertCircle, Loader2, ExternalLink } from 'lucide-react';

export const ProductForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Product',
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [productUrl, setProductUrl] = useState(initialData.productUrl || '');
  const [isPublished, setIsPublished] = useState(
    typeof initialData.isPublished === 'boolean' ? initialData.isPublished : true
  );
  const [productImageFile, setProductImageFile] = useState(null);
  const [error, setError] = useState('');

  const isEditMode = Boolean(initialData._id);

  const isValidHttpUrl = (str) => {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Product title is required');
      return;
    }

    if (!productUrl.trim()) {
      setError('Product external shopping URL is required');
      return;
    }

    if (!isValidHttpUrl(productUrl.trim())) {
      setError('Product URL must begin with http:// or https://');
      return;
    }

    if (!isEditMode && !productImageFile && !initialData.imageUrl) {
      setError('A product image is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('productUrl', productUrl.trim());
    formData.append('isPublished', String(isPublished));

    if (productImageFile) {
      formData.append('productImage', productImageFile);
    }

    try {
      await onSubmit(formData, {
        title: title.trim(),
        description: description.trim(),
        productUrl: productUrl.trim(),
        isPublished,
        productImageFile,
      });
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Product Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
          Product Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Slim-fit Italian Wool Blazer"
          required
          maxLength={180}
          className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 text-sm text-neutral-900 placeholder:text-neutral-400"
        />
      </div>

      {/* Product URL */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
            Shopping Destination URL <span className="text-rose-500">*</span>
          </label>
          {isValidHttpUrl(productUrl) && (
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-900 underline"
            >
              <span>Test link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <input
          type="url"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://www.amazon.com/dp/... or https://brand.com/item"
          required
          className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 text-sm text-neutral-900 placeholder:text-neutral-400 font-mono text-xs"
        />
        <p className="text-[11px] text-neutral-400 mt-1">
          When visitors click "Open", they will be directed to this exact URL.
        </p>
      </div>

      {/* Optional Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
          Short Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="e.g. 100% linen, navy blue, sizes S-XXL"
          className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 text-sm text-neutral-900 placeholder:text-neutral-400 resize-none"
        />
      </div>

      {/* Product Image */}
      <ImageUploadField
        label="Product Image"
        required={!isEditMode}
        currentImageUrl={initialData.imageUrl}
        onFileSelect={(file) => setProductImageFile(file)}
      />

      {/* Published Toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-900">
            Publish Product
          </span>
          <span className="block text-[11px] text-neutral-500">
            Visible inside this collection on the public catalog.
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isPublished}
          onClick={() => setIsPublished(!isPublished)}
          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isPublished ? 'bg-neutral-900' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isPublished ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Form Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-4 py-2.5 min-h-[42px] text-xs font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-2.5 px-5 min-h-[42px] text-xs uppercase tracking-widest font-semibold rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-sm text-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
};
