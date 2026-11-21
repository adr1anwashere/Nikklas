import { useTranslations } from 'next-intl';
import LanguageSwitch from '@/components/LanguageSwitch';

export default function LandingPage() {
  const t = useTranslations('common');

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-2rem)]">
      {/* Top Header with Language Switch */}
      <header className="flex justify-end pt-2 pb-4">
        <LanguageSwitch />
      </header>

      {/* Hero / Value Proposition */}
      <section className="flex flex-col items-center text-center my-auto space-y-4">
        <h1 className="font-display font-bold text-[56px] text-primary-text leading-none tracking-tight">
          {t('appName')}
        </h1>
        <h2 className="font-display font-bold text-[30px] leading-[1.15] text-text">
          {t('tagline')}
        </h2>
        <p className="text-muted text-[15px] leading-[1.4] max-w-[340px]">
          {t('description')}
        </p>
      </section>

      {/* Guest Action & Friendly Notice */}
      <footer className="flex flex-col items-center space-y-3 pb-6">
        <button
          type="button"
          className="w-full h-12 bg-primary text-on-primary font-semibold text-[15px] rounded-control flex items-center justify-center shadow-sm hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
        >
          {t('continueAsGuest')}
        </button>
        <p className="text-[13px] text-muted text-center leading-relaxed px-4">
          {t('guestNote')}
        </p>
      </footer>
    </div>
  );
}
