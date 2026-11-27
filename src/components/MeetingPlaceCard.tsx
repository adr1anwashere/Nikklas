'use client';

import Icon from '@/components/Icon';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MeetingPlaceWithAuthor, upsertMeetingPlace } from '@/lib/meeting-place';
import { meetingPlaceSchema } from '@/lib/validation/meeting-place';
import { useSheet } from '@/components/useSheet';

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
  const sheetRef = useSheet(isModalOpen, () => setIsModalOpen(false));

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
        fieldErrors[field] = tValidation(issue.message as Parameters<typeof tValidation>[0]);
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
    } catch (err) {
      console.error('Error updating meeting place:', err);
      setErrors({ form: t('saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-card p-4 shadow-card space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-[17px] text-text flex items-center gap-2">
          <Icon name="pin" />
          <span>{t('title')}</span>
        </h2>
        <button
          type="button"
          onClick={handleOpenModal}
          className="h-11 px-4 bg-surface border border-edge text-[14px] font-semibold text-text rounded-control cursor-pointer"
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

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-[13px] text-muted">
            {/* Map Link Chip */}
            {meetingPlace.map_url && (
              <a
                href={meetingPlace.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-11 px-4 bg-sand text-primary-text font-semibold text-[14px] rounded-full hover:bg-border"
              >
                <Icon name="map" />
                <span>{t('openMap')}</span>
                <Icon name="external" className="text-[14px]" />
              </a>
            )}

            {/* Author info */}
            {meetingPlace.author_nickname && (
              <span className="text-muted">
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
            className="h-11 px-3 -mr-2 inline-flex items-center gap-1.5 rounded-control text-[14px] font-semibold text-primary-text hover:bg-sand cursor-pointer"
          >
            <Icon name="plus" /> {t('suggestPlace')}
          </button>
        </div>
      )}

      {/* Modal / Bottom Sheet Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div
            ref={sheetRef}
            className="w-full max-w-[480px] bg-surface rounded-t-[28px] border-t border-border p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-4 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mp-title"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h2 id="mp-title" className="font-display font-semibold text-[20px] text-text flex items-center gap-2">
                <Icon name="pin" /> {t('title')}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label={tCommon('close')}
                className="w-11 h-11 rounded-full bg-sand flex items-center justify-center text-text hover:bg-border cursor-pointer"
              >
                <Icon name="x" className="text-[18px]" />
              </button>
            </div>

            {errors.form && (
              <p role="alert" className="p-3 bg-error-bg text-error-text text-[14px] rounded-control">
                {errors.form}
              </p>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="mp-desc" className="block text-[14px] font-semibold text-text">
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
                  aria-invalid={errors.description ? true : undefined}
                  aria-describedby={errors.description ? 'mp-desc-error' : undefined}
                  className={`w-full p-3 rounded-control border bg-surface text-text text-[16px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                    errors.description ? 'border-error-text ring-1 ring-error-text' : 'border-edge'
                  }`}
                />
                {errors.description && (
                  <p id="mp-desc-error" className="text-[14px] text-error-text font-medium">{errors.description}</p>
                )}
              </div>

              {/* Map Link */}
              <div className="space-y-1.5">
                <label htmlFor="mp-map" className="block text-[14px] font-semibold text-text">
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
                  inputMode="url"
                  aria-invalid={errors.map_url ? true : undefined}
                  aria-describedby={errors.map_url ? 'mp-map-hint mp-map-error' : 'mp-map-hint'}
                  className={`w-full h-12 px-4 rounded-control border bg-surface text-text text-[16px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-text transition-all ${
                    errors.map_url ? 'border-error-text ring-1 ring-error-text' : 'border-edge'
                  }`}
                />
                <p id="mp-map-hint" className="text-[14px] text-muted">{t('mapHint')}</p>
                {errors.map_url && (
                  <p id="mp-map-error" className="text-[14px] text-error-text font-medium">{errors.map_url}</p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-control border border-edge bg-surface text-text font-semibold text-[15px] cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-12 rounded-control bg-primary text-on-primary font-semibold text-[15px] disabled:opacity-60 cursor-pointer flex items-center justify-center"
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
