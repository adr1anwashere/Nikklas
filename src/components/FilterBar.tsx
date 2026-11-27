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
}

export default function FilterBar({
  courses,
  activeFilters,
  onFilterChange,
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
            <span className="min-w-5 h-5 px-1 rounded-full bg-surface text-on-peach text-[13px] flex items-center justify-center font-semibold" aria-label={t('activeCount', { count: activeCount })}>
              {activeCount}
            </span>
          )}
        </button>

        {/* Quick Chip: Course */}
        {activeCourseName && (
          <span className="inline-flex items-center gap-0.5 h-11 pl-4 pr-1 bg-peach text-on-peach rounded-full shrink-0">
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
          <span className="inline-flex items-center gap-0.5 h-11 pl-4 pr-1 bg-peach text-on-peach rounded-full shrink-0 uppercase">
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
          <span className="inline-flex items-center gap-0.5 h-11 pl-4 pr-1 bg-peach text-on-peach rounded-full shrink-0">
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
          <span className="inline-flex items-center gap-0.5 h-11 pl-4 pr-1 bg-peach text-on-peach rounded-full shrink-0">
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={(e) => { if (e.target === e.currentTarget) setIsSheetOpen(false); }}>
          <div
            ref={sheetRef}
            className="w-full max-w-[480px] bg-surface rounded-t-[28px] border-t border-border p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-5 max-h-[85vh] overflow-y-auto"
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

            {/* 1. Filter by Course */}
            <div className="space-y-1.5">
              <label htmlFor="filter-course" className="block text-[14px] font-semibold text-text">
                {t('filterCourse')}
              </label>
              <select
                id="filter-course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full h-12 px-4 rounded-control border border-edge bg-surface text-text text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary-text"
              >
                <option value="all">{t('allCourses')}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} &mdash; {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Filter by Exam Period */}
            <fieldset className="space-y-1.5">
              <legend className="block text-[14px] font-semibold text-text mb-1.5">
                {t('filterExam')}
              </legend>
              <div className="grid grid-cols-4 gap-2">
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
              <label htmlFor="filter-section" className="block text-[14px] font-semibold text-text">
                {t('filterSection')}
              </label>
              <input
                id="filter-section"
                type="text"
                value={sectionQuery}
                onChange={(e) => setSectionQuery(e.target.value)}
                placeholder={t('filterSectionPlaceholder')}
                className="w-full h-12 px-4 rounded-control border border-edge bg-surface text-text text-[15px] uppercase placeholder:normal-case placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-text"
              />
            </div>

            {/* 4. Filter by Topic Tag */}
            <div className="space-y-1.5">
              <label htmlFor="filter-tag" className="block text-[14px] font-semibold text-text">
                {t('filterTag')}
              </label>
              <input
                id="filter-tag"
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
          </div>
        </div>
      )}
    </div>
  );
}
