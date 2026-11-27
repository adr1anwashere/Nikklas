'use client';

import Icon from '@/components/Icon';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { fetchCourses, createSession } from '@/lib/sessions';
import { sessionSchema } from '@/lib/validation/session';
import { Course } from '@/types/database';
import TagInput from '@/components/TagInput';
import BackButton from '@/components/BackButton';

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
  const [minDateTime, setMinDateTime] = useState('');

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
        // Earliest start the picker allows: now + 1 minute, in local time
        const soon = new Date(Date.now() + 60000);
        setMinDateTime(new Date(soon.getTime() - soon.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
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
        fieldErrors[fieldName] = tValidation(issue.message as Parameters<typeof tValidation>[0]);
      });
      setErrors(fieldErrors);
      const firstBad = Object.keys(fieldErrors)[0];
      requestAnimationFrame(() => document.getElementById(firstBad === 'course_id' ? 'course' : firstBad)?.focus());
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
    } catch (err) {
      console.error('Failed to post session:', err);
      setErrors({ form: tCommon('error') });
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


  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-2rem)]">
      {/* Top Header */}
      <header className="flex items-center pt-1 pb-3">
        <BackButton label={tCommon('back')} onClick={() => router.back()} />
      </header>

      {/* Main Form Body */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="space-y-1 mb-6">
          <h1 className="font-display font-normal text-[28px] leading-[1.2] text-text">
            {t('createTitle')}
          </h1>
          <p className="text-text-2 text-[16px] leading-relaxed">
            {t('createSubtitle')}
          </p>
        </div>

        {errors.form && (
          <div role="alert" className="p-3 mb-4 bg-error-bg text-error-text text-[14px] rounded-control">
            {errors.form}
          </div>
        )}

        <form id="create-session-form" onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Course Select */}
          <div className="space-y-1.5">
            <label htmlFor="course" className="block text-[14px] font-semibold text-text">
              {t('courseLabel')}
            </label>
            <div className="relative">
              <select
                id="course"
              aria-invalid={errors.course_id ? true : undefined}
              aria-describedby={errors.course_id ? "course-error" : undefined}
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  if (errors.course_id) setErrors((prev) => ({ ...prev, course_id: '' }));
                }}
                className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                  errors.course_id ? 'border-error-text ring-1 ring-error-text' : 'border-edge'
                }`}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} &mdash; {course.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted">
                <Icon name="chevronDown" className="text-[18px]" />
              </div>
            </div>
            {errors.course_id && (
              <p id="course-error" className="text-[14px] text-error-text font-medium">{errors.course_id}</p>
            )}
          </div>

          {/* 2. Section Input */}
          <div className="space-y-1.5">
            <label htmlFor="section" className="block text-[14px] font-semibold text-text">
              {t('sectionLabel')}
            </label>
            <input
              id="section"
              aria-invalid={errors.section ? true : undefined}
              aria-describedby={errors.section ? "section-error" : undefined}
              type="text"
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                if (errors.section) setErrors((prev) => ({ ...prev, section: '' }));
              }}
              placeholder={t('sectionPlaceholder')}
              autoCapitalize="characters"
              autoComplete="off"
              className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[16px] placeholder:text-muted placeholder:normal-case uppercase focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                errors.section ? 'border-error-text ring-1 ring-error-text' : 'border-edge'
              }`}
            />
            {errors.section && (
              <p id="section-error" className="text-[14px] text-error-text font-medium">{errors.section}</p>
            )}
          </div>

          {/* 3. Exam Period: three options, so a segmented control instead of a dropdown */}
          <fieldset>
            <legend className="block text-[14px] font-semibold text-text mb-1.5">{t('examPeriodLabel')}</legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {(['quiz', 'uts', 'uas'] as const).map((p) => {
                const label = { quiz: t('examPeriodQuiz'), uts: t('examPeriodUts'), uas: t('examPeriodUas') }[p];
                const on = examPeriod === p;
                return (
                  <label key={p} className={`h-12 rounded-control border flex items-center justify-center text-[15px] font-semibold cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary has-[:focus-visible]:outline-offset-2 ${on ? 'bg-peach text-on-peach border-peach' : 'bg-surface text-text border-edge'}`}>
                    <input type="radio" name="exam_period" value={p} checked={on} onChange={() => setExamPeriod(p)} className="sr-only" />
                    {label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 4. Start Date & Time */}
          <div className="space-y-1.5">
            <label htmlFor="starts_at" className="block text-[14px] font-semibold text-text">
              {t('dateTimeLabel')}
            </label>
            <input
              id="starts_at"
              aria-invalid={errors.starts_at ? true : undefined}
              aria-describedby={errors.starts_at ? "starts_at-hint starts_at-error" : "starts_at-hint"}
              type="datetime-local"
              min={minDateTime}
              value={startsAt}
              onChange={(e) => {
                setStartsAt(e.target.value);
                if (errors.starts_at) setErrors((prev) => ({ ...prev, starts_at: '' }));
              }}
              className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[15px] focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                errors.starts_at ? 'border-error-text ring-1 ring-error-text' : 'border-edge'
              }`}
            />
            <p id="starts_at-hint" className="text-[14px] text-muted">{t('dateTimeHint')}</p>
            {errors.starts_at && (
              <p id="starts_at-error" className="text-[14px] text-error-text font-medium">{errors.starts_at}</p>
            )}
          </div>

          {/* 5. Max Group Size: a stepper, 2 to 8 */}
          <div className="space-y-1.5">
            <span id="max_size-label" className="block text-[14px] font-semibold text-text">{t('groupSizeLabel')}</span>
            <div className="flex items-center gap-3" role="group" aria-labelledby="max_size-label">
              <button type="button" onClick={() => setMaxSize((n) => Math.max(2, n - 1))} disabled={maxSize <= 2} aria-label={t('decrease')}
                className="w-12 h-12 rounded-control border border-edge bg-surface text-text flex items-center justify-center disabled:opacity-40 cursor-pointer">
                <Icon name="minus" className="text-[18px]" />
              </button>
              <output id="max_size" aria-live="polite" className="flex-1 h-12 rounded-control bg-sand flex items-center justify-center gap-1.5 text-[17px] font-semibold text-text">
                <span className="font-display text-[22px]">{maxSize}</span> {t('people')}
              </output>
              <button type="button" onClick={() => setMaxSize((n) => Math.min(8, n + 1))} disabled={maxSize >= 8} aria-label={t('increase')}
                className="w-12 h-12 rounded-control border border-edge bg-surface text-text flex items-center justify-center disabled:opacity-40 cursor-pointer">
                <Icon name="plus" className="text-[18px]" />
              </button>
            </div>
            {errors.max_size && (
              <p id="max_size-error" className="text-[14px] text-error-text font-medium">{errors.max_size}</p>
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
            <p className="text-[13px] text-error-text font-medium">{errors.topic_tags}</p>
          )}
        </form>
      </div>

      {/* Pinned Bottom Button */}
      <footer className="sticky bottom-0 pt-3 pb-4 safe-bottom bg-bg border-t border-border">
        <button
          type="submit"
          form="create-session-form"
          disabled={isPosting}
          className="w-full h-12 bg-primary text-on-primary font-semibold text-[15px] rounded-control flex items-center justify-center disabled:opacity-60 cursor-pointer"
        >
          {isPosting ? t('posting') : t('postButton')}
        </button>
      </footer>
    </div>
  );
}
