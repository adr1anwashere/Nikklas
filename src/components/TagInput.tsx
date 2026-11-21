'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export default function TagInput({ tags, onChange, maxTags = 5 }: TagInputProps) {
  const t = useTranslations('profile');
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddTag = () => {
    const trimmed = inputValue.trim().toLowerCase();
    setErrorMessage(null);

    if (!trimmed) {
      setErrorMessage(t('tagEmpty'));
      return;
    }

    if (tags.includes(trimmed)) {
      setErrorMessage(t('tagAlreadyAdded'));
      return;
    }

    if (tags.length >= maxTags) {
      setErrorMessage(t('tagLimitReached'));
      return;
    }

    onChange([...tags, trimmed]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
    setErrorMessage(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="tag-input" className="text-[13px] font-semibold text-text">
          {t('tagsLabel')}
        </label>
        <span
          className={`text-[12px] font-semibold ${
            tags.length >= maxTags ? 'text-primary-text' : 'text-muted'
          }`}
        >
          {tags.length}/{maxTags}
        </span>
      </div>

      {/* Input bar */}
      <div className="flex gap-2">
        <input
          id="tag-input"
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t('tagsPlaceholder')}
          disabled={tags.length >= maxTags}
          className="flex-1 h-12 px-4 rounded-control border border-border bg-surface text-text text-[15px] placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-text disabled:opacity-50 transition-all"
        />
        <button
          type="button"
          onClick={handleAddTag}
          disabled={tags.length >= maxTags || !inputValue.trim()}
          className="h-12 px-5 bg-surface border border-border text-text font-semibold text-[14px] rounded-control hover:bg-bg active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
        >
          {t('addTag')}
        </button>
      </div>

      {/* Warning / Error Message for 6th Tag */}
      {errorMessage && (
        <p className="text-[13px] text-error-text bg-error-bg px-3 py-1.5 rounded-control" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Tag Chips list */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-tag-bg text-tag-text rounded-full text-[13px] font-semibold shadow-xs"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-tag-text/10 text-tag-text/70 hover:text-tag-text transition-colors cursor-pointer"
                aria-label={`Hapus topik ${tag}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
