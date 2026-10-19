import { ArrowRight, Layers, Footprints, ShieldOff, Crosshair, LogIn } from 'lucide-react';
import type { AttackPath } from '../../data/types';
import { scorePath } from '../../data/scoring';
import { assetById } from '../../data/mockData';
import {
  Badge,
  FeasibilityBadge,
  LikelihoodBadge,
  Mono,
  Tooltip,
  Meter,
} from '../ui';
import { ScoreTooltipContent } from './ScoreTooltip';
import { cn } from '../../lib/cn';

export function PathCard({
  path,
  rank,
  blocked,
  onOpen,
}: {
  path: AttackPath;
  rank?: number;
  blocked?: boolean;
  onOpen: () => void;
}) {
  const score = scorePath(path);
  const rejected = path.feasibility === 'rejected';
  const target = assetById(path.targetAssetId);

  return (
    <button
      onClick={onOpen}
      className={cn(
        'group w-full rounded-xl border bg-panel p-4 text-left transition-all hover:border-cyan/40 hover:bg-surface/40',
        blocked ? 'border-success/40' : 'border-border',
      )}
    >
      <div className="flex items-start gap-3">
        {typeof rank === 'number' && !rejected && (
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-[13px] font-bold text-cyan">
            {rank}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Mono className="text-[10.5px] text-faint">{path.id}</Mono>
            <FeasibilityBadge status={path.feasibility} />
            {blocked && <Badge tone="success" dot>Blocked in simulation</Badge>}
          </div>
          <h3 className="mt-1 text-[14.5px] font-semibold leading-tight text-text group-hover:text-white">
            {path.title}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11.5px] text-muted">
            <LogIn size={12} className="text-faint" />
            <span>{path.startingAccess}</span>
            <ArrowRight size={11} className="text-faint" />
            <Crosshair size={12} className="text-faint" />
            <span className="text-text">{target?.name}</span>
          </p>
        </div>

        {/* Score */}
        <div className="w-28 shrink-0 text-right">
          {rejected ? (
            <div className="rounded-lg border border-critical/30 bg-critical/5 px-2 py-1">
              <div className="flex items-center justify-center gap-1 text-[11px] text-critical">
                <ShieldOff size={12} /> Not ranked
              </div>
            </div>
          ) : (
            <Tooltip content={<ScoreTooltipContent breakdown={score} />} side="bottom">
              <div className="rounded-lg border border-border bg-surface px-2 py-1 hover:border-cyan/40">
                <div className="text-[10px] uppercase tracking-wide text-faint">Demo score</div>
                <div className="text-[20px] font-bold leading-none text-text tabular-nums">{score.total}</div>
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Metrics row */}
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-3 sm:grid-cols-4">
        <Metric icon={<Footprints size={12} />} label="Steps" value={`${path.steps.length}`} />
        <Metric icon={<Layers size={12} />} label="Zones crossed" value={`${path.zonesCrossed.length}`} />
        <Metric label="Impact" value={<Meter value={path.impact} tone="critical" />} wide />
        <Metric label="Effort" value={<Meter value={path.effort} tone="warning" />} wide />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-faint">Likelihood</span>
        <LikelihoodBadge likelihood={path.likelihood} />
        <span className="ml-1 text-[11px] text-faint">Evidence</span>
        <Badge tone={path.evidenceConfidence === 'high' ? 'success' : path.evidenceConfidence === 'moderate' ? 'warning' : 'critical'}>
          {path.evidenceConfidence}
        </Badge>
        {rejected && path.rejectionReason && (
          <span className="ml-auto max-w-[280px] truncate text-[11px] text-critical" title={path.rejectionReason}>
            {path.rejectionReason}
          </span>
        )}
      </div>
    </button>
  );
}

function Metric({
  icon,
  label,
  value,
  wide,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn(wide && 'col-span-1')}>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-faint">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-[13px] font-semibold text-text">{value}</div>
    </div>
  );
}
