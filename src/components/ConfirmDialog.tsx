'use client';
// Our own confirm dialog (never window.confirm). Native <dialog>: focus trap, Escape and inert page for free.
import { useEffect, useRef } from 'react';

export default function ConfirmDialog({
  open, title, confirmLabel, cancelLabel, busy = false, danger = false, onConfirm, onCancel,
}: {
  open: boolean; title: string; confirmLabel: string; cancelLabel: string;
  busy?: boolean; danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => { e.preventDefault(); if (!busy) onCancel(); }}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}
      className="confirm-dialog m-auto w-[calc(100%-2.5rem)] max-w-[420px] bg-surface text-text border border-border rounded-[28px] p-0 shadow-2xl"
    >
      <div className="p-6 md:p-7">
        <h2 id="confirm-title" className="font-display font-normal text-[22px] leading-snug">{title}</h2>
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <button type="button" autoFocus onClick={onCancel} disabled={busy}
            className="flex-1 h-12 rounded-control border border-edge bg-surface text-text font-semibold text-[15px] cursor-pointer">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy}
            className={`flex-1 h-12 rounded-control font-semibold text-[15px] cursor-pointer disabled:opacity-60 ${danger ? 'bg-error-text text-surface' : 'bg-primary text-on-primary'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
