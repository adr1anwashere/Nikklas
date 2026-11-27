'use client';

import Icon from '@/components/Icon';
import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser, getUserProfile, saveUserProfile } from '@/lib/auth';
import { profileSchema } from '@/lib/validation/profile';
import TagInput from '@/components/TagInput';
import LanguageSwitch from '@/components/LanguageSwitch';
import Logo from '@/components/Logo';

export default function SetupProfilePage() {
  const t = useTranslations('profile');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');
  const currentLocale = useLocale() as 'id' | 'en';
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [topicTags, setTopicTags] = useState<string[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/');
          return;
        }

        const profile = await getUserProfile(user.id);
        if (profile) {
          setIsEditing(true);
          setNickname(profile.nickname);
          setMajor(profile.major);
          setYear(profile.year);
          setTopicTags(profile.topic_tags || []);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with zod
    const result = profileSchema.safeParse({
      nickname,
      major,
      year: year === '' ? undefined : year,
      topic_tags: topicTags,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        // Map zod error message key to translated string
        fieldErrors[fieldName] = tValidation(issue.message as Parameters<typeof tValidation>[0]);
      });
      setErrors(fieldErrors);
      const firstBad = Object.keys(fieldErrors)[0];
      requestAnimationFrame(() => document.getElementById(firstBad === 'course_id' ? 'course' : firstBad)?.focus());
      return;
    }

    setIsSaving(true);
    try {
      await saveUserProfile({
        nickname: result.data.nickname,
        major: result.data.major,
        year: result.data.year,
        topic_tags: result.data.topic_tags,
        locale: currentLocale,
      });

      router.replace('/feed');
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrors({ form: tCommon('error') });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <p className="text-muted text-[15px] animate-pulse">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-2rem)]">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2 pb-4">
        <Logo className="h-7 w-auto" />
        <LanguageSwitch />
      </header>

      {/* Main Form Body */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-1 mb-6">
          <h1 className="font-display font-normal text-[28px] leading-[1.2] text-text">
            {isEditing ? t('editTitle') : t('title')}
          </h1>
          <p className="text-text-2 text-[16px] leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {errors.form && (
          <div role="alert" className="p-3 mb-4 bg-error-bg text-error-text text-[14px] rounded-control">
            {errors.form}
          </div>
        )}

        <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Nickname Field */}
          <div className="space-y-1.5">
            <label htmlFor="nickname" className="block text-[14px] font-semibold text-text">
              {t('nicknameLabel')}
            </label>
            <input
              id="nickname"
              aria-invalid={errors.nickname ? true : undefined}
              aria-describedby={errors.nickname ? "nickname-error" : undefined}
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (errors.nickname) setErrors((prev) => ({ ...prev, nickname: '' }));
              }}
              placeholder={t('nicknamePlaceholder')}
              autoComplete="nickname"
              maxLength={30}
              className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[16px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                errors.nickname ? 'border-error-text ring-1 ring-error-text' : 'border-edge'
              }`}
            />
            {errors.nickname && (
              <p id="nickname-error" className="text-[14px] text-error-text font-medium">{errors.nickname}</p>
            )}
          </div>

          {/* Major Field */}
          <div className="space-y-1.5">
            <label htmlFor="major" className="block text-[14px] font-semibold text-text">
              {t('majorLabel')}
            </label>
            <input
              id="major"
              aria-invalid={errors.major ? true : undefined}
              aria-describedby={errors.major ? "major-error" : undefined}
              type="text"
              value={major}
              onChange={(e) => {
                setMajor(e.target.value);
                if (errors.major) setErrors((prev) => ({ ...prev, major: '' }));
              }}
              placeholder={t('majorPlaceholder')}
              autoComplete="off"
              maxLength={60}
              className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[16px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                errors.major ? 'border-error-text ring-1 ring-error-text' : 'border-edge'
              }`}
            />
            {errors.major && (
              <p id="major-error" className="text-[14px] text-error-text font-medium">{errors.major}</p>
            )}
          </div>

          {/* Academic Year Field */}
          <div className="space-y-1.5">
            <label htmlFor="year" className="block text-[14px] font-semibold text-text">
              {t('yearLabel')}
            </label>
            <div className="relative">
              <select
                id="year"
              aria-invalid={errors.year ? true : undefined}
              aria-describedby={errors.year ? "year-error" : undefined}
                value={year}
                onChange={(e) => {
                  setYear(e.target.value ? Number(e.target.value) : '');
                  if (errors.year) setErrors((prev) => ({ ...prev, year: '' }));
                }}
                className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                  errors.year ? 'border-error-text ring-1 ring-error-text' : 'border-edge'
                }`}
              >
                <option value="">{t('yearSelectPlaceholder')}</option>
                {[1, 2, 3, 4, 5, 6].map((yr) => (
                  <option key={yr} value={yr}>
                    {t('yearOption', { year: yr })}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">
                <Icon name="chevronDown" className="text-[18px]" />
              </div>
            </div>
            {errors.year && (
              <p id="year-error" className="text-[14px] text-error-text font-medium">{errors.year}</p>
            )}
          </div>

          {/* Topic Tags Field */}
          <TagInput
            tags={topicTags}
            onChange={(newTags) => {
              setTopicTags(newTags);
              if (errors.topic_tags) setErrors((prev) => ({ ...prev, topic_tags: '' }));
            }}
            maxTags={5}
          />
          {errors.topic_tags && (
            <p className="text-[13px] text-error-text font-medium">{errors.topic_tags}</p>
          )}
        </form>
      </div>

      {/* Pinned Bottom Button */}
      <footer className="sticky bottom-0 pt-3 pb-4 safe-bottom bg-bg border-t border-border">
        <button
          type="submit"
          form="profile-form"
          disabled={isSaving}
          className="w-full h-12 bg-primary text-on-primary font-semibold text-[15px] rounded-control flex items-center justify-center disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? t('saving') : t('saveAndContinue')}
        </button>
      </footer>
    </div>
  );
}
