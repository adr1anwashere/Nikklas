'use client';

import Icon from '@/components/Icon';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Course } from '@/types/database';
import { SessionFilters } from '@/lib/sessions';
import { useSheet } from '@/components/useSheet';

interface FilterBarProps {
  courses: Course[];
  activeFilters: SessionFilters;
  onFilterChange: (filters: SessionFilters) => void;
  variant?: 'bar' | 'panel';
}

export default function FilterBar({
  courses,
  activeFilters,
  onFilterChange,
  variant = 'bar',
}: FilterBarProps) {
  const t = useTranslations('filters');
  const tSession = useTranslations('session');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Local state for draft filters inside the bottom sheet
  const [selectedCourse, setSelectedCourse] = useState(activeFilters.course_id || 'all');
  const [selectedExam, setSelectedExam] = useState(activeFilters.exam_period || 'all');
  const [sectionQuery, setSectionQuery] = useState(activeFilters.section || '');
  const [tagQuery, setTagQuery] = useState(activeFilters.tag || '');


  const hasActiveFilters = Boolean(
    (activeFilters.course_id && activeFilters.course_id !== 'all') ||
    (activeFilters.exam_period && activeFilters.exam_period !== 'all') ||
    activeFilters.section ||
    activeFilters.tag
  );

  const activeCount = [
    activeFilters.course_id && activeFilters.course_id !== 'all',
    activeFilters.exam_period && activeFilters.exam_period !== 'all',
    Boolean(activeFilters.section),
    Boolean(activeFilters.tag),
  ].filter(Boolean).length;

  const handleApply = () => {
    onFilterChange({
      course_id: selectedCourse === 'all' ? undefined : selectedCourse,
      exam_period: selectedExam === 'all' ? undefined : selectedExam,
      section: sectionQuery.trim() ? sectionQuery.trim() : undefined,
      tag: tagQuery.trim() ? tagQuery.trim() : undefined,
    });
    setIsSheetOpen(false);
  };

  const handleClear = () => {
    setSelectedCourse('all');
    setSelectedExam('all');
    setSectionQuery('');
    setTagQuery('');
    onFilterChange({});
    setIsSheetOpen(false);
  };

  const sheetRef = useSheet(isSheetOpen, () => setIsSheetOpen(false));

  // Get active course name for pill
  const activeCourseName = courses.find((c) => c.id === activeFilters.course_id)?.code;
  const idp = variant === 'panel' ? 'panel-' : '';

  const formBody = (
    <>
      {/* 1. Filter by Course */}
      <div className="space-y-1.5">
        <label htmlFor={`${idp}filter-course`} className="block text-[14px] font-semibold text-text">
          {t('filterCourse')}
        </label>
        <select
          id={`${idp}filter-course`}
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full h-12 px-4 rounded-control border border-edge bg-surface text-text text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary-text"
        >
          <option value="all">{t('allCourses')}</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} · {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Filter by Exam Period */}
      <fieldset className="space-y-1.5">
        <legend className="block text-[14px] font-semibold text-text mb-1.5">
          {t('filterExam')}
        </legend>
        <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
          {[
            { id: 'all', label: t('allPeriods') },
            { id: 'quiz', label: tSession('examPeriodQuiz') },
            { id: 'uts', label: 'UTS' },
            { id: 'uas', label: 'UAS' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedExam(item.id)}
              aria-pressed={selectedExam === item.id}
              className={`h-11 rounded-control text-[13px] font-semibold border transition-all cursor-pointer ${
                selectedExam === item.id
                  ? 'bg-peach text-on-peach border-peach font-semibold shadow-xs'
                  : 'bg-surface text-text border-edge hover:bg-sand'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 3. Filter by Section */}
      <div className="space-y-1.5">
        <label htmlFor={`${idp}filter-section`} className="block text-[14px] font-semibold text-text">
          {t('filterSection')}
        </label>
        <input
          id={`${idp}filter-section`}
          type="text"
          value={sectionQuery}
          onChange={(e) => setSectionQuery(e.target.value)}
          placeholder={t('filterSectionPlaceholder')}
          className="w-full h-12 px-4 rounded-control border border-edge bg-surface text-text text-[15px] uppercase placeholder:normal-case placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-text"
        />
      </div>

      {/* 4. Filter by Topic Tag */}
      <div className="space-y-1.5">
        <label htmlFor={`${idp}filter-tag`} className="block text-[14px] font-semibold text-text">
          {t('filterTag')}
        </label>
        <input
          id={`${idp}filter-tag`}
          type="text"
          value={tagQuery}
          onChange={(e) => setTagQuery(e.target.value)}
          placeholder={t('filterTagPlaceholder')}
          className="w-full h-12 px-4 rounded-control border border-edge bg-surface text-text text-[16px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-text"
        />
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-border flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 h-12 rounded-control border border-edge bg-surface text-text font-semibold text-[15px] cursor-pointer"
        >
          {t('clear')}
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="flex-2 h-12 rounded-control bg-primary text-on-primary font-semibold text-[15px] cursor-pointer"
        >
          {t('apply')}
        </button>
      </div>
    </>
  );

  if (variant === 'panel') {
    // Desktop: filters apply the moment you pick them. Courses and periods are chips, text applies on Enter.
    const set = (patch: SessionFilters) => onFilterChange({ ...activeFilters, ...patch });
    const course = activeFilters.course_id ?? 'all';
    const exam = activeFilters.exam_period ?? 'all';
    const periods = [
      { id: 'all', label: t('allPeriods') },
      { id: 'quiz', label: tSession('examPeriodQuiz') },
      { id: 'uts', label: 'UTS' },
      { id: 'uas', label: 'UAS' },
    ];
    const examIndex = Math.max(0, periods.findIndex((x) => x.id === exam));
    return (
      <aside aria-labelledby="panel-filter-title" className="sticky top-6 space-y-7">
        <div className="flex items-baseline justify-between">
          <h2 id="panel-filter-title" className="font-display font-normal text-[24px] text-text">{t('title')}</h2>
          {hasActiveFilters && (
            <button type="button" onClick={handleClear} className="text-[14px] font-semibold text-primary-text underline-draw cursor-pointer">{t('clear')}</button>
          )}
        </div>

        <fieldset>
          <legend className="text-[13px] font-semibold text-muted mb-3">{t('filterCourse')}</legend>
          <div className="flex flex-wrap gap-2">
            {[{ id: 'all', code: t('allCourses'), name: '' }, ...courses].map((c) => {
              const on = course === c.id;
              return (
                <button key={c.id} type="button" aria-pressed={on} onClick={() => set({ course_id: c.id === 'all' ? undefined : c.id })}
                  title={c.name || undefined}
                  className={`pick h-10 px-4 rounded-full text-[14px] font-semibold border cursor-pointer ${on ? 'is-on bg-text text-bg border-text' : 'bg-transparent text-text-2 border-border hover:border-edge'}`}>
                  {c.code}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-[13px] font-semibold text-muted mb-3">{t('filterExam')}</legend>
          <div className="seg relative grid grid-cols-4 p-1 rounded-full bg-sand">
            <span aria-hidden="true" className="seg-thumb absolute top-1 bottom-1 left-1 w-[calc(25%-2px)] rounded-full bg-surface shadow-sm"
              style={{ transform: `translateX(${examIndex * 100}%)` }} />
            {periods.map((x) => (
              <button key={x.id} type="button" aria-pressed={exam === x.id} onClick={() => set({ exam_period: x.id === 'all' ? undefined : x.id })}
                className={`relative z-10 h-9 rounded-full text-[13px] font-semibold cursor-pointer transition-colors ${exam === x.id ? 'text-text' : 'text-muted hover:text-text'}`}>
                {x.id === 'all' ? t('all') : x.label}
              </button>
            ))}
          </div>
        </fieldset>

        {[
          { id: 'section', label: t('filterSection'), ph: t('filterSectionPlaceholder'), v: sectionQuery, setV: setSectionQuery, upper: true },
          { id: 'tag', label: t('filterTag'), ph: t('filterTagPlaceholder'), v: tagQuery, setV: setTagQuery, upper: false },
        ].map((f) => (
          <div key={f.id}>
            <label htmlFor={`panel-filter-${f.id}`} className="block text-[13px] font-semibold text-muted mb-1">{f.label}</label>
            <input id={`panel-filter-${f.id}`} type="text" value={f.v} placeholder={f.ph}
              onChange={(e) => f.setV(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') set({ [f.id]: f.v.trim() || undefined }); }}
              onBlur={() => { if ((activeFilters[f.id as 'section' | 'tag'] ?? '') !== f.v.trim()) set({ [f.id]: f.v.trim() || undefined }); }}
              className={`bare-line w-full h-11 bg-transparent border-0 border-b border-edge rounded-none px-0 text-[16px] text-text placeholder:text-muted/70 focus:border-primary ${f.upper ? 'uppercase placeholder:normal-case' : ''}`} />
          </div>
        ))}
      </aside>
    );
  }

  return (
    <div className="space-y-2">
      {/* Horizontal Scrollable Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-[13px] font-semibold">
        {/* Main Filter Button (opens sheet) */}
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          aria-haspopup="dialog"
          className={`flex items-center gap-1.5 h-11 px-4 rounded-full border cursor-pointer shrink-0 ${
            hasActiveFilters
              ? 'bg-peach text-on-peach border-peach font-semibold shadow-xs'
              : 'bg-surface text-text border-edge hover:bg-sand'
          }`}
        >
          <Icon name="sliders" className="text-[16px]" />
          <span>{t('title')}</span>
          {activeCount > 0 && (
            <span className="min-w-5 h-5 px-1 rounded-full bg-on-peach text-peach text-[13px] flex items-center justify-center font-semibold" aria-label={t('activeCount', { count: activeCount })}>
              {activeCount}
            </span>
          )}
        </button>

        {/* Quick Chip: Course */}
        {activeCourseName && (
          <span className="chip-in inline-flex items-center gap-0.5 h-11 pl-4 pr-1 bg-peach text-on-peach rounded-full shrink-0">
            {activeCourseName}
            <button
              type="button"
              onClick={() => onFilterChange({ ...activeFilters, course_id: undefined })}
              aria-label={t('removeFilter', { name: activeCourseName ?? '' })}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface/50 cursor-pointer"
            >
              <Icon name="x" />
            </button>
          </span>
        )}

        {/* Quick Chip: Exam Period */}
        {activeFilters.exam_period && (
          <span className="chip-in inline-flex items-center gap-0.5 h-11 pl-4 pr-1 bg-peach text-on-peach rounded-full shrink-0 uppercase">
            {activeFilters.exam_period}
            <button
              type="button"
              onClick={() => onFilterChange({ ...activeFilters, exam_period: undefined })}
              aria-label={t('removeFilter', { name: activeFilters.exam_period?.toUpperCase() ?? '' })}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface/50 cursor-pointer"
            >
              <Icon name="x" />
            </button>
          </span>
        )}

        {/* Quick Chip: Section */}
        {activeFilters.section && (
          <span className="chip-in inline-flex items-center gap-0.5 h-11 pl-4 pr-1 bg-peach text-on-peach rounded-full shrink-0">
            {t('sectionChip', { section: activeFilters.section })}
            <button
              type="button"
              onClick={() => onFilterChange({ ...activeFilters, section: undefined })}
              aria-label={t('removeFilter', { name: t('sectionChip', { section: activeFilters.section ?? '' }) })}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface/50 cursor-pointer"
            >
              <Icon name="x" />
            </button>
          </span>
        )}

        {/* Quick Chip: Tag */}
        {activeFilters.tag && (
          <span className="chip-in inline-flex items-center gap-0.5 h-11 pl-4 pr-1 bg-peach text-on-peach rounded-full shrink-0">
            #{activeFilters.tag}
            <button
              type="button"
              onClick={() => onFilterChange({ ...activeFilters, tag: undefined })}
              aria-label={t('removeFilter', { name: `#${activeFilters.tag}` })}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface/50 cursor-pointer"
            >
              <Icon name="x" />
            </button>
          </span>
        )}

        {/* Clear All button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="h-11 px-3 rounded-full text-primary-text hover:bg-sand text-[14px] font-semibold shrink-0 cursor-pointer"
          >
            {t('clear')}
          </button>
        )}
      </div>

      {/* Bottom Sheet Filter Modal */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 md:p-6" onClick={(e) => { if (e.target === e.currentTarget) setIsSheetOpen(false); }}>
          <div
            ref={sheetRef}
            className="w-full max-w-[480px] md:max-w-[520px] bg-surface rounded-t-[28px] md:rounded-[28px] border-t md:border border-border p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-5 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h2 id="filter-title" className="font-display font-semibold text-[20px] text-text">
                {t('title')}
              </h2>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="w-11 h-11 rounded-full bg-sand flex items-center justify-center text-text hover:bg-border cursor-pointer"
                aria-label={t('close')}
              >
                <Icon name="x" className="text-[18px]" />
              </button>
            </div>

            {formBody}
          </div>
        </div>
      )}
    </div>
  );
}
