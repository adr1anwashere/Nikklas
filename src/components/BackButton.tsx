'use client';
import Icon from '@/components/Icon';

export default function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 min-h-11 -ml-2 px-2 rounded-control text-[15px] font-semibold text-primary-text hover:bg-sand cursor-pointer">
      <Icon name="arrowLeft" className="text-[18px]" />
      {label}
    </button>
  );
}
