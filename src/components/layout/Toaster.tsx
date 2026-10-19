import { CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { cn } from '../../lib/cn';

export function Toaster() {
  const { toasts, dismissToast, analysisStatus } = useApp();
  // Nudge toasts up while the analysis overlay occupies the bottom-right.
  const lifted = analysisStatus === 'running';

  return (
    <div
      className={cn(
        'pointer-events-none fixed right-5 z-[60] flex w-[340px] flex-col gap-2',
        lifted ? 'bottom-[300px]' : 'bottom-5',
      )}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-border bg-surface-2 px-3.5 py-3 shadow-2xl animate-slide-in-right"
        >
          <span className={cn('mt-0.5 shrink-0', t.tone === 'success' ? 'text-success' : 'text-cyan')}>
            {t.tone === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />}
          </span>
          <p className="flex-1 text-[12.5px] leading-snug text-text">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            className="shrink-0 text-faint hover:text-text"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
