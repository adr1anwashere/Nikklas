'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { fetchCourses, createSession } from '@/lib/sessions';
import { sessionSchema } from '@/lib/validation/session';
import { Course } from '@/types/database';
import TagInput from '@/components/TagInput';
import LanguageSwitch from '@/components/LanguageSwitch';

export default function CreateSessionPage() {
  const t = useTranslations('session');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  // Form Fields
  const [courseId, setCourseId] = useState('');
  const [section, setSection] = useState('K01');
  const [examPeriod, setExamPeriod] = useState<'quiz' | 'uts' | 'uas'>('uts');
  const [startsAt, setStartsAt] = useState('');
  const [maxSize, setMaxSize] = useState<number>(4);
  const [topicTags, setTopicTags] = useState<string[]>([]);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function init() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/');
          return;
        }

        const profile = await getUserProfile(user.id);
        if (!profile) {
          router.replace('/setup');
          return;
        }

        // Preload courses
        const courseList = await fetchCourses();
        setCourses(courseList);
        if (courseList.length > 0) {
          setCourseId(courseList[0].id);
        }

        // Set default starts_at to tomorrow at 14:00
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0);
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        const localISO = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setStartsAt(localISO);
      } catch (err) {
        console.error('Error initializing create session form:', err);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = sessionSchema.safeParse({
      course_id: courseId,
      section,
      exam_period: examPeriod,
      topic_tags: topicTags,
      starts_at: startsAt,
      max_size: maxSize,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = tValidation(issue.message as any);
      });
      setErrors(fieldErrors);
      return;
    }

    setIsPosting(true);
    try {
      await createSession({
        course_id: result.data.course_id,
        section: result.data.section,
        exam_period: result.data.exam_period,
        topic_tags: result.data.topic_tags,
        starts_at: result.data.starts_at,
        max_size: result.data.max_size,
      });

      router.replace('/feed');
    } catch (err: any) {
      console.error('Failed to post session:', err);
      setErrors({ form: err.message || tCommon('error') });
      setIsPosting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <p className="text-muted text-[15px] animate-pulse">{tCommon('loading')}</p>
      </div>
    );
  }

  // Calculate minimum datetime allowed for HTML picker (now + 1 minute)
  const minDateTime = new Date(Date.now() + 60000 - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-2rem)]">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[14px] font-semibold text-primary-text hover:underline flex items-center gap-1 cursor-pointer"
        >
          &larr; {tCommon('back')}
        </button>
        <LanguageSwitch />
      </header>

      {/* Main Form Body */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-1 mb-6">
          <h1 className="font-display font-bold text-[28px] leading-[1.2] text-text">
            {t('createTitle')}
          </h1>
          <p className="text-muted text-[14px] leading-relaxed">
            {t('createSubtitle')}
          </p>
        </div>

        {errors.form && (
          <div className="p-3 mb-4 bg-error-bg text-error-text text-[13px] rounded-control">
            {errors.form}
          </div>
        )}

        <form id="create-session-form" onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Course Select */}
          <div className="space-y-1.5">
            <label htmlFor="course" className="block text-[13px] font-semibold text-text">
              {t('courseLabel')}
            </label>
            <div className="relative">
              <select
                id="course"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  if (errors.course_id) setErrors((prev) => ({ ...prev, course_id: '' }));
                }}
                className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                  errors.course_id ? 'border-error-text ring-1 ring-error-text' : 'border-border'
                }`}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} &mdash; {course.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">
                ▼
              </div>
            </div>
            {errors.course_id && (
              <p className="text-[12px] text-error-text font-medium">{errors.course_id}</p>
            )}
          </div>

          {/* 2. Section Input */}
          <div className="space-y-1.5">
            <label htmlFor="section" className="block text-[13px] font-semibold text-text">
              {t('sectionLabel')}
            </label>
            <input
              id="section"
              type="text"
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                if (errors.section) setErrors((prev) => ({ ...prev, section: '' }));
              }}
              placeholder={t('sectionPlaceholder')}
              className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[15px] placeholder:text-muted/60 uppercase focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                errors.section ? 'border-error-text ring-1 ring-error-text' : 'border-border'
              }`}
            />
            {errors.section && (
              <p className="text-[12px] text-error-text font-medium">{errors.section}</p>
            )}
          </div>

          {/* 3. Exam Period Select */}
          <div className="space-y-1.5">
            <label htmlFor="exam_period" className="block text-[13px] font-semibold text-text">
              {t('examPeriodLabel')}
            </label>
            <div className="relative">
              <select
                id="exam_period"
                value={examPeriod}
                onChange={(e) => {
                  setExamPeriod(e.target.value as 'quiz' | 'uts' | 'uas');
                  if (errors.exam_period) setErrors((prev) => ({ ...prev, exam_period: '' }));
                }}
                className="w-full h-12 px-4 rounded-control border border-border bg-surface text-text text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary-text transition-all"
              >
                <option value="quiz">{t('examPeriodQuiz')}</option>
                <option value="uts">{t('examPeriodUts')}</option>
                <option value="uas">{t('examPeriodUas')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">
                ▼
              </div>
            </div>
          </div>

          {/* 4. Start Date & Time */}
          <div className="space-y-1.5">
            <label htmlFor="starts_at" className="block text-[13px] font-semibold text-text">
              {t('dateTimeLabel')}
            </label>
            <input
              id="starts_at"
              type="datetime-local"
              min={minDateTime}
              value={startsAt}
              onChange={(e) => {
                setStartsAt(e.target.value);
                if (errors.starts_at) setErrors((prev) => ({ ...prev, starts_at: '' }));
              }}
              className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[15px] focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                errors.starts_at ? 'border-error-text ring-1 ring-error-text' : 'border-border'
              }`}
            />
            <p className="text-[11px] text-muted">{t('dateTimeHint')}</p>
            {errors.starts_at && (
              <p className="text-[12px] text-error-text font-medium">{errors.starts_at}</p>
            )}
          </div>

          {/* 5. Max Group Size */}
          <div className="space-y-1.5">
            <label htmlFor="max_size" className="block text-[13px] font-semibold text-text">
              {t('groupSizeLabel')}
            </label>
            <div className="relative">
              <select
                id="max_size"
                value={maxSize}
                onChange={(e) => {
                  setMaxSize(Number(e.target.value));
                  if (errors.max_size) setErrors((prev) => ({ ...prev, max_size: '' }));
                }}
                className="w-full h-12 px-4 rounded-control border border-border bg-surface text-text text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary-text transition-all"
              >
                {[2, 3, 4, 5, 6, 7, 8].map((size) => (
                  <option key={size} value={size}>
                    {t('groupSizeOption', { size })}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">
                ▼
              </div>
            </div>
            {errors.max_size && (
              <p className="text-[12px] text-error-text font-medium">{errors.max_size}</p>
            )}
          </div>

          {/* 6. Topic Tags */}
          <TagInput
            tags={topicTags}
            onChange={(newTags) => {
              setTopicTags(newTags);
              if (errors.topic_tags) setErrors((prev) => ({ ...prev, topic_tags: '' }));
            }}
            maxTags={5}
          />
          {errors.topic_tags && (
            <p className="text-[12px] text-error-text font-medium">{errors.topic_tags}</p>
          )}
        </form>
      </div>

      {/* Pinned Bottom Button */}
      <footer className="pt-3 pb-4 bg-bg border-t border-border/50">
        <button
          type="submit"
          form="create-session-form"
          disabled={isPosting}
          className="w-full h-12 bg-primary text-on-primary font-semibold text-[15px] rounded-control flex items-center justify-center shadow-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
        >
          {isPosting ? t('posting') : t('postButton')}
        </button>
      </footer>
    </div>
  );
}
