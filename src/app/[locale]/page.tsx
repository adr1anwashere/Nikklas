'use client';
// Entry page, built to the taste-skill rules: the h1 names the category and the buyer, one hard fact
// on the first screen, the real product UI in the hero, one section per screen, one main action.
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import LanguageSwitch from '@/components/LanguageSwitch';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';
import SessionCard from '@/components/SessionCard';
import { signInAsGuest, getCurrentUser, getUserProfile } from '@/lib/auth';
import { SessionFeedItem } from '@/types/database';

// Sample sessions for the product frame (marked "Sample data" in the frame bar).
const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();
const sample = (id: string, code: string, name: string, section: string, exam_period: 'quiz' | 'uts' | 'uas', topic_tags: string[], current_size: number, max_size: number, days: number): SessionFeedItem => ({
  id, host_id: 'sample', course_id: id, section, exam_period, topic_tags, starts_at: inDays(days), max_size,
  status: current_size >= max_size ? 'full' : 'open', created_at: inDays(0), filled_at: null,
  course_code: code, course_name: name, course_campus: '', current_size,
});
const SAMPLES = [
  sample('s1', 'MK101', 'Kalkulus', 'K01', 'uts', ['integral', 'limit'], 3, 4, 1),
  sample('s2', 'MK103', 'Pengantar Pemrograman', 'K02', 'quiz', ['python'], 2, 6, 2),
  sample('s3', 'MK102', 'Fisika Dasar', 'K01', 'uas', ['mekanika'], 5, 5, 3),
  sample('s4', 'MK104', 'Kimia Dasar', 'K03', 'uts', ['stoikiometri'], 1, 3, 4),
];

export default function LandingPage() {
  const t = useTranslations('landing');
  const tCommon = useTranslations('common');
  const tProfile = useTranslations('profile');
  const tFeed = useTranslations('feed');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        // only a finished profile skips the landing; a half-made guest still sees it
        if (user && (await getUserProfile(user.id))) {
          router.replace('/feed');
          return;
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
      setCheckingAuth(false);
    })();
  }, [router]);

  const start = async () => {
    setIsLoading(true);
    setFailed(false);
    try {
      const { user } = await signInAsGuest();
      router.push((await getUserProfile(user.id)) ? '/feed' : '/setup');
    } catch (err) {
      console.error('Guest entry failed:', err);
      setFailed(true);
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <p className="text-muted text-[15px] animate-pulse">{tCommon('loading')}</p>
      </div>
    );
  }

  const cta = (
    <button type="button" onClick={start} disabled={isLoading}
      className="h-14 px-7 w-full sm:w-auto bg-primary text-on-primary font-semibold text-[16px] rounded-control inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
      {isLoading ? tCommon('enteringAsGuest') : t('cta')}
    </button>
  );

  const steps = [
    { title: t('step1'), text: t('step1Text') },
    { title: t('step2'), text: t('step2Text') },
    { title: t('step3'), text: t('step3Text') },
  ];

  return (
    <div data-wide className="landing">
      <header className="relative z-20 flex items-center justify-between h-16 md:h-20">
        <Logo className="h-7 md:h-8 w-auto" title={tCommon('appName')} />
        <div className="flex items-center gap-2"><ThemeToggle /><LanguageSwitch /></div>
      </header>

      {/* 1. Hero: category, buyer, one hard fact, the real feed */}
      <section className="hero-enter min-h-[calc(100svh-5rem)] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-10 lg:gap-16 items-center py-6 lg:py-0">
        <div>
          <h1 className="font-display font-normal text-[40px] sm:text-[52px] lg:text-[64px] leading-[1.02] tracking-tight text-text text-balance">
            {t('h1')}
          </h1>
          <p className="mt-6 text-text-2 text-[17px] md:text-[19px] leading-[1.55] max-w-[34rem]">{t('lead')}</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            {cta}
            <p className="text-[14px] text-muted max-w-[18rem]">{t('ctaNote')}</p>
          </div>
          {failed && <p role="alert" className="mt-4 px-4 py-3 rounded-control bg-error-bg text-error-text text-[14px]">{tCommon('error')}</p>}
        </div>

        <div className="relative isolate">
        <div className="seat-motif hidden lg:grid" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="app-frame bg-surface border border-border rounded-[28px] overflow-hidden">
          <div className="flex items-center justify-between px-5 h-11 border-b border-border bg-sand/60">
            <span className="text-[13px] font-semibold text-text">{tFeed('title')}</span>
            <span className="text-[13px] text-muted">{t('sample')}</span>
          </div>
          <div inert aria-hidden="true" className="p-4 md:p-5 grid sm:grid-cols-2 gap-3 max-h-[520px] overflow-hidden frame-fade">
            {SAMPLES.map((s) => <SessionCard key={s.id} session={s} />)}
          </div>
        </div>
        </div>
      </section>

      {/* 2. How it works: the real order of a session, as a ruled list */}
      <section aria-labelledby="how" className="py-20 md:py-32">
        <h2 id="how" className="font-display font-normal text-[32px] md:text-[44px] leading-[1.1] text-text max-w-[20ch]">{t('howTitle')}</h2>
        <ol className="mt-10 md:mt-14 border-t border-border">
          {steps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[3rem_minmax(0,1fr)] md:grid-cols-[6rem_minmax(0,22rem)_minmax(0,1fr)] gap-x-6 gap-y-2 py-7 md:py-9 border-b border-border">
              <span className="font-display text-[28px] md:text-[40px] leading-none text-primary-text tabular-nums" aria-hidden="true">{i + 1}</span>
              <h3 className="font-display font-normal text-[22px] md:text-[28px] leading-tight text-text">{s.title}</h3>
              <p className="col-start-2 md:col-start-3 text-[16px] md:text-[17px] leading-[1.6] text-text-2 max-w-[36rem]">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Privacy, type-led */}
      <section aria-labelledby="privacy" className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-10 lg:gap-20 items-end py-16 md:py-24">
        <div>
          <h2 id="privacy" className="font-display font-normal text-[32px] md:text-[44px] leading-[1.1] text-text">{t('privacyTitle')}</h2>
          <p className="mt-5 text-[17px] leading-[1.6] text-text-2 max-w-[32rem]">{t('privacyText')}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-card p-6">
            <p className="text-[14px] font-semibold text-success-text">{t('shown')}</p>
            <ul className="mt-5 space-y-3 text-[18px] text-text">
              {[tProfile('nicknameLabel'), tProfile('majorLabel'), tProfile('yearLabel')].map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div className="bg-sand rounded-card p-6">
            <p className="text-[14px] font-semibold text-muted">{t('never')}</p>
            <ul className="mt-5 space-y-3 text-[18px] text-muted">
              {[t('phone'), t('email'), t('studentId')].map((x) => <li key={x} className="line-through decoration-2">{x}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Close */}
      <section aria-labelledby="close" className="flex flex-col items-start justify-center pt-24 pb-20 md:pt-40 md:pb-32">
        <h2 id="close" className="font-display font-normal text-[40px] md:text-[64px] leading-[1.02] tracking-tight text-text max-w-[16ch] text-balance">{t('closeTitle')}</h2>
        <div className="mt-10 w-full sm:w-auto">{cta}</div>
      </section>

      <footer className="py-8 border-t border-border text-[14px] text-muted">{t('footer')}</footer>
    </div>
  );
}
