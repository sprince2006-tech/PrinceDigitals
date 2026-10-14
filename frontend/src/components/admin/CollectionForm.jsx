import React, { useState } from 'react';
import { ImageUploadField } from '../common/ImageUploadField';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

export const CollectionForm = ({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save Collection',
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [slug, setSlug] = useState(initialData.slug || '');
  const [isPublished, setIsPublished] = useState(
    typeof initialData.isPublished === 'boolean' ? initialData.isPublished : false
  );
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [error, setError] = useState('');

  const isEditMode = Boolean(initialData._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Collection title is required');
      return;
    }

    if (!isEditMode && !coverImageFile && !initialData.coverImageUrl) {
      setError('A cover image is required to create a new collection');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('isPublished', String(isPublished));

    if (slug.trim() && isEditMode) {
      formData.append('slug', slug.trim());
    }

    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }

    try {
      await onSubmit(formData, {
        title: title.trim(),
        description: description.trim(),
        isPublished,
        slug: slug.trim(),
        coverImageFile,
      });
    } catch (err) {
      setError(err.message || 'Failed to save collection');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Collection Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
          Collection Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Peak Formals, Summer Casuals"
          required
          maxLength={120}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 text-sm text-neutral-900 placeholder:text-neutral-400"
        />
      </div>

      {/* Optional Slug Editing for Edit Mode */}
      {isEditMode && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
            URL Slug
          </label>
          <div className="flex items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            <span className="text-neutral-400 select-none">/collection/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-sm text-neutral-900 flex-1 ml-1"
            />
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Keep existing slugs unchanged to maintain active Instagram bio link stability.
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Short description highlighting the collection..."
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 text-sm text-neutral-900 placeholder:text-neutral-400 resize-none"
        />
      </div>

      {/* Cover Image Upload Field */}
      <ImageUploadField
        label="Cover Image"
        required={!isEditMode}
        currentImageUrl={initialData.coverImageUrl}
        onFileSelect={(file) => setCoverImageFile(file)}
      />

      {/* Publish Switch */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-white">
        <div>
          <span className="block text-sm font-semibold text-neutral-900">
            Publish Collection
          </span>
          <span className="block text-xs text-neutral-500 mt-0.5">
            When published, this collection is visible to public visitors on the home page.
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isPublished}
          onClick={() => setIsPublished(!isPublished)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isPublished ? 'bg-neutral-900' : 'bg-neutral-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isPublished ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Submit Button */}
      <div className="pt-4 pb-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 min-h-[46px] text-xs uppercase tracking-widest font-semibold rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Collection...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
};
