import { X, ArrowRight, ArrowLeft, ShieldAlert, Info } from 'lucide-react';
import {
  entityById,
  entityName,
  zoneById,
  edges as edgeData,
  findings,
  attackPaths,
} from '../../data/mockData';
import { iconForEntity, entityTypeLabel, edgeKindLabel } from '../entityVisuals';
import { Badge, SeverityBadge, Mono, SectionLabel, StatusBadge } from '../ui';
import type { EntityType } from '../../data/types';
import { useApp } from '../../state/AppContext';

export function NodeInspector({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const { setView, selectPath } = useApp();
  const entity = entityById(nodeId);
  if (!entity) return null;

  const isFinding = 'title' in entity;
  const type: EntityType = entity.type;
  const Icon = iconForEntity(type, nodeId);

  const outgoing = edgeData.filter((e) => e.source === nodeId);
  const incoming = edgeData.filter((e) => e.target === nodeId);
  const relatedFindings = isFinding ? [] : findings.filter((f) => f.assetId === nodeId || f.relatedEntityIds.includes(nodeId));
  const relatedPaths = attackPaths.filter((p) => p.nodeIds.includes(nodeId));

  const zone = !isFinding && 'zone' in entity ? zoneById(entity.zone) : undefined;

  return (
    <div className="flex h-full w-[360px] shrink-0 flex-col border-l border-border bg-panel animate-slide-in-right">
      {/* header */}
      <div className="flex items-start gap-3 border-b border-border p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface text-cyan">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{entityTypeLabel[type]}</Badge>
            <Mono className="text-[11px] text-faint">{nodeId}</Mono>
          </div>
          <h3 className="mt-1 text-[15px] font-semibold leading-tight text-text">
            {entityName(nodeId)}
          </h3>
        </div>
        <button onClick={onClose} className="shrink-0 text-faint hover:text-text" aria-label="Close inspector">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* type-specific summary */}
        {!isFinding && 'description' in entity && (
          <p className="text-[12.5px] leading-relaxed text-muted">{entity.description}</p>
        )}
        {isFinding && 'description' in entity && (
          <p className="text-[12.5px] leading-relaxed text-muted">{entity.description}</p>
        )}

        {/* meta */}
        <div className="grid grid-cols-2 gap-2">
          {zone && (
            <Meta label="Trust zone" value={zone.name} />
          )}
          {!isFinding && 'ip' in entity && entity.ip && <Meta label="Address" value={entity.ip} mono />}
          {!isFinding && 'host' in entity && entity.host && <Meta label="Host" value={entity.host} mono />}
          {!isFinding && 'principal' in entity && entity.principal && <Meta label="Principal" value={entity.principal} mono />}
          {!isFinding && 'scope' in entity && entity.scope && <Meta label="Scope" value={entity.scope} mono />}
          {!isFinding && 'version' in entity && entity.version && <Meta label="Version" value={entity.version} mono />}
          {isFinding && 'source' in entity && <Meta label="Source" value={entity.source} />}
        </div>

        {/* finding-specific */}
        {isFinding && 'severity' in entity && (
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={entity.severity} />
            <StatusBadge status={entity.status} />
            <Badge tone="neutral">Last seen {('lastObserved' in entity && entity.lastObserved) || '—'}</Badge>
          </div>
        )}

        {/* related findings */}
        {relatedFindings.length > 0 && (
          <div>
            <SectionLabel className="mb-2 flex items-center gap-1.5">
              <ShieldAlert size={12} /> Related findings
            </SectionLabel>
            <div className="space-y-1.5">
              {relatedFindings.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setView('findings')}
                  className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-left hover:border-cyan/40"
                >
                  <Mono className="text-[10.5px] text-faint">{f.id}</Mono>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-text">{f.title}</span>
                  <SeverityBadge severity={f.severity} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* relationships */}
        {(outgoing.length > 0 || incoming.length > 0) && (
          <div>
            <SectionLabel className="mb-2">Relationships</SectionLabel>
            <div className="space-y-1.5">
              {outgoing.map((e) => (
                <RelRow key={e.id} dir="out" kind={edgeKindLabel[e.kind]} label={e.label} other={entityName(e.target)} inferred={e.inferred} />
              ))}
              {incoming.map((e) => (
                <RelRow key={e.id} dir="in" kind={edgeKindLabel[e.kind]} label={e.label} other={entityName(e.source)} inferred={e.inferred} />
              ))}
            </div>
          </div>
        )}

        {/* evidence reference (finding) */}
        {isFinding && 'sourceRef' in entity && (
          <div>
            <SectionLabel className="mb-2">Evidence reference</SectionLabel>
            <div className="rounded-lg border border-border bg-bg px-3 py-2">
              <Mono className="text-[11px] text-muted">{entity.sourceRef}</Mono>
            </div>
          </div>
        )}

        {/* related paths */}
        {relatedPaths.length > 0 && (
          <div>
            <SectionLabel className="mb-2">Appears in attack paths</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {relatedPaths.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    selectPath(p.id);
                    setView('paths');
                  }}
                  className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-cyan hover:border-cyan/40"
                >
                  {p.id}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* confidence + uncertainty */}
        <div className="rounded-lg border border-border bg-surface/50 p-3">
          <SectionLabel className="mb-1.5 flex items-center gap-1.5">
            <Info size={12} /> Confidence & uncertainty
          </SectionLabel>
          {!isFinding && 'confidence' in entity && (
            <p className="text-[12px] text-muted">
              Modeled confidence: <span className="text-text capitalize">{entity.confidence}</span>.
            </p>
          )}
          {isFinding && 'confidenceExplanation' in entity && (
            <p className="text-[12px] leading-relaxed text-muted">{entity.confidenceExplanation}</p>
          )}
          {!isFinding && 'uncertainty' in entity && entity.uncertainty && (
            <p className="mt-1.5 text-[12px] leading-relaxed text-warning/90">{entity.uncertainty}</p>
          )}
          {!(
            ('uncertainty' in entity && entity.uncertainty) ||
            ('confidenceExplanation' in entity)
          ) && <p className="mt-1 text-[11px] text-faint">No additional uncertainty notes recorded.</p>}
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 px-2.5 py-1.5">
      <div className="text-[9.5px] uppercase tracking-wide text-faint">{label}</div>
      <div className={mono ? 'font-mono text-[11.5px] text-text' : 'text-[12px] text-text'}>{value}</div>
    </div>
  );
}

function RelRow({
  dir,
  kind,
  label,
  other,
  inferred,
}: {
  dir: 'in' | 'out';
  kind: string;
  label: string;
  other: string;
  inferred: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5">
      {dir === 'out' ? (
        <ArrowRight size={13} className="shrink-0 text-cyan" />
      ) : (
        <ArrowLeft size={13} className="shrink-0 text-violet" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-text">{kind}</span>
          {inferred && <span className="text-[9px] text-faint">(inferred)</span>}
        </div>
        <div className="truncate text-[11px] text-muted">
          {label} · {other}
        </div>
      </div>
    </div>
  );
}
