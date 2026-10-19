import { X, FileText, Link2, ListChecks, Route, ShieldCheck, Quote } from 'lucide-react';
import type { Finding } from '../../data/types';
import { SeverityBadge, StatusBadge, ConfidenceBadge, Badge, Mono, SectionLabel, Button } from '../ui';
import { entityName, pathById } from '../../data/mockData';
import { useApp } from '../../state/AppContext';

export function EvidenceDrawer({ finding, onClose }: { finding: Finding; onClose: () => void }) {
  const { setView, selectPath, selectNode, focusEntity } = useApp();

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 animate-fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label={`Evidence for ${finding.id}`}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col border-l border-border bg-panel shadow-2xl animate-slide-in-right"
      >
        {/* header */}
        <div className="flex items-start gap-3 border-b border-border p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-critical/30 bg-critical/10 text-critical">
            <FileText size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Mono className="text-[11px] text-faint">{finding.id}</Mono>
              <Badge tone="neutral">{finding.source}</Badge>
            </div>
            <h2 className="mt-1 text-[16px] font-semibold leading-tight text-text">{finding.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SeverityBadge severity={finding.severity} />
              <StatusBadge status={finding.status} />
              <ConfidenceBadge confidence={finding.confidence} />
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-faint hover:text-text" aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* severity vs confidence note */}
          <div className="rounded-lg border border-border bg-surface/50 px-3 py-2.5">
            <p className="text-[11.5px] leading-relaxed text-muted">
              <span className="font-medium text-text">Severity</span> ({finding.severity}) describes impact in isolation;{' '}
              <span className="font-medium text-text">evidence confidence</span> ({finding.confidence}) describes how
              strongly it is supported. They are tracked separately.
            </p>
          </div>

          {/* description */}
          <Section title="Plain-language description" icon={<FileText size={13} />}>
            <p className="text-[13px] leading-relaxed text-muted">{finding.description}</p>
          </Section>

          {/* excerpt */}
          <Section title="Evidence excerpt (mock)" icon={<Quote size={13} />}>
            <pre className="overflow-x-auto rounded-lg border border-border bg-bg px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-cyan/90 whitespace-pre-wrap">
              {finding.evidenceExcerpt}
            </pre>
          </Section>

          {/* source ref */}
          <Section title="Source reference" icon={<Link2 size={13} />}>
            <div className="rounded-lg border border-border bg-surface px-3 py-2">
              <Mono className="text-[11.5px] text-muted">{finding.sourceRef}</Mono>
            </div>
            <p className="mt-1.5 text-[11px] text-faint">Observed {finding.lastObserved}.</p>
          </Section>

          {/* preconditions */}
          <Section title="Preconditions" icon={<ListChecks size={13} />}>
            <ul className="space-y-1.5">
              {finding.preconditions.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] text-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-faint" />
                  {p}
                </li>
              ))}
            </ul>
          </Section>

          {/* related entities */}
          <Section title="Related graph entities" icon={<ShieldCheck size={13} />}>
            <div className="flex flex-wrap gap-1.5">
              {finding.relatedEntityIds.map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    selectNode(id);
                    focusEntity(id);
                    setView('graph');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11.5px] text-text hover:border-cyan/40"
                >
                  <Mono className="text-[10px] text-faint">{id}</Mono>
                  {entityName(id)}
                </button>
              ))}
            </div>
          </Section>

          {/* confidence explanation */}
          <Section title="Confidence explanation" icon={<ShieldCheck size={13} />}>
            <p className="text-[12.5px] leading-relaxed text-muted">{finding.confidenceExplanation}</p>
          </Section>

          {/* relevant paths */}
          {finding.relatedPathIds.length > 0 && (
            <Section title="Relevant attack paths" icon={<Route size={13} />}>
              <div className="space-y-1.5">
                {finding.relatedPathIds.map((pid) => {
                  const p = pathById(pid);
                  if (!p) return null;
                  return (
                    <button
                      key={pid}
                      onClick={() => {
                        selectPath(pid);
                        setView('paths');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left hover:border-cyan/40"
                    >
                      <Mono className="text-[10.5px] text-faint">{p.id}</Mono>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-text">{p.title}</span>
                      <Badge tone={p.feasibility === 'rejected' ? 'critical' : 'success'}>{p.feasibility}</Badge>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        <div className="border-t border-border p-4">
          <Button variant="default" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <SectionLabel className="mb-2 flex items-center gap-1.5">
        {icon} {title}
      </SectionLabel>
      {children}
    </div>
  );
}
