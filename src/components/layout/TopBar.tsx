import { ChevronDown, Play, RotateCcw, FlaskConical, CircleDot, Loader2 } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { Button } from '../ui';
import { useApp, ANALYSIS_STAGES } from '../../state/AppContext';
import { ENVIRONMENT_NAME, ENVIRONMENT_STATUS } from '../../data/mockData';

export function TopBar() {
  const { runAnalysis, resetDemo, analysisStatus, analysisStage } = useApp();
  const running = analysisStatus === 'running';

  return (
    <header className="no-print relative z-30 flex h-16 items-center gap-4 border-b border-border bg-panel px-5">
      {/* Environment selector */}
      <button
        className="group flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-1.5 hover:bg-surface-2 transition-colors"
        title="Environment selector (single lab environment in this demo)"
      >
        <span className="grid h-6 w-6 place-items-center rounded-md bg-cyan/15 text-cyan">
          <CircleDot size={13} />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-[13px] font-semibold text-text">{ENVIRONMENT_NAME}</span>
          <span className="block text-[10px] text-muted">{ENVIRONMENT_STATUS}</span>
        </span>
        <ChevronDown size={14} className="ml-1 text-faint" />
      </button>

      {/* Status pill */}
      <div className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 lg:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
        <span className="text-[11px] font-medium text-success">Environment online</span>
      </div>

      {/* Search */}
      <div className="flex flex-1 justify-center px-2">
        <GlobalSearch />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <Button variant="ghost" size="sm" onClick={resetDemo} title="Restore all initial data, filters and mitigations">
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Reset demo</span>
        </Button>
        <Button variant="primary" onClick={runAnalysis} disabled={running} title="Simulate the analysis pipeline">
          {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
          <span>{running ? 'Analyzing…' : 'Run Analysis'}</span>
        </Button>

        {/* Demo badge */}
        <div
          className="flex items-center gap-1.5 rounded-lg border border-violet/30 bg-violet/10 px-2.5 py-1.5"
          title="This is a laboratory demonstration. All analysis is simulated from predefined data."
        >
          <FlaskConical size={13} className="text-violet" />
          <span className="hidden text-[11px] font-medium leading-tight text-violet md:block">
            Laboratory demo · Simulated analysis
          </span>
        </div>
      </div>

      {/* Progress bar during analysis */}
      {running && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-surface-2">
          <div
            className="h-full bg-gradient-to-r from-cyan to-violet transition-all duration-500 ease-out"
            style={{ width: `${(analysisStage / ANALYSIS_STAGES.length) * 100}%` }}
          />
        </div>
      )}
    </header>
  );
}
