'use client';

import Icon from '@/components/Icon';
import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser, getUserProfile, saveUserProfile } from '@/lib/auth';
import { profileSchema } from '@/lib/validation/profile';
import TagInput from '@/components/TagInput';
import LanguageSwitch from '@/components/LanguageSwitch';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

export default function SetupProfilePage() {
  const t = useTranslations('profile');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');
  const tLanding = useTranslations('landing');
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
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

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

  const handleSubmit = async () => {
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
      setStep(['nickname', 'major', 'year', 'topic_tags'].indexOf(Object.keys(fieldErrors)[0]));
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

  const STEPS = ['nickname', 'major', 'year', 'topic_tags'] as const;
  const field = STEPS[step];
  const values = { nickname, major, year: year === '' ? undefined : year, topic_tags: topicTags };

  // validate only the field on this page, then slide to the next one
  const goNext = () => {
    const r = profileSchema.shape[field].safeParse(values[field]);
    if (!r.success) {
      setErrors({ [field]: tValidation(r.error.issues[0].message as Parameters<typeof tValidation>[0]) });
      requestAnimationFrame(() => document.getElementById(field)?.focus());
      return;
    }
    setErrors({});
    if (step < STEPS.length - 1) { setDir(1); setStep(step + 1); }
    else handleSubmit();
  };
  const goBack = () => { setErrors({}); setDir(-1); setStep(step - 1); };

  const inputClass = (bad: boolean) =>
    `w-full bg-transparent border-0 border-b-2 rounded-none px-0 h-16 font-display text-[32px] md:text-[40px] text-text placeholder:text-muted/60 focus:outline-none focus:ring-0 !shadow-none bare-input ${bad ? 'border-error-text' : 'border-edge focus:border-primary'}`;

  const titles = [t('nicknameLabel'), t('majorLabel'), t('yearLabel'), t('tagsLabel')];

  return (
    <div data-wide className="flex flex-col min-h-[calc(100vh-2rem)]">
      <header className="flex items-center justify-between pt-2 pb-4">
        <Logo className="h-7 w-auto" />
        <div className="flex items-center gap-2"><ThemeToggle /><LanguageSwitch /></div>
      </header>

      {/* progress: a large step count and a thin track, no second logo mark */}
      <div className="flex items-end gap-4 mb-10 md:mb-14" aria-label={t('stepOf', { step: step + 1, total: STEPS.length })}>
        <p className="font-display text-[44px] leading-none text-text tabular-nums" aria-hidden="true">
          <span key={step} className="step-num inline-block">{String(step + 1).padStart(2, '0')}</span>
          <span className="text-muted/60 text-[22px]"> / {String(STEPS.length).padStart(2, '0')}</span>
        </p>
        <div className="flex-1 flex gap-1.5 pb-2" aria-hidden="true">
          {STEPS.map((_, i) => <span key={i} className={`step-track ${i <= step ? 'is-on' : ''}`} />)}
        </div>
      </div>

      {errors.form && <div role="alert" className="p-3 mb-4 bg-error-bg text-error-text text-[14px] rounded-control">{errors.form}</div>}

      <div className="flex-1 grid md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_380px] gap-10 lg:gap-20 items-start">
      <form onSubmit={(e) => { e.preventDefault(); goNext(); }} className="flex flex-col md:min-h-[440px] h-full">
        <div key={step} className={`flex-1 ${dir > 0 ? 'step-in-next' : 'step-in-back'}`}>
          {step === 0 && <p className="text-text-2 text-[15px] mb-6">{isEditing ? t('editTitle') : t('subtitle')}</p>}
          <label htmlFor={field} id="step-label" className="block font-display font-normal text-[34px] md:text-[44px] leading-[1.1] text-text mb-8">
            {titles[step]}
          </label>

          {field === 'nickname' && (
            <input id="nickname" autoFocus type="text" value={nickname} maxLength={30} autoComplete="nickname"
              aria-invalid={errors.nickname ? true : undefined} aria-describedby={errors.nickname ? 'step-error' : undefined}
              onChange={(e) => { setNickname(e.target.value); setErrors({}); }}
              placeholder={t('nicknamePlaceholder')} className={inputClass(!!errors.nickname)} />
          )}
          {field === 'major' && (
            <input id="major" autoFocus type="text" value={major} maxLength={60} autoComplete="off"
              aria-invalid={errors.major ? true : undefined} aria-describedby={errors.major ? 'step-error' : undefined}
              onChange={(e) => { setMajor(e.target.value); setErrors({}); }}
              placeholder={t('majorPlaceholder')} className={inputClass(!!errors.major)} />
          )}
          {field === 'year' && (
            <div id="year" tabIndex={-1} role="radiogroup" aria-labelledby="step-label" aria-describedby={errors.year ? 'step-error' : undefined}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((yr, i) => (
                <button key={yr} type="button" role="radio" aria-checked={year === yr}
                  onClick={() => { setYear(yr); setErrors({}); }}
                  style={{ animationDelay: `${60 + i * 40}ms` }}
                  className={`year-tile tile-in relative h-28 md:h-32 rounded-[24px] border text-left px-5 pt-4 cursor-pointer overflow-hidden ${year === yr ? 'is-on bg-primary text-on-primary border-primary' : 'bg-surface text-text border-border hover:border-edge'}`}>
                  <span className={`block text-[13px] font-semibold ${year === yr ? 'text-on-primary/80' : 'text-muted'}`}>{t('yearShort')}</span>
                  <span className="year-num block font-display text-[56px] md:text-[64px] leading-none mt-1">{yr}</span>
                  <span className="sr-only">{t('yearOption', { year: yr })}</span>
                </button>
              ))}
            </div>
          )}
          {field === 'topic_tags' && (
            <div id="topic_tags" tabIndex={-1}>
              <TagInput tags={topicTags} onChange={(n) => { setTopicTags(n); setErrors({}); }} maxTags={5} />
            </div>
          )}

          {errors[field] && <p id="step-error" role="alert" className="mt-4 text-[14px] text-error-text font-medium">{errors[field]}</p>}
        </div>

        <footer className="sticky bottom-0 pt-4 pb-4 safe-bottom bg-bg flex gap-3">
          {step > 0 && (
            <button type="button" onClick={goBack}
              className="h-14 px-5 rounded-control border border-edge bg-surface text-text font-semibold text-[15px] flex items-center gap-2 cursor-pointer">
              <Icon name="arrowLeft" /> {tCommon('back')}
            </button>
          )}
          <button type="submit" disabled={isSaving}
            className="flex-1 h-14 bg-primary text-on-primary font-semibold text-[16px] rounded-control flex items-center justify-center disabled:opacity-60 cursor-pointer">
            {isSaving ? t('saving') : step === STEPS.length - 1 ? t('saveAndContinue') : t('next')}
          </button>
        </footer>
      </form>

      {/* live preview: exactly what members of a session will see */}
      <aside aria-label={tLanding('shown')} className="hidden md:block md:sticky md:top-8">
        <p className="text-[13px] font-semibold text-muted mb-3">{tLanding('shown')}</p>
        <div className="preview-card bg-surface border border-border rounded-[28px] p-6">
          <div className="flex items-center gap-4">
            <span key={nickname.trim().charAt(0)} className="preview-avatar w-14 h-14 rounded-[18px] bg-primary text-on-primary font-display text-[26px] flex items-center justify-center shrink-0">
              {nickname.trim().charAt(0).toUpperCase() || '?'}
            </span>
            <div className="min-w-0">
              <p className={`font-display text-[26px] leading-tight truncate ${nickname.trim() ? 'text-text' : 'text-muted/60'}`}>{nickname.trim() || t('nicknameLabel')}</p>
              <p className={`text-[15px] truncate ${major.trim() ? 'text-text-2' : 'text-muted/60'}`}>
                {major.trim() || t('majorLabel')}{year !== '' && <> · {t('yearOption', { year })}</>}
              </p>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-border flex flex-wrap gap-1.5 min-h-[34px]">
            {topicTags.length ? topicTags.map((tag) => (
              <span key={tag} className="chip-in px-3 py-1 bg-sand text-text-2 rounded-full text-[13px] font-semibold">#{tag}</span>
            )) : <span className="text-[14px] text-muted/60">{t('tagsLabel')}</span>}
          </div>
          <div className="mt-5 flex items-center gap-2 text-[13px] text-muted">
            <Icon name="lock" /> {tLanding('privacyText').split('.')[1]?.trim()}
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}
