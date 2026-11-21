'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Course } from '@/types/database';
import { SessionFilters } from '@/lib/sessions';

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
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 ${
            hasActiveFilters
              ? 'bg-primary text-on-primary border-primary font-bold shadow-xs'
              : 'bg-surface text-text border-border hover:bg-bg'
          }`}
        >
          <span>⚡ {t('title')}</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-on-primary text-primary text-[11px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {/* Quick Chip: Course */}
        {activeCourseName && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-on-primary rounded-full shrink-0 shadow-xs">
            {activeCourseName}
            <button
              type="button"
              onClick={() => onFilterChange({ ...activeFilters, course_id: undefined })}
              className="text-on-primary/70 hover:text-on-primary ml-1"
            >
              &times;
            </button>
          </span>
        )}

        {/* Quick Chip: Exam Period */}
        {activeFilters.exam_period && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-on-primary rounded-full shrink-0 shadow-xs uppercase">
            {activeFilters.exam_period}
            <button
              type="button"
              onClick={() => onFilterChange({ ...activeFilters, exam_period: undefined })}
              className="text-on-primary/70 hover:text-on-primary ml-1"
            >
              &times;
            </button>
          </span>
        )}

        {/* Quick Chip: Section */}
        {activeFilters.section && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-on-primary rounded-full shrink-0 shadow-xs">
            Kelas: {activeFilters.section}
            <button
              type="button"
              onClick={() => onFilterChange({ ...activeFilters, section: undefined })}
              className="text-on-primary/70 hover:text-on-primary ml-1"
            >
              &times;
            </button>
          </span>
        )}

        {/* Quick Chip: Tag */}
        {activeFilters.tag && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-on-primary rounded-full shrink-0 shadow-xs">
            #{activeFilters.tag}
            <button
              type="button"
              onClick={() => onFilterChange({ ...activeFilters, tag: undefined })}
              className="text-on-primary/70 hover:text-on-primary ml-1"
            >
              &times;
            </button>
          </span>
        )}

        {/* Clear All button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="text-primary-text hover:underline text-[12px] font-semibold shrink-0 ml-1 cursor-pointer"
          >
            {t('clear')}
          </button>
        )}
      </div>

      {/* Bottom Sheet Filter Modal */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div
            className="w-full max-w-[480px] bg-surface rounded-t-[28px] border-t border-border p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-display font-bold text-[20px] text-text">
                {t('title')}
              </h3>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-text hover:bg-border transition-colors cursor-pointer"
                aria-label={t('close')}
              >
                &times;
              </button>
            </div>

            {/* 1. Filter by Course */}
            <div className="space-y-1.5">
              <label htmlFor="filter-course" className="block text-[13px] font-semibold text-text">
                {t('filterCourse')}
              </label>
              <select
                id="filter-course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full h-12 px-4 rounded-control border border-border bg-surface text-text text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-primary-text"
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
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-text">
                {t('filterExam')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'all', label: t('allPeriods') },
                  { id: 'quiz', label: 'Kuis' },
                  { id: 'uts', label: 'UTS' },
                  { id: 'uas', label: 'UAS' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedExam(item.id)}
                    className={`h-11 rounded-control text-[13px] font-semibold border transition-all cursor-pointer ${
                      selectedExam === item.id
                        ? 'bg-primary text-on-primary border-primary font-bold shadow-xs'
                        : 'bg-surface text-text border-border hover:bg-bg'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Filter by Section */}
            <div className="space-y-1.5">
              <label htmlFor="filter-section" className="block text-[13px] font-semibold text-text">
                {t('filterSection')}
              </label>
              <input
                id="filter-section"
                type="text"
                value={sectionQuery}
                onChange={(e) => setSectionQuery(e.target.value)}
                placeholder={t('filterSectionPlaceholder')}
                className="w-full h-12 px-4 rounded-control border border-border bg-surface text-text text-[15px] uppercase placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-text"
              />
            </div>

            {/* 4. Filter by Topic Tag */}
            <div className="space-y-1.5">
              <label htmlFor="filter-tag" className="block text-[13px] font-semibold text-text">
                {t('filterTag')}
              </label>
              <input
                id="filter-tag"
                type="text"
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder={t('filterTagPlaceholder')}
                className="w-full h-12 px-4 rounded-control border border-border bg-surface text-text text-[15px] placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-text"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border flex gap-3">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 h-12 rounded-control border border-border bg-surface text-text font-semibold text-[14px] hover:bg-bg active:scale-95 transition-all cursor-pointer"
              >
                {t('clear')}
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-2 h-12 rounded-control bg-primary text-on-primary font-semibold text-[14px] shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
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
