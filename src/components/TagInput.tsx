'use client';

import Icon from '@/components/Icon';
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
        <label htmlFor="tag-input" className="text-[14px] font-semibold text-text">
          {t('tagsLabel')}
        </label>
        <span
          className={`text-[13px] font-semibold ${
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
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage ? 'tag-error' : undefined}
          enterKeyHint="done"
          placeholder={t('tagsPlaceholder')}
          disabled={tags.length >= maxTags}
          className="flex-1 h-12 px-4 rounded-control border border-edge bg-surface text-text text-[16px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-text disabled:opacity-50 transition-all"
        />
        <button
          type="button"
          onClick={handleAddTag}
          disabled={tags.length >= maxTags || !inputValue.trim()}
          className="h-12 px-5 bg-surface border border-edge text-text font-semibold text-[15px] rounded-control disabled:opacity-50 cursor-pointer"
        >
          {t('addTag')}
        </button>
      </div>

      {/* Warning / Error Message for 6th Tag */}
      {errorMessage && (
        <p id="tag-error" className="text-[14px] text-error-text bg-error-bg px-3 py-2 rounded-control" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Tag Chips list */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 h-9 pl-3.5 pr-2 bg-sand text-text-2 rounded-full text-[14px] font-semibold"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="w-7 h-7 -mr-1.5 rounded-full flex items-center justify-center hover:bg-border text-text-2 cursor-pointer"
                aria-label={t('removeTag', { tag })}
              >
                <Icon name="x" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
