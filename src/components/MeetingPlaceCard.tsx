'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MeetingPlaceWithAuthor, upsertMeetingPlace } from '@/lib/meeting-place';
import { meetingPlaceSchema } from '@/lib/validation/meeting-place';

interface MeetingPlaceCardProps {
  sessionId: string;
  meetingPlace: MeetingPlaceWithAuthor | null;
  onUpdated: (updated: MeetingPlaceWithAuthor) => void;
}

export default function MeetingPlaceCard({
  sessionId,
  meetingPlace,
  onUpdated,
}: MeetingPlaceCardProps) {
  const t = useTranslations('meetingPlace');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState(meetingPlace?.description || '');
  const [mapUrl, setMapUrl] = useState(meetingPlace?.map_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenModal = () => {
    setDescription(meetingPlace?.description || '');
    setMapUrl(meetingPlace?.map_url || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = meetingPlaceSchema.safeParse({
      description,
      map_url: mapUrl.trim() ? mapUrl.trim() : undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = tValidation(issue.message as any);
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await upsertMeetingPlace(
        sessionId,
        result.data.description,
        result.data.map_url
      );
      onUpdated(updated);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error updating meeting place:', err);
      setErrors({ form: err.message || tCommon('error') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-card p-4 shadow-card space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-[16px] text-text flex items-center gap-1.5">
          <span>📍</span>
          <span>{t('title')}</span>
        </h3>
        <button
          type="button"
          onClick={handleOpenModal}
          className="px-3 py-1 bg-bg border border-border text-[12px] font-semibold text-text rounded-control hover:bg-surface active:scale-95 transition-all cursor-pointer"
        >
          {meetingPlace ? t('editPlace') : t('suggestPlace')}
        </button>
      </div>

      {/* Content */}
      {meetingPlace ? (
        <div className="space-y-2 text-[14px]">
          <p className="text-text font-medium leading-relaxed">
            {meetingPlace.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-[12px] text-muted">
            {/* Map Link Chip */}
            {meetingPlace.map_url && (
              <a
                href={meetingPlace.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary-text font-semibold rounded-full hover:bg-primary/30 transition-colors shadow-2xs"
              >
                <span>🗺️</span>
                <span>{t('openMap')}</span>
                <span className="text-[10px]">&nearr;</span>
              </a>
            )}

            {/* Author info */}
            {meetingPlace.author_nickname && (
              <span className="text-muted/80">
                {t('updatedBy', { name: meetingPlace.author_nickname })}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-3 bg-bg/50 border border-border/60 rounded-control flex items-center justify-between">
          <p className="text-[13px] text-muted font-medium">
            {t('notSet')}
          </p>
          <button
            type="button"
            onClick={handleOpenModal}
            className="text-[12px] font-semibold text-primary-text hover:underline cursor-pointer"
          >
            + {t('suggestPlace')}
          </button>
        </div>
      )}

      {/* Modal / Bottom Sheet Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div
            className="w-full max-w-[480px] bg-surface rounded-t-[28px] border-t border-border p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h4 className="font-display font-bold text-[18px] text-text">
                📍 {t('title')}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-text hover:bg-border transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {errors.form && (
              <p className="p-2.5 bg-error-bg text-error-text text-[12px] rounded-control">
                {errors.form}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="mp-desc" className="block text-[13px] font-semibold text-text">
                  {t('descLabel')}
                </label>
                <textarea
                  id="mp-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  placeholder={t('descPlaceholder')}
                  className={`w-full p-3 rounded-control border bg-surface text-text text-[14px] placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                    errors.description ? 'border-error-text ring-1 ring-error-text' : 'border-border'
                  }`}
                />
                {errors.description && (
                  <p className="text-[12px] text-error-text font-medium">{errors.description}</p>
                )}
              </div>

              {/* Map Link */}
              <div className="space-y-1.5">
                <label htmlFor="mp-map" className="block text-[13px] font-semibold text-text">
                  {t('mapLabel')}
                </label>
                <input
                  id="mp-map"
                  type="url"
                  value={mapUrl}
                  onChange={(e) => {
                    setMapUrl(e.target.value);
                    if (errors.map_url) setErrors((prev) => ({ ...prev, map_url: '' }));
                  }}
                  placeholder={t('mapPlaceholder')}
                  className={`w-full h-11 px-4 rounded-control border bg-surface text-text text-[14px] placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                    errors.map_url ? 'border-error-text ring-1 ring-error-text' : 'border-border'
                  }`}
                />
                <p className="text-[11px] text-muted">{t('mapHint')}</p>
                {errors.map_url && (
                  <p className="text-[12px] text-error-text font-medium">{errors.map_url}</p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 rounded-control border border-border bg-surface text-text font-semibold text-[14px] hover:bg-bg active:scale-95 transition-all cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-11 rounded-control bg-primary text-on-primary font-semibold text-[14px] shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center"
                >
                  {isSaving ? t('saving') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
