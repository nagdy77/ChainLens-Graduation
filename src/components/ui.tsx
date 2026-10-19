import type { ReactNode } from 'react';
import { useState, useRef, useId } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../lib/cn';
import type {
  Severity,
  Confidence,
  ConfirmationStatus,
  FeasibilityStatus,
  Likelihood,
} from '../data/types';

/* ------------------------------ Card ------------------------------ */
export function Card({
  children,
  className,
  as: As = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}) {
  return (
    <As
      className={cn(
        'rounded-[12px] border border-border bg-panel',
        className,
      )}
    >
      {children}
    </As>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
      <div className="flex items-start gap-2.5 min-w-0">
        {icon && <span className="mt-0.5 text-muted shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text leading-tight truncate">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted leading-snug">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------------------------- Section ----------------------------- */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[0.12em] text-faint',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------ Mono ------------------------------ */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('font-mono text-[12.5px] tracking-tight', className)}>{children}</span>
  );
}

/* ----------------------------- Badge ------------------------------ */
export function Badge({
  children,
  tone = 'neutral',
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'cyan' | 'violet' | 'success' | 'warning' | 'critical' | 'info';
  className?: string;
  dot?: boolean;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-surface text-muted border-border',
    cyan: 'bg-cyan/10 text-cyan border-cyan/30',
    violet: 'bg-violet/10 text-violet border-violet/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    critical: 'bg-critical/10 text-critical border-critical/30',
    info: 'bg-info/10 text-info border-info/30',
  };
  const dotColor: Record<string, string> = {
    neutral: 'bg-faint',
    cyan: 'bg-cyan',
    violet: 'bg-violet',
    success: 'bg-success',
    warning: 'bg-warning',
    critical: 'bg-critical',
    info: 'bg-info',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColor[tone])} />}
      {children}
    </span>
  );
}

const severityTone: Record<Severity, 'critical' | 'warning' | 'success' | 'info'> = {
  critical: 'critical',
  high: 'critical',
  medium: 'warning',
  low: 'info',
};
export function SeverityBadge({ severity }: { severity: Severity }) {
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);
  return (
    <Badge tone={severityTone[severity]} dot>
      {label}
    </Badge>
  );
}

const confidenceTone: Record<Confidence, 'success' | 'warning' | 'critical'> = {
  high: 'success',
  moderate: 'warning',
  low: 'critical',
};
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const label = confidence.charAt(0).toUpperCase() + confidence.slice(1);
  return <Badge tone={confidenceTone[confidence]}>{label} confidence</Badge>;
}

const statusTone: Record<ConfirmationStatus, 'success' | 'cyan' | 'warning'> = {
  confirmed: 'success',
  inferred: 'cyan',
  assumed: 'warning',
};
const statusLabel: Record<ConfirmationStatus, string> = {
  confirmed: 'Confirmed',
  inferred: 'Inferred',
  assumed: 'Assumed',
};
export function StatusBadge({ status }: { status: ConfirmationStatus }) {
  return (
    <Badge tone={statusTone[status]} dot>
      {statusLabel[status]}
    </Badge>
  );
}

const feasTone: Record<FeasibilityStatus, 'success' | 'warning' | 'critical'> = {
  feasible: 'success',
  conditional: 'warning',
  rejected: 'critical',
};
const feasLabel: Record<FeasibilityStatus, string> = {
  feasible: 'Feasible',
  conditional: 'Conditional',
  rejected: 'Rejected',
};
export function FeasibilityBadge({ status }: { status: FeasibilityStatus }) {
  return (
    <Badge tone={feasTone[status]} dot>
      {feasLabel[status]}
    </Badge>
  );
}

const likelihoodTone: Record<Likelihood, 'critical' | 'warning' | 'success'> = {
  elevated: 'critical',
  moderate: 'warning',
  low: 'success',
};
export function LikelihoodBadge({ likelihood }: { likelihood: Likelihood }) {
  const label = likelihood.charAt(0).toUpperCase() + likelihood.slice(1);
  return <Badge tone={likelihoodTone[likelihood]}>{label}</Badge>;
}

/* ----------------------------- Button ----------------------------- */
export function Button({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  title,
  type = 'button',
  'aria-pressed': ariaPressed,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'default' | 'ghost' | 'danger' | 'violet';
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit';
  'aria-pressed'?: boolean;
}) {
  const variants: Record<string, string> = {
    primary:
      'bg-cyan text-[#042029] hover:bg-cyan/90 border-transparent font-semibold shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]',
    violet: 'bg-violet text-[#1a1030] hover:bg-violet/90 border-transparent font-semibold',
    default: 'bg-surface text-text hover:bg-surface-2 border-border',
    ghost: 'bg-transparent text-muted hover:text-text hover:bg-surface border-transparent',
    danger: 'bg-transparent text-critical hover:bg-critical/10 border-critical/30',
  };
  const sizes: Record<string, string> = {
    sm: 'h-7 px-2.5 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-[13px] gap-2',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={ariaPressed}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ---------------------------- Tooltip ----------------------------- */
export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode;
  children?: ReactNode;
  side?: 'top' | 'bottom';
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef<number | null>(null);
  const show = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    timer.current = window.setTimeout(() => setOpen(false), 80);
  };
  return (
    <span className="relative inline-flex">
      <span
        tabIndex={0}
        role="button"
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex cursor-help text-muted hover:text-text"
      >
        {children ?? <Info size={14} />}
      </span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'absolute z-50 w-64 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[11.5px] leading-relaxed text-muted shadow-xl left-1/2 -translate-x-1/2',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

/* --------------------------- Empty state -------------------------- */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-border bg-panel/50 px-6 py-12 text-center">
      <div className="mb-3 text-faint">{icon}</div>
      <h4 className="text-sm font-semibold text-text">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-muted leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* --------------------------- Segmented ---------------------------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-panel p-0.5" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md font-medium transition-colors',
            size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
            value === o.value
              ? 'bg-surface-2 text-text'
              : 'text-muted hover:text-text',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Meter ----------------------------- */
export function Meter({
  value,
  max = 5,
  tone = 'cyan',
  label,
}: {
  value: number;
  max?: number;
  tone?: 'cyan' | 'violet' | 'warning' | 'critical' | 'success';
  label?: string;
}) {
  const pct = Math.round((value / max) * 100);
  const toneColor: Record<string, string> = {
    cyan: 'bg-cyan',
    violet: 'bg-violet',
    warning: 'bg-warning',
    critical: 'bg-critical',
    success: 'bg-success',
  };
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
        <div className={cn('h-full rounded-full', toneColor[tone])} style={{ width: `${pct}%` }} />
      </div>
      {label && <span className="text-[11px] text-muted tabular-nums w-16 text-right">{label}</span>}
    </div>
  );
}
