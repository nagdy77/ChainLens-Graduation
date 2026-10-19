import { Check, Loader2, FlaskConical } from 'lucide-react';
import { useApp, ANALYSIS_STAGES } from '../../state/AppContext';
import { cn } from '../../lib/cn';

export function AnalysisOverlay() {
  const { analysisStatus, analysisStage } = useApp();
  if (analysisStatus !== 'running') return null;

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 w-[320px] animate-slide-in-right">
      <div className="pointer-events-auto overflow-hidden rounded-xl border border-border bg-surface-2 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <FlaskConical size={15} className="text-violet" />
          <span className="text-[13px] font-semibold text-text">Simulated analysis running</span>
        </div>
        <ul className="px-4 py-3 space-y-2.5">
          {ANALYSIS_STAGES.map((stage, i) => {
            const done = analysisStage > i;
            const current = analysisStage === i;
            return (
              <li key={stage} className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px]',
                    done
                      ? 'border-success/40 bg-success/15 text-success'
                      : current
                        ? 'border-cyan/40 bg-cyan/15 text-cyan'
                        : 'border-border bg-surface text-faint',
                  )}
                >
                  {done ? <Check size={11} /> : current ? <Loader2 size={11} className="animate-spin" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'text-[12px] leading-tight',
                    done ? 'text-muted line-through/0' : current ? 'text-text font-medium' : 'text-faint',
                  )}
                >
                  {stage}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-border px-4 py-2">
          <p className="text-[10.5px] text-faint">Existing data stays visible during analysis.</p>
        </div>
      </div>
    </div>
  );
}
